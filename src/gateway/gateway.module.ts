import { Module } from '@nestjs/common';
import { JitsiGateway } from './jitsi.gateway';
import { MeetingModule } from 'src/Meetings/Meeting.module';

@Module({
  imports: [MeetingModule],
  providers: [JitsiGateway],
  exports: [JitsiGateway],
})
export class GatewayModule {}
