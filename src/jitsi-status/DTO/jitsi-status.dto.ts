export class JitsiStatusResponseDto {
  videobridge!: boolean;
  jicofo!: boolean;
  prosody!: boolean;
  overall!: boolean;
  timestamp!: Date;
  message?: string;
}

export class JitsiHealthCheckDto {
  status!: 'healthy' | 'unhealthy' | 'degraded';
  services!: {
    videobridge: { status: string; latency?: number };
    jicofo: { status: string; latency?: number };
    prosody: { status: string };
  };
  timestamp!: Date;
}
