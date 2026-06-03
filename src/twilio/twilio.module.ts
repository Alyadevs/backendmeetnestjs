import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { MediaGateway } from './Media_Gateway';

@Module({
  providers: [TwilioService, MediaGateway],
  controllers: [TwilioController],
})
export class TwilioModule {}
