import { Module, DynamicModule, Provider } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JitsiStatusController } from './jicofo.controller';
import { JitsiStatusService } from './jicofo.service';

export interface JitsiConfig {
  videobridgeHost: string;
  videobridgePort: number;
  jicofoHost: string;
  jicofoPort: number;
  timeout: number;
}

@Module({})
export class JitsiStatusModule {
  static forRoot(config?: Partial<JitsiConfig>): DynamicModule {
    // Valeurs par défaut garanties
    const fullConfig: JitsiConfig = {
      videobridgeHost: config?.videobridgeHost ?? 'localhost',
      videobridgePort: config?.videobridgePort ?? 8080,
      jicofoHost: config?.jicofoHost ?? 'localhost',
      jicofoPort: config?.jicofoPort ?? 8888,
      timeout: config?.timeout ?? 5000,
    };

    const configProvider: Provider = {
      provide: 'JITSI_CONFIG',
      useValue: fullConfig,
    };

    return {
      module: JitsiStatusModule,
      imports: [HttpModule],
      controllers: [JitsiStatusController],
      providers: [JitsiStatusService, configProvider],
      exports: [JitsiStatusService],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<Partial<JitsiConfig>> | Partial<JitsiConfig>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: JitsiStatusModule,
      imports: [HttpModule],
      controllers: [JitsiStatusController],
      providers: [
        JitsiStatusService,
        {
          provide: 'JITSI_CONFIG',
          useFactory: async (...args: any[]) => {
            const partialConfig = await options.useFactory(...args);
            // Garantir les valeurs par défaut
            return {
              videobridgeHost: partialConfig?.videobridgeHost ?? 'localhost',
              videobridgePort: partialConfig?.videobridgePort ?? 8080,
              jicofoHost: partialConfig?.jicofoHost ?? 'localhost',
              jicofoPort: partialConfig?.jicofoPort ?? 8888,
              timeout: partialConfig?.timeout ?? 5000,
            };
          },
          inject: options.inject || [],
        },
      ],
      exports: [JitsiStatusService],
    };
  }
}
