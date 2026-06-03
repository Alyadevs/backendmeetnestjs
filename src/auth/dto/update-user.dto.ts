// src/auth/dto/update-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Doit contenir majuscule, minuscule et chiffre',
  })
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Lettres, chiffres et underscores uniquement',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, { message: 'Numéro invalide' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  address?: string;
}
