import { Module } from '@nestjs/common';
import { SmsmodeService } from './smsmode.service';

@Module({
  providers: [SmsmodeService],
})
export class SmsmodeModule {}
