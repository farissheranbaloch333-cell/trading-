export interface IndicatorResults {
  ema9: (number | null)[];
  ema21: (number | null)[];
  ema50: (number | null)[];
  ema200: (number | null)[];
  sma20: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi14: (number | null)[];
  macd: {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  };
  bollingerBands: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
    bandwidth: (number | null)[];
  };
  atr14: (number | null)[];
  stochastic: {
    k: (number | null)[];
    d: (number | null)[];
  };
  adx14: {
    adx: (number | null)[];
    pdi: (number | null)[];
    ndi: (number | null)[];
  };
  vwap: (number | null)[];
  pivotPoints: {
    pp: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  supportResistanceLevels: {
    price: number;
    strength: number; // 1 to 5 touches
    type: 'SUPPORT' | 'RESISTANCE';
  }[];
}

export type CandlestickPatternType =
  | 'DOJI'
  | 'DRAGONFLY_DOJI'
  | 'GRAVESTONE_DOJI'
  | 'HAMMER'
  | 'INVERTED_HAMMER'
  | 'SHOOTING_STAR'
  | 'HANGING_MAN'
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'BULLISH_HARAMI'
  | 'BEARISH_HARAMI'
  | 'THREE_WHITE_SOLDIERS'
  | 'THREE_BLACK_CROWS'
  | 'PIERCING_LINE'
  | 'DARK_CLOUD_COVER';

export interface DetectedPattern {
  id: string;
  type: CandlestickPatternType;
  name: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reliability: 'LOW' | 'MEDIUM' | 'HIGH';
  time: number; // Timestamp of the candle
  price: number;
  description: string;
}
