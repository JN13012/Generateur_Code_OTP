import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateSecret, generate } from 'otplib';
import { randomUUID } from 'crypto';
import { Otp, OtpDocument } from '../db/otp/otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async generateOtp(phone: string) {
    const targetPhone = phone || '33788294303';
    const secret = generateSecret();
    const otpCode = await generate({ secret });

    const requestId = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const payload = {
      recipient: { to: targetPhone },
      body: {
        type: 'BASIC',
        text: `Votre code de validation est ${otpCode}`,
      },
    };

    const response = await fetch('https://rest.smsmode.com/rcs/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': process.env.SMSMODE_API_KEY ?? '',
      },
      body: JSON.stringify(payload),
    });

    await this.otpModel.create({
      phone: targetPhone,
      otpCode,
      requestId,
      expiresAt,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Smsmode RCS failed: ${response.status} ${errorText}`);
    }

    return { requestId, expiresAt };
  }
}
