import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BlockedNumber } from './blockedNumber';
import { Conference } from './conference';
import { AmiService } from './ami.service';

const activeCalls = new Map<string, { roomId: string }>();

@Injectable()
export class TelecomService {
  constructor(
    @InjectModel(BlockedNumber.name) private blockedModel: Model<BlockedNumber>,
    @InjectModel(Conference.name) private confModel: Model<Conference>,
    private amiService: AmiService,
  ) {}

  async isBlocked(phone: string): Promise<boolean> {
    const entry = await this.blockedModel.findOne({ phone });
    return !!entry;
  }

  async verifyPin(
    pin: string,
    phone: string,
  ): Promise<{ roomId: string } | null> {
    const conference = await this.confModel.findOne({ pin });

    if (!conference) return null;

    await this.saveActiveCall(phone, conference.roomId);

    return { roomId: conference.roomId };
  }

  async saveActiveCall(phone: string, roomId: string): Promise<void> {
    activeCalls.set(phone, { roomId });
  }

  async banUser(phone: string, roomId: string, adminId: string): Promise<void> {
    await this.blockedModel.create({
      phone,
      roomId,
      bannedBy: adminId,
      bannedAt: new Date(),
    });

    // ⚠️ provisoire (on corrigera avec channel après)
    await this.amiService.hangupChannel(phone);
  }
}
