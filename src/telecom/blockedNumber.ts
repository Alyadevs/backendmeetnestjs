import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlockedNumberDocument = BlockedNumber & Document;

@Schema()
export class BlockedNumber {
  @Prop({ required: true })
  phone: string;

  @Prop()
  roomId: string;

  @Prop()
  bannedBy: string;

  @Prop({ default: Date.now })
  bannedAt: Date;
}

export const BlockedNumberSchema = SchemaFactory.createForClass(BlockedNumber);
