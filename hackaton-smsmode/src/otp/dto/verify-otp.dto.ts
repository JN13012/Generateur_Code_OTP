import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '33788294303' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'code must be 6 ints' })
  @Matches(/^\d{6}$/, { message: 'code must contain only digits' })
  @ApiProperty({ example: '268600' })
  code!: string;
}
