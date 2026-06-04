import { Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('otp')
export class OtpController {
  @Post('/generate')
  @ApiOperation({ summary: 'Generate otp code for user authentification.' })
  generateOtp() {}

  @Post('/verify')
  @ApiOperation({ summary: 'Verify user authentification.' })
  verifyOtp() {}
}
