import { CurrencyPair } from './market';

export interface AdminMetrics {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
  activeSignalsToday: number;
  todayWinRate: number;
  apiHealth: {
    marketDataStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    aiProviderStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    databaseStatus: 'HEALTHY' | 'DOWN';
    latencyMs: number;
  };
}

export interface StrategyWeights {
  candlestickPatterns: number; // default: 25%
  indicatorConfluence: number; // default: 35%
  multiTimeframeAlignment: number; // default: 25%
  newsSentiment: number; // default: 15%
  minRiskReward: number; // default: 1.5
  minConfidenceThreshold: number; // default: 65%
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  isActive: boolean;
  createdAt: string;
}

export interface PairAdminConfig {
  pair: CurrencyPair;
  enabled: boolean;
  allowedTimeframes: string[];
  maxSpreadThresholdPips: number;
}
