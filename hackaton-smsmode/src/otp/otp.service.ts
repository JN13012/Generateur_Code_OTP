import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/_utils/config/env.config';
import * as crypto from 'crypto';
import axios from 'axios';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly otpRepository: OtpRepository,
  ) {}

  async generateOtp(generateOtpDto: GenerateOtpDto) {
    // const targetPhone = phone || '33788294303';

    const token = crypto.randomInt(100000, 999999).toString();

    const codeHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(
      Date.now() + this.configService.get('OTP_TTL_SECONDS') * 1000,
    );

    await this.otpRepository.uptdateOneOrCreate(
      generateOtpDto.phone,
      codeHash,
      expiresAt,
    );

    return this.sendRcsMsg(generateOtpDto.phone, token);
    // return { message: 'OTP generated and sent successfully via RCS' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean }> {
    const otpRecord = await this.otpRepository.findOne(verifyOtpDto.phone);

    if (!otpRecord) throw new BadRequestException('Expired or Invalid OTP');

    if (otpRecord.attempts >= this.configService.get('MAX_ATTEMPTS')) {
      this.otpRepository.deleteOne(verifyOtpDto.phone);
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }
    const inputHash = crypto
      .createHash('sha256')
      .update(verifyOtpDto.code)
      .digest('hex');

    if (otpRecord.otpCode !== inputHash) {
      await this.otpRepository.incrementAttempt(otpRecord._id);
      throw new BadRequestException('Incorrect verification code.');
    }

    await this.otpRepository.deleteOne(otpRecord.phone);
    return { success: true };
  }

  private async sendRcsMsg(phone: string, token: string) {
    try {
      const url = this.configService.get('SMSMODE_API_URL');

      const payload = {
        recipient: { to: phone },
        body: {
          type: 'CARD',
          orientation: 'HORIZONTAL',
          content: {
            title: 'Validation de votre compte',
            description: `Voici votre code de vérification unique : \n\n👉  ${token}  👈\n\nCe code est confidentiel et expire dans 15 minutes.`,
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
      console.log(response);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "[RCS Error] Détails de l'API smsmode :",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.error(
          '[RCS Error] Erreur réseau ou de configuration :',
          error.message,
        );
      }
    }
  }
}
