import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class ParticipantEntry {
  @Prop({ required: true }) participantId!: string;
  @Prop({ required: true }) displayName!: string;
  @Prop({ required: true }) joinedAt!: Date;
  @Prop() leftAt?: Date;
  @Prop({ default: false }) audioMuted!: boolean;
  @Prop({ default: false }) videoMuted!: boolean;
}
export const ParticipantEntrySchema =
  SchemaFactory.createForClass(ParticipantEntry);

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true, collection: 'meetings' })
export class Meeting {
  @Prop({ required: true, index: true }) roomName!: string;
  @Prop({ required: true, index: true }) roomJid!: string;
  @Prop({ required: true }) startedAt!: Date;
  @Prop() endedAt?: Date;
  @Prop({ default: false, index: true }) isActive!: boolean;
  @Prop({ default: 0 }) peakParticipants!: number;
  @Prop({ default: 0 }) totalParticipants!: number;
  @Prop({ type: [ParticipantEntrySchema], default: [] })
  participantLog!: ParticipantEntry[];
  @Prop({ default: 0 }) durationSeconds!: number;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
MeetingSchema.index({ isActive: 1, startedAt: -1 });
MeetingSchema.index({ roomName: 1, isActive: 1 });
