import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

export enum OtpStatus {
  Pending = 'pending',
  Sent = 'sent',
  Verified = 'verified',
  Expired = 'expired',
  Failed = 'failed',
}

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop({ required: true })
  codeHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 5 })
  maxAttempts: number;

  @Prop({ type: Date, default: null })
  isUsed: boolean | false;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ phone: 1, nonce: 1 }, { unique: true });
