import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConferenceDocument = Conference & Document;

@Schema()
export class Conference {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ required: true })
  pin: string;

  @Prop()
  createdBy: string;
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);
