export interface JvbNetworkMetrics {
  activeConferences: number;
  participants: number;
  timestamp: Date;
}

export interface NetworkStatsResponse {
  success: boolean;
  data?: JvbNetworkMetrics;
  error?: string;
}
