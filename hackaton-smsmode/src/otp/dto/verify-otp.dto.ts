import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '+33958187835' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'code must be 6 ints' })
  @ApiProperty({ example: '123456' })
  code: string;
}
