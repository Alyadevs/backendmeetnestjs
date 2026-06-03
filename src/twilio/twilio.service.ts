import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

import twilio, { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;
  private readonly baseUrl: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const baseUrl = process.env.API_BASE_URL;

    if (!accountSid || !authToken) {
      throw new InternalServerErrorException('Missing Twilio credentials');
    }

    if (!fromNumber) {
      throw new InternalServerErrorException('Missing TWILIO_PHONE_NUMBER');
    }

    if (!baseUrl) {
      throw new InternalServerErrorException('Missing API_BASE_URL');
    }

    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
    this.baseUrl = baseUrl;
  }

  async makeCall(to: string, roomId: string) {
    return this.client.calls.create({
      to,
      from: this.fromNumber,

      // 🔥 IMPORTANT: Media Streams (PAS SIP)
      twiml: `
<Response>
  <Say language="fr-FR">
    Vous rejoignez la conférence
  </Say>

  <Connect>
    <Stream url="wss://${this.baseUrl.replace('https://','')}/media" />
  </Connect>
</Response>
      `,
    });
  }
}
