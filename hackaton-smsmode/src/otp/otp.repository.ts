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

  async uptdateOneOrCreate(phone: string, codeHash: string, expiresAt: Date) {
    return this.otpModel.findOneAndUpdate(
      { phone },
      { codeHash, attempts: 0, expiresAt },
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
    this.otpModel
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
