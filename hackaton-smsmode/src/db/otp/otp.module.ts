import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './otp.schema';
import { OtpController } from 'src/otp/otp.controller';
import { OtpRepository } from 'src/otp/otp.repository';
import { OtpService } from 'src/otp/otp.service';
// import { OtpService } from '../../otp/otp.service.service';
// import { OtpController } from '../otp.schema
// import Populate from 'src/db/populate';
// import { OtpRepository } from '../../otp/otp.repositorypository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
  controllers: [OtpController],
  providers: [OtpService, OtpRepository],
  exports: [MongooseModule, OtpService],
})
export class OtpModule {}
