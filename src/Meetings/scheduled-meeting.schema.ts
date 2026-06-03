import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduledMeetingDocument = ScheduledMeeting & Document;

@Schema({ timestamps: true })
export class ScheduledMeeting {
  @Prop({ required: true })
  roomName!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;
}

export const ScheduledMeetingSchema =
  SchemaFactory.createForClass(ScheduledMeeting);
