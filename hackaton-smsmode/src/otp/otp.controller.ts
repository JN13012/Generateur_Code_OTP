import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/generate')
  @ApiOperation({ summary: 'Generate otp code for user authentification.' })
  generateOtp(@Body() generateOtpDto: GenerateOtpDto, @Req() request: Request) {
    const ip = this.getClientIp(request);
    return this.otpService.generateLimiting(generateOtpDto, ip);
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

  private getClientIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (request.ip) {
      return request.ip;
    }
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    return request.socket.remoteAddress || 'unknown';
  }
}
