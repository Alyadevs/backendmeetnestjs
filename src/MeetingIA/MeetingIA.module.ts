import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingIA, MeetingSchema } from './MeetingIA';
import { MeetingAnalyzerService } from './Meeting_analyzer.service';
import { MeetingsService } from './MeetingsIA.service';
import { MeetingsController } from './MeetingIA.Meetings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MeetingIA.name, schema: MeetingSchema },
    ]),
  ],
  providers: [MeetingAnalyzerService, MeetingsService],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule {}