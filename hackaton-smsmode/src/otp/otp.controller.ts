import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/generate')
  @ApiOperation({ summary: 'Generate otp code for user authentification.' })
  generateOtp(@Body('phone') phone: string) {
    return this.otpService.generateOtp(phone);
  }

  @Post('/verify')
  @ApiOperation({ summary: 'Verify user authentification.' })
  verifyOtp() {}
}
