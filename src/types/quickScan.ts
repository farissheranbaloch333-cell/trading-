export type FastTradeExpiry = '5s' | '15s' | '30s' | '1m' | '2m' | '5m';

export interface FastTradeAsset {
  symbol: string;
  name: string;
  category: 'FOREX' | 'OTC' | 'COMMODITY' | 'CRYPTO';
  payoutPercent: number; // e.g. 89%
  basePrice: number;
  pipDecimals: number;
}

export interface AnalysisPhase {
  name: string;
  status: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // 0 to 100
  detail: string;
}

export interface FastTradeSignal {
  id: string;
  asset: string;
  expiry: FastTradeExpiry;
  direction: 'UP' | 'DOWN' | 'WAIT';
  action: 'CALL (UP)' | 'PUT (DOWN)' | 'NO TRADE';
  confidence: number; // e.g. 92%
  entryPrice: number;
  timestamp: number;
  validForSeconds: number; // execution window countdown
  phases: AnalysisPhase[];
  technicalSummary: string;
  tickVelocity: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  winProbability: number;
  payoutPercent: number;
}
