// src/auth/dto/reset-password.dto.ts
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis.' })
  token: string;

  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  @Matches(/^(?=.*[a-z])/, { message: 'Doit contenir au moins une minuscule.' })
  @Matches(/^(?=.*[A-Z])/, { message: 'Doit contenir au moins une majuscule.' })
  @Matches(/^(?=.*\d)/, { message: 'Doit contenir au moins un chiffre.' })
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  newPassword: string;
}
