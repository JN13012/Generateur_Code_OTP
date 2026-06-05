import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IpRateLimitDocument = HydratedDocument<IpRateLimit>;

@Schema({ timestamps: true, collection: 'ip_rate_limit' })
export class IpRateLimit {
  @Prop({ required: true, unique: true })
  ip!: string;

  @Prop({ type: Date })
  windowStart?: Date;

  @Prop({ default: 0 })
  requestCountHour!: number;

  @Prop({ type: Date })
  blockedUntil?: Date;
}

export const IpRateLimitSchema = SchemaFactory.createForClass(IpRateLimit);
