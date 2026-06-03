import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  latency?: number;
  bridgeCount?: number;
}

interface JitsiHealthStatus {
  videobridge: boolean;
  jicofo: boolean;
  prosody: boolean;
  overall: boolean;
  timestamp: Date;
  details?: {
    videobridgeMessage?: string;
    jicofoMessage?: string;
    prosodyMessage?: string;
  };
}

interface JitsiConfig {
  jicofoHost: string;
  jicofoPort: number;
  timeout: number;
}

interface JicofoStats {
  conferences: number;
  participants: number;
  largest_conference: number;
  version: string;
  bridge_selector: {
    bridge_count: number;
    operational_bridge_count: number;
    lost_bridges: number;
  };
  jigasi_detector?: {
    sip_count: number;
  };
}

@Injectable()
export class JitsiStatusService {
  private readonly logger = new Logger(JitsiStatusService.name);
  private config: JitsiConfig;

  constructor(
    private readonly httpService: HttpService,
    @Optional() @Inject('JITSI_CONFIG') config?: Partial<JitsiConfig>,
  ) {
    this.config = {
      jicofoHost: config?.jicofoHost ?? '192.168.1.200',
      jicofoPort: config?.jicofoPort ?? 8888,
      timeout: config?.timeout ?? 5000,
    };

    this.logger.log(
      `Jitsi Config: Jicofo=${this.config.jicofoHost}:${this.config.jicofoPort}`,
    );
  }

  // ── Health status : JVB déduit depuis Jicofo ─────────────────────────────
  async getHealthStatus(): Promise<JitsiHealthStatus> {
    const jicofoStatus = await this.checkJicofo();

    // JVB considéré actif si Jicofo rapporte au moins 1 bridge opérationnel
    const videobridgeHealthy =
      jicofoStatus.healthy && (jicofoStatus.bridgeCount ?? 0) > 0;

    return {
      videobridge: videobridgeHealthy,
      jicofo: jicofoStatus.healthy,
      prosody: jicofoStatus.healthy,
      overall: videobridgeHealthy && jicofoStatus.healthy,
      timestamp: new Date(),
      details: {
        videobridgeMessage: videobridgeHealthy
          ? `JVB opérationnel — ${jicofoStatus.bridgeCount} bridge(s) actif(s) (via Jicofo)`
          : 'JVB indisponible (aucun bridge opérationnel)',
        jicofoMessage: jicofoStatus.message,
        prosodyMessage: jicofoStatus.healthy
          ? 'Prosody actif'
          : 'Prosody indisponible',
      },
    };
  }

  // ── Jicofo : seul endpoint accessible depuis l'extérieur ─────────────────
  private async checkJicofo(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const url = `http://${this.config.jicofoHost}:${this.config.jicofoPort}/stats`;

    this.logger.debug(`Checking Jicofo at: ${url}`);

    try {
      const response = await firstValueFrom<AxiosResponse<JicofoStats>>(
        this.httpService.get<JicofoStats>(url).pipe(
          timeout(this.config.timeout),
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );

      const latency = Date.now() - startTime;
      const data = response.data;
      const bridges = data.bridge_selector?.operational_bridge_count ?? 0;

      this.logger.log(
        `Jicofo OK in ${latency}ms | conferences=${data.conferences} participants=${data.participants} bridges=${bridges}`,
      );

      if (bridges === 0) {
        this.logger.warn('Jicofo: aucun bridge opérationnel — les appels vidéo ne fonctionneront pas');
      }

      return {
        healthy: true,
        latency,
        bridgeCount: bridges,
        message: `Jicofo opérationnel (v${data.version}) — ${bridges} bridge(s) actif(s)`,
      };
    } catch (error) {
      const err = error as Error | AxiosError;
      this.logger.error(`Jicofo health check failed: ${err.message}`);
      return {
        healthy: false,
        bridgeCount: 0,
        message: `Erreur: ${err.message}`,
      };
    }
  }

  // ── Quick check via Jicofo ────────────────────────────────────────────────
  async quickCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom<AxiosResponse<JicofoStats>>(
        this.httpService
          .get<JicofoStats>(
            `http://${this.config.jicofoHost}:${this.config.jicofoPort}/stats`,
          )
          .pipe(timeout(2000)),
      );
      const bridges = response.data.bridge_selector?.operational_bridge_count ?? 0;
      return response.status === 200 && bridges > 0;
    } catch {
      return false;
    }
  }

  // ── Métriques : tout via Jicofo ───────────────────────────────────────────
  async getMetrics(): Promise<{
    activeConferences?: number;
    participants?: number;
    operationalBridges?: number;
    jvbLoad?: string;
    jvbDrain?: boolean;
  }> {
    const url = `http://${this.config.jicofoHost}:${this.config.jicofoPort}/stats`;

    try {
      const response = await firstValueFrom<AxiosResponse<JicofoStats>>(
        this.httpService.get<JicofoStats>(url).pipe(
          timeout(3000),
          catchError((error) => {
            this.logger.debug(`Jicofo stats failed: ${error.message}`);
            throw new Error('Jicofo stats not available');
          }),
        ),
      );

      const data = response.data;

      this.logger.log(
        `Metrics — Conferences: ${data.conferences}, Participants: ${data.participants}, ` +
          `Bridges: ${data.bridge_selector?.operational_bridge_count ?? 0}`,
      );

      return {
        activeConferences: data.conferences,
        participants: data.participants,
        operationalBridges: data.bridge_selector?.operational_bridge_count ?? 0,
        // JVB REST API non accessible depuis l'extérieur
        jvbLoad: undefined,
        jvbDrain: undefined,
      };
    } catch {
      this.logger.warn('Jicofo metrics not available');
      return {
        activeConferences: 0,
        participants: 0,
        operationalBridges: 0,
      };
    }
  }
}
