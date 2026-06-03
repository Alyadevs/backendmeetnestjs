export interface JitsiHealthStatus {
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

export interface JitsiConfig {
  videobridgeHost: string;
  videobridgePort: number;
  jicofoHost: string;
  jicofoPort: number;
  timeout: number;
}
