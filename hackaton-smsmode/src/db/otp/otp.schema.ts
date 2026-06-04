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
  codeHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ default: false })
  isUsed!: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);