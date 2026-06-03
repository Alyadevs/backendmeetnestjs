import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { MeetingsService } from './MeetingsIA.service';
import { TranscriptPayload } from './Meeting.types';

// ── DTO ───────────────────────────────────────────────────────
class SaveMeetingDto implements TranscriptPayload {
  meeting_id: string;
  room?: string;
  participants: string[];
  transcripts: string[];
  duration_minutes: number;
}

// ─────────────────────────────────────────────────────────────
@Controller()
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  /**
   * POST /api/meetings/save
   * Called by FastAPI at the end of a WebSocket session.
   * FastAPI sends raw transcripts → NestJS does all the analysis.
   */
  @Post('api/meetings/save')
  @HttpCode(HttpStatus.CREATED)
  async saveMeeting(@Body() body: SaveMeetingDto) {
    console.log('RAW BODY FROM FASTAPI:', JSON.stringify(body, null, 2));
     try {
    const meeting = await this.meetingsService.processAndSave(body);
    return {
      status: 'saved',
      meeting_id: meeting.meeting_id,
      decisions_found: meeting.decisions.length,
      actions_found: meeting.action_items.length,
      dates_found: meeting.important_dates.length,
    };
  } catch (error) {
    throw new HttpException(
      { status: 'error', message: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
}
  }

  // ── Admin ──────────────────────────────────────────────────
  @Get('api/admin/meetings/paginated')
  async adminGetMeetingsPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.meetingsService.findAll(+limit, +page, search);
  }

  @Get('api/admin/meetings/stats')
  async adminGetStats() {
    return this.meetingsService.getStats();
  }

  @Get('api/admin/meetings')
  async adminGetMeetings(@Query('limit') limit = '20') {
    const result = await this.meetingsService.findAll(+limit);
    return { meetings: result.meetings, total: result.pagination.total };
  }

  @Get('api/admin/meeting/:meetingId')
  async adminGetMeeting(@Param('meetingId') meetingId: string) {
    return this.meetingsService.findOne(meetingId);
  }

  @Delete('api/admin/meeting/:meetingId')
  @HttpCode(HttpStatus.OK)
  async adminDeleteMeeting(@Param('meetingId') meetingId: string) {
    await this.meetingsService.delete(meetingId);
    return { status: 'deleted', meeting_id: meetingId };
  }

  // ── Dashboard participant ──────────────────────────────────
  @Get('api/dashboard/decisions')
  async getDashboardDecisions(@Query('limit') limit = '20') {
    const decisions = await this.meetingsService.getAllDecisions(+limit);
    return { decisions };
  }

  @Get('api/dashboard/actions')
  async getDashboardActions(@Query('limit') limit = '20') {
    const actions = await this.meetingsService.getAllActions(+limit);
    return { actions };
  }

  @Get('api/user/meetings/paginated')
  async getUserMeetings(
    @Query('user_email') userEmail: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.meetingsService.getMeetingsByUser(userEmail, +page, +limit);
  }
}