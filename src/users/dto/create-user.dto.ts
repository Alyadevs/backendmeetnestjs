// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' })
  @MaxLength(20, { message: 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores',
  })
  username: string;

  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}
