import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateOtpDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'code must be 6 ints' })
  @ApiProperty({ example: '123456' })
  otpCode: string;

  @IsString()
  requestId: string;

  @IsDate()
  expiresAt: Date;
}
