// src/auth/dto/forgot-password.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  @IsNotEmpty({ message: "L'adresse e-mail est requise." })
  email: string;
}