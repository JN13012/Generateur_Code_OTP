import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './otp.schema';
import { OtpController } from 'src/otp/otp.controller';
import { OtpRepository } from 'src/otp/otp.repository';
import { OtpService } from 'src/otp/otp.service';
import {
  IpRateLimit,
  IpRateLimitSchema,
} from '../ip-rate-limit/ip-rate-limit.schema';
import { IpRateLimitRepository } from 'src/otp/ip-rate-limit.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: IpRateLimit.name, schema: IpRateLimitSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService, OtpRepository, IpRateLimitRepository],
  exports: [MongooseModule, OtpService],
})
export class OtpModule {}
