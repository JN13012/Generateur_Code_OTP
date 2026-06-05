import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { EnvironmentVariables } from 'src/_utils/config/env.config';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { IpRateLimitRepository } from './ip-rate-limit.repository';
import { OtpRepository } from './otp.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly otpRepository: OtpRepository,
    private readonly ipRateLimitRepository: IpRateLimitRepository,
  ) {}

  async getAll() {
    return this.otpRepository.findAll();
  }

  async deleteAll() {
    return this.otpRepository.deleteAll();
  }

  async generateLimiting(generateOtpDto: GenerateOtpDto, ip: string) {
    const phone = generateOtpDto.phone.trim();
    const normalizedGenerateOtpDto = { ...generateOtpDto, phone };
    const otpRecord = await this.otpRepository.findOne(phone);
    const now = new Date();

    let hourWindowStart = otpRecord?.hourWindowStart
      ? new Date(otpRecord.hourWindowStart)
      : now;
    let requestCountHour = otpRecord?.requestCountHour ?? 0;

    if (otpRecord && otpRecord.expiresAt > now) {
      throw new BadRequestException(
        `Can't send another code while already one is active. Wait 3 minutes for send new code.`,
      );
    }

    if (now.getTime() - hourWindowStart.getTime() < 3600_000) {
      if (requestCountHour >= 5) {
        throw new BadRequestException('Too many requests. Try later.');
      }
      requestCountHour += 1;
    } else {
      hourWindowStart = now;
      requestCountHour = 1;
    }

    await this.assertIpRateLimit(ip, now);

    return this.generateOtp(
      normalizedGenerateOtpDto,
      now,
      hourWindowStart,
      requestCountHour,
    );
  }

  private async assertIpRateLimit(ip: string, now: Date) {
    const ipRecord = await this.ipRateLimitRepository.findOne(ip);
    let ipWindowStart = ipRecord?.windowStart
      ? new Date(ipRecord.windowStart)
      : now;
    let ipRequestCountHour = ipRecord?.requestCountHour ?? 0;

    if (ipRecord?.blockedUntil && ipRecord.blockedUntil > now) {
      throw new BadRequestException(
        'Too many requests from this IP. Try later.',
      );
    }

    if (now.getTime() - ipWindowStart.getTime() < 3600_000) {
      if (ipRequestCountHour >= 20) {
        const blockedUntil = new Date(now.getTime() + 15 * 60_000);
        await this.ipRateLimitRepository.updateBlockedUntil(ip, blockedUntil);
        throw new BadRequestException(
          'Too many requests from this IP. Try later.',
        );
      }
      ipRequestCountHour += 1;
    } else {
      ipWindowStart = now;
      ipRequestCountHour = 1;
    }

    await this.ipRateLimitRepository.upsert(
      ip,
      ipWindowStart,
      ipRequestCountHour,
    );
  }

  async generateOtp(
    generateOtpDto: GenerateOtpDto,
    now: Date,
    hourWindowStart: Date,
    requestCountHour: number,
  ) {
    const token = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(
      Date.now() + this.configService.get('OTP_TTL_SECONDS') * 1000,
    );

    await this.otpRepository.uptdateOneOrCreate(
      generateOtpDto.phone,
      codeHash,
      expiresAt,
      now,
      hourWindowStart,
      requestCountHour,
    );

    return this.sendRcsMsg(generateOtpDto.phone, token);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean }> {
    const phone = verifyOtpDto.phone.trim();
    const code = verifyOtpDto.code.trim();
    const otpRecord = await this.otpRepository.findOne(phone);

    if (!otpRecord) {
      throw new BadRequestException('Expired or Invalid OTP');
    }

    if (otpRecord.expiresAt <= new Date()) {
      await this.otpRepository.deleteOne(phone);
      throw new BadRequestException('Expired or Invalid OTP');
    }

    const maxAttempts = this.configService.get('MAX_ATTEMPTS');

    if (otpRecord.attempts >= maxAttempts) {
      await this.otpRepository.deleteOne(phone);
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    const inputHash = crypto.createHash('sha256').update(code).digest('hex');

    if (otpRecord.otpCode !== inputHash) {
      if (otpRecord.attempts + 1 >= maxAttempts) {
        await this.otpRepository.deleteOne(phone);
        throw new BadRequestException(
          'Too many failed attempts. Please request a new code.',
        );
      }

      await this.otpRepository.incrementAttempt(otpRecord._id);
      throw new BadRequestException('Incorrect verification code.');
    }

    await this.otpRepository.deleteOne(otpRecord.phone);
    return { success: true };
  }

  private async sendRcsMsg(
    phone: string,
    token: string,
  ): Promise<{ isSent: boolean }> {
    try {
      const url = this.configService.get('SMSMODE_API_URL');

      const payload = {
        recipient: { to: phone },
        body: {
          type: 'CARD',
          orientation: 'HORIZONTAL',
          content: {
            title: 'Validation de votre compte',
            description: `Voici votre code de vérification unique : \n\n👉  ${token}  👈\n\nCe code est confidentiel et expire dans 3 minutes.`,
          },
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'X-Api-Key': this.configService.get('SMSMODE_API_KEY'),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log(`[RCS] Message envoyé avec succès à ${phone}`);
      console.log('data: ', response.data);

      return {
        isSent: response.data?.status?.detail === 'ACCEPTED',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "[RCS Error] Détails de l'API smsmode :",
          JSON.stringify(error.response.data, null, 2),
        );
      } else if (error instanceof Error) {
        console.error(
          '[RCS Error] Erreur réseau ou de configuration :',
          error.message,
        );
      } else {
        console.error('[RCS Error] Erreur réseau ou de configuration :', error);
      }

      return { isSent: false };
    }
  }
}
