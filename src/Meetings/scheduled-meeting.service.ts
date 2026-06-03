import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScheduledMeeting,
  ScheduledMeetingDocument,
} from './scheduled-meeting.schema';

@Injectable()
export class ScheduledMeetingService {
  constructor(
    @InjectModel(ScheduledMeeting.name)
    private model: Model<ScheduledMeetingDocument>,
  ) {}

  // CREATE
  create(data: ScheduledMeeting) {
    return this.model.create(data);
  }

  // GET ALL
 async findAll(page = 1, limit = 4) {
    const skip  = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
 
    const [total, totalUpcoming, totalPast, data] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ date: { $gte: today } }),
      this.model.countDocuments({ date: { $lt:  today } }),
      this.model
        .find()
        .sort({ date: -1, startTime: -1 }) // plus récent en premier
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);
 
    return {
      data,
      total,
      totalUpcoming,
      totalPast,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
 

  // GET ONE
  async findOne(id: string) {
    const meeting = await this.model.findById(id);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  // UPDATE
  async update(id: string, data: Partial<ScheduledMeeting>) {
    const updated = await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Meeting not found');
    return updated;
  }

  // DELETE
  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Meeting not found');
    return { message: 'Deleted successfully' };
  }
}