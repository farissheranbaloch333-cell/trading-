import { CurrencyPair, Timeframe } from './market';
import { DetectedPattern } from './indicators';

export type SignalDirection = 'BUY' | 'SELL' | 'NO_TRADE';

export type SignalOutcome = 'PENDING' | 'WIN' | 'LOSS' | 'BREAKEVEN' | 'EXPIRED';

export interface ConfluenceItem {
  timeframe: Timeframe;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // -100 to 100
  keyFactors: string[];
}

export interface TradeSignal {
  id: string;
  pair: CurrencyPair;
  timeframe: Timeframe;
  direction: SignalDirection;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number; // e.g., 2.0 (1:2.0)
  confidence: number; // 0 - 100%
  timestamp: number; // When signal was created
  validUntil: number; // Expiry timestamp
  candleCloseTime: number; // Current candle close timestamp
  reason: string; // Plain-English AI explanation
  patterns: DetectedPattern[];
  confluences: ConfluenceItem[];
  newsStatus: {
    blackoutActive: boolean;
    nextHighImpactEvent?: string;
    minutesToEvent?: number;
  };
  sentimentScore: number;
  technicalScore: number;
  outcome?: SignalOutcome;
  closedAt?: number;
  pnlPips?: number;
}

export interface DailyRankedTrade {
  rank: number;
  pair: CurrencyPair;
  timeframe: Timeframe;
  direction: SignalDirection;
  confidence: number;
  expectedValueR: number;
  catalyst: string;
  signalId: string;
}

export interface PerformanceStats {
  totalSignals: number;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  winRate: number; // e.g., 68.5%
  profitFactor: number; // e.g., 2.14
  totalPips: number;
  maxDrawdownPercent: number; // e.g., 4.2%
  avgRiskReward: number; // e.g., 1:2.1
  sharpeRatio: number; // e.g., 1.85
  samplePeriod: string;
}
