export type NewsImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  date: string; // ISO string
  timestamp: number; // Unix seconds
  impact: NewsImpact;
  forecast?: string;
  previous?: string;
  actual?: string;
  unit?: string;
  country: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  timestamp: number;
  currencies: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number; // -1.0 to 1.0
  aiAnalysis?: string;
}

export interface CurrencySentiment {
  currency: string;
  score: number; // -100 to +100
  sentiment: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  rationale: string;
  lastUpdated: number;
  relevantEventsCount: number;
}
