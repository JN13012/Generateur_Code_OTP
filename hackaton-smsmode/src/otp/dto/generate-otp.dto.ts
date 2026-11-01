import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '33600000000' })
  phone!: string;
}
