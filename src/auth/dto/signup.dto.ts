// backend/src/auth/dto/signup.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores",
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone: string;

  @IsString()
  @MinLength(5)
  @MaxLength(150)
  address: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;
}
