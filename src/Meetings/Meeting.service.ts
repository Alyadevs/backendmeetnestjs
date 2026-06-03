import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './Meeting.schema';

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,
  ) {}

  // ─── Ouvrir ou réouvrir une room ──────────────────────────────────────────
  async openRoom(roomName: string) {
    if (!roomName) {
      throw new Error('roomName or roomJid missing');
    }

    const existing = await this.meetingModel.findOne({
      roomName,
      isActive: true,
    });

    if (existing) return existing;

    const meeting = new this.meetingModel({
      roomName,
      roomJid: roomName,
      startedAt: new Date(),
      isActive: true,
     
    });

    return meeting.save();
  }
  // ─── Fermer une room ──────────────────────────────────────────────────────
  async closeRoom(roomName: string): Promise<MeetingDocument | null> {
    const meeting = await this.meetingModel.findOne({
      roomName,
      isActive: true,
    });
    if (!meeting) return null;

    const endedAt = new Date();
    const durationSeconds = Math.floor(
      (endedAt.getTime() - meeting.startedAt.getTime()) / 1000,
    );

    meeting.isActive = false;
    meeting.endedAt = endedAt;
    meeting.durationSeconds = durationSeconds;
    await meeting.save();

    this.logger.log(
      `Room fermée : ${roomName} (durée: ${Math.floor(durationSeconds / 60)}m)`,
    );
    return meeting;
  }

  // ─── Enregistrer l'entrée d'un participant ────────────────────────────────
  async participantJoined(
    roomName: string,
    participantId: string,
    displayName: string,
  ): Promise<void> {
    const meeting = await this.meetingModel.findOne({
      roomName,
      isActive: true,
    });
    if (!meeting) return;

    // Éviter les doublons
    const alreadyIn = meeting.participantLog.some(
      (p) => p.participantId === participantId && !p.leftAt,
    );
    if (alreadyIn) return;

    meeting.participantLog.push({
      participantId,
      displayName,
      joinedAt: new Date(),
      audioMuted: false,
      videoMuted: false,
    });

    meeting.totalParticipants += 1;

    const currentCount = meeting.participantLog.filter((p) => !p.leftAt).length;
    if (currentCount > meeting.peakParticipants) {
      meeting.peakParticipants = currentCount;
    }

    await meeting.save();
  }

  // ─── Enregistrer le départ d'un participant ───────────────────────────────
  async participantLeft(
    roomName: string,
    participantId: string,
  ): Promise<void> {
    const meeting = await this.meetingModel.findOne({
      roomName,
      isActive: true,
    });
    if (!meeting) return;

    const participant = meeting.participantLog.find(
      (p) => p.participantId === participantId && !p.leftAt,
    );

    if (participant) {
      participant.leftAt = new Date();
    }

    // 🔥 vérifier combien restent connectés
    const stillConnected = meeting.participantLog.filter(
      (p) => !p.leftAt,
    ).length;

    // 🚨 si personne → fermer la room
    if (stillConnected === 0) {
      const endedAt = new Date();
      const durationSeconds = Math.floor(
        (endedAt.getTime() - meeting.startedAt.getTime()) / 1000,
      );

      meeting.isActive = false;
      meeting.endedAt = endedAt;
      meeting.durationSeconds = durationSeconds;

      this.logger.log(`Room fermée automatiquement: ${roomName}`);
    }

    await meeting.save();
  }

  // ─── Rooms actives (depuis MongoDB) ──────────────────────────────────────
  async getActiveMeetings(): Promise<MeetingDocument[]> {
    return this.meetingModel
      .find({ isActive: true })
      .sort({ startedAt: -1 })
      .lean()
      .exec() as any;
  }

  // ─── Historique paginé ────────────────────────────────────────────────────
  async getHistory(
    page = 1,
    limit = 20,
    roomName?: string,
    isActive?: boolean, // optionnel
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter: any = {};

    if (roomName) {
      filter.roomName = { $regex: roomName, $options: 'i' };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.meetingModel
        .find(filter)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-participantLog')
        .lean()
        .exec(),
      this.meetingModel.countDocuments(filter),
    ]);

    // 👇 ajouter status dynamique
    const now = new Date();

    const formattedData = data.map((meeting) => {
      let status = 'inactive';

      if (meeting.isActive) {
        status = 'active';
      }

      // 🔥 option : si tu as endedAt
      if (meeting.endedAt && new Date(meeting.endedAt) < now) {
        status = 'inactive';
      }

      return {
        ...meeting,
        status,
      };
    });

    return {
      data: formattedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Détail d'un meeting (avec log participants) ──────────────────────────
  async getMeetingDetail(id: string): Promise<MeetingDocument | null> {
    return this.meetingModel.findById(id).exec();
  }


  // ─── Stats globales ───────────────────────────────────────────────────────
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeRooms, totalMeetingsToday, totalMeetingsAllTime, avgDur] =
      await Promise.all([
        this.meetingModel.countDocuments({ isActive: true }),
        this.meetingModel.countDocuments({ startedAt: { $gte: today } }),
        this.meetingModel.countDocuments({ isActive: false }),
        this.meetingModel.aggregate([
          { $match: { isActive: false, durationSeconds: { $gt: 0 } } },
          { $group: { _id: null, avg: { $avg: '$durationSeconds' } } },
        ]),
      ]);

    const activeList = await this.meetingModel.find({ isActive: true });
    const totalParticipants = activeList.reduce(
      (sum, m) => sum + m.participantLog.filter((p) => !p.leftAt).length,
      0,
    );

    return {
      activeRooms,
      totalParticipants,
      totalMeetingsToday,
      totalMeetingsAllTime,
      avgDurationMinutes: avgDur[0] ? Math.round(avgDur[0].avg / 60) : 0,
    };
  }

  // ─── Sync: fermer les rooms MongoDB qui ne sont plus dans Prosody ─────────
  async syncWithProsodyRooms(activeRoomNames: string[]): Promise<void> {
    const dbActiveRooms = await this.meetingModel
      .find({ isActive: true })
      .select('roomName');
    for (const dbRoom of dbActiveRooms) {
      if (!activeRoomNames.includes(dbRoom.roomName)) {
        await this.closeRoom(dbRoom.roomName);
        this.logger.warn(`Room ${dbRoom.roomName} fermée (absente de Prosody)`);
      }
    }
  }
}
