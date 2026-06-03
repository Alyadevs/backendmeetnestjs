import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/media' })
export class MediaGateway {
  @WebSocketServer()
  server: Server;

  private ubuntuWs: any;

  afterInit() {
    console.log('Media Gateway started');
  }

  handleConnection(client: any) {
    console.log('Twilio connected');
  }

  handleMessage(client: any, msg: any) {
    const data = JSON.parse(msg.toString());

    if (data.event === 'media') {
      const audio = data.media.payload;

      // 🔥 FORWARD vers Ubuntu
      if (this.ubuntuWs?.readyState === 1) {
        this.ubuntuWs.send(
          JSON.stringify({
            type: 'audio',
            audio,
          }),
        );
      }
    }
  }

  setUbuntu(ws: any) {
    this.ubuntuWs = ws;
  }
}
