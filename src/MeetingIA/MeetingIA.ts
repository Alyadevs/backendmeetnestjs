import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeetingDocument = MeetingIA & Document;

@Schema({ collection: 'meetings', timestamps: false })
export class MeetingIA {
  @Prop({ required: true, unique: true })
  meeting_id: string;

  @Prop() date: string;
  @Prop() room: string;
  @Prop({ type: [String], default: [] }) participants: string[];
  @Prop({ type: [String], default: [] }) transcripts: string[];
  @Prop() summary: string;
  @Prop({ type: [String], default: [] }) decisions: string[];
  @Prop({ type: [String], default: [] }) action_items: string[];
  @Prop({ type: [String], default: [] }) important_dates: string[];
  @Prop({ type: [String], default: [] }) keywords: string[];
  @Prop({ default: 0 }) total_exchanges: number;
  @Prop({ default: 0 }) duration_minutes: number;
  @Prop({ default: 'completed' }) status: string;
  @Prop({ type: Date, default: () => new Date() }) saved_at: Date;
}

export const MeetingSchema = SchemaFactory.createForClass(MeetingIA);