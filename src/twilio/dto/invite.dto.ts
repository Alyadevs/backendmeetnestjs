import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class InviteDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\s\-().]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  conferenceId?: string;

  @IsOptional()
  @IsString()
  adminUserId?: string;
}
