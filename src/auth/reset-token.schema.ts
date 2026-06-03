// src/auth/schemas/reset-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResetTokenDocument = ResetToken & Document;

@Schema({ collection: 'reset_tokens' })
export class ResetToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);

// TTL index : MongoDB supprime automatiquement le document expiré
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
