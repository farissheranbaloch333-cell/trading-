export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D';

export type CurrencyPair = 
  | 'EUR/USD'
  | 'GBP/USD'
  | 'USD/JPY'
  | 'AUD/USD'
  | 'USD/CAD'
  | 'USD/CHF'
  | 'NZD/USD'
  | 'XAU/USD';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LiveQuote {
  pair: CurrencyPair;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface PairConfig {
  id: string;
  symbol: CurrencyPair;
  baseCurrency: string;
  quoteCurrency: string;
  pipSize: number;
  pipDecimalPlaces: number;
  defaultSpreadPips: number;
  minPrice: number;
  maxPrice: number;
  description: string;
  isPopular?: boolean;
}

export type MarketSession = 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'SYDNEY';

export interface SessionInfo {
  name: MarketSession;
  label: string;
  openUtcHour: number;
  closeUtcHour: number;
  isActive: boolean;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  timeRemaining?: string;
}
