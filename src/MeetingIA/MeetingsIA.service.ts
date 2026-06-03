import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MeetingAnalyzerService } from './Meeting_analyzer.service';
import { TranscriptPayload, MeetingData } from './Meeting.types';
import { MeetingIA, MeetingDocument } from './MeetingIA';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    @InjectModel(MeetingIA.name)
    private readonly meetingModel: Model<MeetingDocument>,
    private readonly analyzer: MeetingAnalyzerService,
  ) {}

  // ── Receive transcripts from FastAPI and process ──────────────
 // MeetingsIA.service.ts
async processAndSave(payload: TranscriptPayload): Promise<MeetingDocument> {
  try {
    // ✅ Normalize potentially missing array fields
    const transcripts = Array.isArray(payload.transcripts) ? payload.transcripts : [];
    const participants = Array.isArray(payload.participants) ? payload.participants : [];
    const duration = payload.duration_minutes ?? 0;

    const { decisions, actions, important_dates, keywords, summary } =
      this.analyzer.analyze(transcripts, duration);

    const data = {
      meeting_id: payload.meeting_id ?? `meeting-${Date.now()}`,
      date: new Date().toISOString(),
      room: payload.room ?? 'unknown',
      participants,   // ← use the guarded value
      transcripts,    // ← use the guarded value
      summary,
      decisions,
      action_items: actions,
      important_dates,
      keywords,
      total_exchanges: transcripts.length,
      duration_minutes: duration,
      status: 'completed',
      saved_at: new Date(),
    };

    const saved = await new this.meetingModel(data).save();
    this.logger.log(`✅ Meeting saved: ${saved.meeting_id}`);
    return saved;

  } catch (error) {
    this.logger.error(`❌ processAndSave failed: ${error.message}`, error.stack);
    throw error;
  }
}

  // ── CRUD ─────────────────────────────────────────────────────
  async findAll(limit = 20, page = 1, search = '') {
    const skip = (page - 1) * limit;
    const filter = search
      ? {
          $or: [
            { meeting_id: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
            { keywords: { $in: [new RegExp(search, 'i')] } },
          ],
        }
      : {};

    const [meetings, total] = await Promise.all([
      this.meetingModel
        .find(filter)
        .sort({ saved_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.meetingModel.countDocuments(filter),
    ]);

    return {
      meetings,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
    };
  }

  async findOne(meetingId: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel
      .findOne({ meeting_id: meetingId })
      .exec();
    if (!meeting) throw new NotFoundException(`Meeting ${meetingId} not found`);
    return meeting;
  }

  async delete(meetingId: string): Promise<void> {
    await this.meetingModel.deleteOne({ meeting_id: meetingId }).exec();
  }

  // ── Stats ─────────────────────────────────────────────────────
  async getStats() {
    const meetings = await this.meetingModel.find().exec();
    const total = meetings.length;
    const totalDecisions = meetings.reduce(
      (acc, m) => acc + m.decisions.length,
      0,
    );
    const totalActions = meetings.reduce(
      (acc, m) => acc + m.action_items.length,
      0,
    );
    const totalExchanges = meetings.reduce(
      (acc, m) => acc + m.total_exchanges,
      0,
    );
    const totalDuration = meetings.reduce(
      (acc, m) => acc + m.duration_minutes,
      0,
    );

    return {
      total_meetings: total,
      total_decisions: totalDecisions,
      total_actions: totalActions,
      total_exchanges: totalExchanges,
      total_duration_minutes: totalDuration,
      average_duration: total > 0 ? Math.round(totalDuration / total) : 0,
    };
  }

  // ── Dashboard helpers ─────────────────────────────────────────
  async getAllDecisions(limit = 20): Promise<string[]> {
    const meetings = await this.meetingModel
      .find()
      .sort({ saved_at: -1 })
      .limit(limit)
      .exec();
    return meetings.flatMap((m) => m.decisions).slice(0, limit);
  }

  async getAllActions(limit = 20): Promise<string[]> {
    const meetings = await this.meetingModel
      .find()
      .sort({ saved_at: -1 })
      .limit(limit)
      .exec();
    return meetings.flatMap((m) => m.action_items).slice(0, limit);
  }

  async getMeetingsByUser(userEmail: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { participants: userEmail };

    const [meetings, total] = await Promise.all([
      this.meetingModel
        .find(filter)
        .sort({ saved_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.meetingModel.countDocuments(filter),
    ]);

    return {
      meetings,
      total,
      page,
      total_pages: Math.ceil(total / limit),
    };
  }
}