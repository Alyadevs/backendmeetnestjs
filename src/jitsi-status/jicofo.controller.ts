import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { JitsiStatusService } from './jicofo.service';
import { JitsiStatusResponseDto } from './DTO/jitsi-status.dto';

@Controller('jitsi-status')
export class JitsiStatusController {
  constructor(private readonly jitsiStatusService: JitsiStatusService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getStatus(): Promise<JitsiStatusResponseDto> {
    const status = await this.jitsiStatusService.getHealthStatus();

    return {
      videobridge: status.videobridge,
      jicofo: status.jicofo,
      prosody: status.prosody,
      overall: status.overall,
      timestamp: status.timestamp,
      message: status.overall
        ? 'Tous les services Jitsi sont opérationnels'
        : 'Certains services Jitsi sont indisponibles',
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async quickHealth() {
    const isHealthy = await this.jitsiStatusService.quickCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
    };
  }

  @Get('metrics')
  async getMetrics() {
    return this.jitsiStatusService.getMetrics();
  }
}
