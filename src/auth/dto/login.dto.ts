// src/auth/dto/login.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom d'utilisateur est requis" })
  @MinLength(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
  })
  @MaxLength(20, {
    message: "Le nom d'utilisateur ne peut pas dépasser 20 caractères",
  })
  username!: string;

  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password?: string;

  @IsOptional()
  @IsString()
  roomName?: string;

  @IsOptional()
  @IsString()
  role?: 'participant' | 'moderator';
}
