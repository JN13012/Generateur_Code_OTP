import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SmsmodeController } from './smsmode/smsmode.controller';
import { SmsmodeModule } from './smsmode/smsmode.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './_utils/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    SmsmodeModule,
  ],
  controllers: [AppController, SmsmodeController],
  providers: [AppService],
})
export class AppModule {}
