import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IpRateLimit,
  IpRateLimitDocument,
} from 'src/db/ip-rate-limit/ip-rate-limit.schema';

@Injectable()
export class IpRateLimitRepository {
  constructor(
    @InjectModel(IpRateLimit.name)
    private readonly ipRateLimitModel: Model<IpRateLimitDocument>,
  ) {}

  async findOne(ip: string) {
    return this.ipRateLimitModel.findOne({ ip });
  }

  async upsert(ip: string, windowStart: Date, requestCountHour: number) {
    return this.ipRateLimitModel.findOneAndUpdate(
      { ip },
      { ip, windowStart, requestCountHour },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async updateBlockedUntil(ip: string, blockedUntil: Date) {
    return this.ipRateLimitModel.findOneAndUpdate(
      { ip },
      { blockedUntil },
      { returnDocument: 'after' },
    );
  }
}
