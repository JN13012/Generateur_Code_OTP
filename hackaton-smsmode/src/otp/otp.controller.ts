import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/generate')
  @ApiOperation({ summary: 'Generate otp code for user authentification.' })
  generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.otpService.generateOtp(generateOtpDto);
  }

  @Post('/verify')
  @ApiOperation({ summary: 'Verify user authentification.' })
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }

  @Get()
  getAllOtp() {
    return this.otpService.getAll();
  }

  @Delete()
  deleteAll() {
    return this.otpService.deleteAll();
  }
}
