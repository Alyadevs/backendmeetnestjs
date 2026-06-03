import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScheduledMeeting,
  ScheduledMeetingSchema,
} from './scheduled-meeting.schema';
import { ScheduledMeetingService } from './scheduled-meeting.service';
import { ScheduledMeetingController } from './scheduled-meeting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduledMeeting.name, schema: ScheduledMeetingSchema },
    ]),
  ],
  controllers: [ScheduledMeetingController],
  providers: [ScheduledMeetingService],
})
export class ScheduledMeetingModule {}
