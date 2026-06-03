import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('call')
  async call(@Body() body: any) {
    return this.twilioService.makeCall(
      body.phoneNumber,
      body.roomId,
    );
  }
}
