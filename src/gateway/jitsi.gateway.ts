import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
 
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsEvent } from '../jitsi-status/type';
import { MeetingService } from 'src/Meetings/Meeting.service';

/**
 * JitsiGateway
 * ─────────────────────────────────────────────────────────────────────────────
 * WebSocket Socket.IO gateway.
 * Le frontend React se connecte ici pour recevoir les événements en temps réel.
 *
 * Événements entrants (React → NestJS) :
 *   - participant:join   { roomName, participantId, displayName }
 *   - participant:leave  { roomName, participantId }
 *
 * Événements sortants (NestJS → React) :
 *   - rooms:update      LiveRoom[]
 *   - room:created      LiveRoom
 *   - room:closed       { roomName }
 *   - participant:join  { roomName, participantId, displayName }
 *   - participant:leave { roomName, participantId }
 *   - stats:update      DashboardStats
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://backendmeetnestjs.onrender.com',
    credentials: true,
  },
  namespace: '/jitsi',
})
export class JitsiGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(JitsiGateway.name);

  constructor(private readonly meetingService: MeetingService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialisé sur /jitsi');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  @SubscribeMessage(WsEvent.PARTICIPANT_JOIN)
  async onParticipantJoin(
    @MessageBody()
    data: {
      roomName: string;
      participantId: string;
      displayName: string;
    },
  ) {
    this.logger.log(`Join: ${data.displayName} → ${data.roomName}`);

    // 🔥 1. OUVRIR ROOM SI PAS EXISTE
    await this.meetingService.openRoom(data.roomName);

    // 🔥 2. ENREGISTRER PARTICIPANT
    await this.meetingService.participantJoined(
      data.roomName,
      data.participantId,
      data.displayName,
    );

  // // optionnel prosody sync
  // if (this.prosodyService) {
  //   await this.prosodyService.handleParticipantJoin(
  //     data.roomName,
  //     data.participantId,
  //     data.displayName,
  //   );
  // } 
  }

  @SubscribeMessage(WsEvent.PARTICIPANT_LEAVE)
  async onParticipantLeave(@MessageBody() data: any) {
    this.logger.log(`Leave: ${data.participantId} ← ${data.roomName}`);

    await this.meetingService.participantLeft(
      data.roomName,
      data.participantId,
    );

    //await this.meetingService.closeRoom(data.roomName);
  }

  emit(event: WsEvent, data: any) {
    this.server.emit(event, data);
  }
}
