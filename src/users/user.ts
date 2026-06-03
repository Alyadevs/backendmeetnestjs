// src/users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // L'ID est automatiquement ajouté par Mongoose
  _id?: Types.ObjectId; // Ajout explicite de _id

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'participant' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLogin: Date;
  @Prop({ required: true })
phone: string;

@Prop({ required: true })
address: string;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour recherche rapide
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
