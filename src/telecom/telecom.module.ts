import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelecomService } from './telecom.service';
import { TelecomController } from './telecom.controller';

import { BlockedNumber, BlockedNumberSchema } from './blockedNumber';
import { Conference, ConferenceSchema } from './conference';
import { AmiService } from './ami.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlockedNumber.name, schema: BlockedNumberSchema },
      { name: Conference.name, schema: ConferenceSchema },
    ]),
  ],
  controllers: [TelecomController],
  providers: [TelecomService, AmiService],
  exports: [TelecomService],
})
export class TelecomModule {}
