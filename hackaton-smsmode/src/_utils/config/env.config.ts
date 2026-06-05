import { exit } from 'process';
import { IsNumber, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Logger } from '@nestjs/common';

export class EnvironmentVariables {
  @IsNumber()
  PORT: number = 3000;
  @IsNumber()
  OTP_TTL_SECONDS: number;
  @IsNumber()
  MAX_ATTEMPTS: number;
  @IsString()
  SMSMODE_API_URL: string;
  @IsString()
  SMSMODE_SENDER_ID: string;
  @IsString()
  SMSMODE_API_KEY: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    new Logger(validateEnv.name).error(errors.toString());
    exit();
  }
  return validatedConfig;
}
