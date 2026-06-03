import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ScheduledMeetingService } from './scheduled-meeting.service';

@Controller('scheduled-meetings')
export class ScheduledMeetingController {
  constructor(private service: ScheduledMeetingService) {}

  // CREATE
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // GET ALL
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '4') {
    return this.service.findAll(Number(page), Number(limit));
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
