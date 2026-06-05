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

@Schema({ timestamps: true, collection: 'otp' })
export class Otp {
  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  otpCode!: string;

  @Prop({ required: true })
  requestId!: string;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
