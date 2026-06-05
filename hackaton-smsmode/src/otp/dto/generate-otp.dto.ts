import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '33788294303' })
  phone: string;
}
