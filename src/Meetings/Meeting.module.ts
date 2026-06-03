import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './Meeting.schema';
import { MeetingService } from './Meeting.service';
import { MeetingController } from './Meeting.controller';
import { MeetingAnalyzerService } from 'src/MeetingIA/Meeting_analyzer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
  ],
  providers: [MeetingService,MeetingAnalyzerService],
  controllers: [MeetingController],
  exports: [MeetingService],
})
export class MeetingModule {}
