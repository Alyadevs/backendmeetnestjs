import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

import * as dotenv from 'dotenv';


import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule/dist/schedule.module';
import { GatewayModule } from './gateway/gateway.module';
import { MeetingModule } from './Meetings/Meeting.module';
import { ScheduledMeetingModule } from './Meetings/scheduled-meeting.module';
import { JitsiStatusModule } from './jitsi-status/jicofo.module';
import { UsersModule } from './users/user.module';
import { TelecomModule } from './telecom/telecom.module';
import { NotificationsModule } from './notifications/Notifications.module';
import { MeetingsModule } from './MeetingIA/MeetingIA.module';
import { TwilioModule } from './twilio/twilio.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env',}),
    ScheduleModule.forRoot(),
    MeetingsModule,
    AuthModule,
    UsersModule,
    MeetingModule,
    GatewayModule,
    ScheduledMeetingModule,
    TelecomModule,
    TwilioModule,
    NotificationsModule,
    JitsiStatusModule.forRoot({
      videobridgeHost: process.env.JITSI_VIDEOBRIDGE_HOST ?? 'localhost',
      videobridgePort: parseInt(
        process.env.JITSI_VIDEOBRIDGE_PORT ?? '8080',
        10,
      ),
      jicofoHost: process.env.JITSI_JICOFO_HOST ?? 'localhost',
      jicofoPort: parseInt(process.env.JITSI_JICOFO_PORT ?? '8888', 10),
      timeout: parseInt(process.env.JITSI_TIMEOUT ?? '5000', 10),
    }),
    TwilioModule,
  ],
})
export class AppModule {}
