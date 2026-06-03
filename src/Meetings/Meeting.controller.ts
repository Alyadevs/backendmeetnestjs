import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { MeetingService } from './Meeting.service';
import { IsString, IsNotEmpty } from 'class-validator';

// DTO
class ParticipantEventDto {
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;
}
@Controller('api/meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  // ─── ACTIVE MEETINGS ─────────────────────────────
  @Get('active')
  getActive() {
    return this.meetingService.getActiveMeetings();
  }

  // ─── HISTORY ─────────────────────────────
  @Get('history')
  getHistory(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('room') room?: string,
  ) {
    return this.meetingService.getHistory(+page, +limit, room);
  }

  // ─── STATS ─────────────────────────────
  @Get('stats')
  getStats() {
    return this.meetingService.getStats();
  }

  // ─── DETAIL ─────────────────────────────
  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.meetingService.getMeetingDetail(id);
  }

  // ─────────────────────────────────────────────
  // 🔥 JOIN EVENT (IMPORTANT FIX)
  // ─────────────────────────────────────────────
  @Post('event/joined')
  @HttpCode(HttpStatus.OK)
  async participantJoined(@Body() dto: ParticipantEventDto) {
    
    // ✅ 1. créer / ouvrir room si pas existe
    await this.meetingService.openRoom(dto.roomName);

    // ✅ 2. enregistrer participant
    await this.meetingService.participantJoined(
      dto.roomName,
      dto.participantId,
      dto.displayName,
    );
     console.log('🔥 DTO RECEIVED:', dto);
    return { ok: true };
  }

  // ─────────────────────────────────────────────
  // 🔥 LEAVE EVENT
  // ─────────────────────────────────────────────
  @Post('event/left')
  @HttpCode(HttpStatus.OK)
  async participantLeft(@Body() dto: ParticipantEventDto) {
    await this.meetingService.participantLeft(dto.roomName, dto.participantId);

    return { ok: true };
  }
}
