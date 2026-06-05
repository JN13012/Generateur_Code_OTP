import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp, OtpDocument } from 'src/db/otp/otp.schema';
import { CreateOtpDto } from './dto/create-otp.dto';

@Injectable()
export class OtpRepository {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async findAll() {
    return this.otpModel.find().exec();
  }

  async createOne(createOtpDto: CreateOtpDto) {
    return this.otpModel.create(createOtpDto);
  }

  async uptdateOneOrCreate(
    phone: string,
    otpCodeHash: string,
    expiresAt: Date,
    lastSentAt: Date,
    hourWindowStart: Date,
    requestCountHour: number,
  ) {
    return this.otpModel.findOneAndUpdate(
      { phone },
      {
        otpCode: otpCodeHash,
        attempts: 0,
        expiresAt,
        lastSentAt,
        hourWindowStart,
        requestCountHour,
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async upsertOne(createOtpDto: CreateOtpDto) {
    return this.otpModel
      .findOneAndUpdate({ phone: createOtpDto.phone }, createOtpDto, {
        upsert: true,
      })
      .exec();
  }

  async findOne(phone: string) {
    return this.otpModel.findOne({ phone: phone });
  }

  async incrementAttempt(otpId: Types.ObjectId) {
    return this.otpModel
      .findByIdAndUpdate(
        otpId,
        { $inc: { attempts: 1 } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async deleteOne(phone: string) {
    return this.otpModel.deleteOne({ phone: phone });
  }

  async deleteAll() {
    return this.otpModel.deleteMany();
  }
}
