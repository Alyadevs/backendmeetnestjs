import * as process from 'process';

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  mongodb: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sip-bridge',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  jitsi: {
    domain: process.env.JITSI_DOMAIN ?? 'meet.jit.si',
    mucDomain: process.env.JITSI_MUC_DOMAIN ?? 'conference.meet.jit.si',
    xmppWs: process.env.JITSI_XMPP_WS ?? 'wss://meet.jit.si/xmpp-websocket',
    defaultRoom: process.env.JITSI_DEFAULT_ROOM ?? 'main-conference',
  },

  server: {
    baseUrl: process.env.SERVER_BASE_URL ?? 'http://localhost:3000',
    wsUrl: process.env.SERVER_WS_URL ?? 'ws://localhost:3000',
  },
});
