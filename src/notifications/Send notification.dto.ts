import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class SendMeetNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl( { require_tld: false, require_protocol: true },
    {
      message:
        'meetUrl doit être une URL valide (ex: https://meet.example.com/room)',
    },
  )
  @IsNotEmpty()
  meetUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  recipientIds: string[];
}

export class MarkReadDto {
  @IsString()
  @IsNotEmpty()
  notificationId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
