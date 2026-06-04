import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './_utils/config/env.config';
import { OtpModule } from './otp/otp.module';
import { OtpController } from './otp/otp.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    OtpModule,
  ],
  controllers: [AppController, OtpController],
  providers: [AppService],
})
export class AppModule {}
