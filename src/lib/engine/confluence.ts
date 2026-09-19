import { Candle, Timeframe } from '@/types/market';
import { ConfluenceItem } from '@/types/signals';
import { computeAllIndicators } from './indicators';
import { detectCandlestickPatterns } from './patterns';

export function analyzeTimeframeConfluence(
  timeframe: Timeframe,
  candles: Candle[]
): ConfluenceItem {
  if (candles.length < 20) {
    return {
      timeframe,
      bias: 'NEUTRAL',
      score: 0,
      keyFactors: ['Insufficient historical bars for deep analysis'],
    };
  }

  const indicators = computeAllIndicators(candles);
  const patterns = detectCandlestickPatterns(candles.slice(-10));
  const lastIndex = candles.length - 1;
  const currentCandle = candles[lastIndex];
  const close = currentCandle.close;

  let score = 0;
  const factors: string[] = [];

  // 1. Moving Average Trend Structure
  const ema9 = indicators.ema9[lastIndex];
  const ema21 = indicators.ema21[lastIndex];
  const ema50 = indicators.ema50[lastIndex];
  const ema200 = indicators.ema200[lastIndex];

  if (ema9 !== null && ema21 !== null) {
    if (ema9 > ema21) {
      score += 15;
      factors.push('EMA 9/21 Bullish Golden Cross');
    } else {
      score -= 15;
      factors.push('EMA 9/21 Bearish Death Cross');
    }
  }

  if (ema50 !== null && ema200 !== null) {
    if (close > ema50 && ema50 > ema200) {
      score += 25;
      factors.push('Macro Uptrend: Price > EMA 50 > EMA 200');
    } else if (close < ema50 && ema50 < ema200) {
      score -= 25;
      factors.push('Macro Downtrend: Price < EMA 50 < EMA 200');
    }
  }

  // 2. RSI Momentum
  const rsi = indicators.rsi14[lastIndex];
  if (rsi !== null) {
    if (rsi < 30) {
      score += 20;
      factors.push(`RSI (${rsi}) in extreme oversold rebound territory`);
    } else if (rsi > 70) {
      score -= 20;
      factors.push(`RSI (${rsi}) in overbought exhaustion territory`);
    } else if (rsi > 50) {
      score += 10;
      factors.push(`RSI (${rsi}) holding above bullish 50 equilibrium`);
    } else {
      score -= 10;
      factors.push(`RSI (${rsi}) below bearish 50 equilibrium`);
    }
  }

  // 3. MACD Momentum & Histogram
  const macdHist = indicators.macd.histogram[lastIndex];
  const prevMacdHist = indicators.macd.histogram[lastIndex - 1];
  if (macdHist !== null && prevMacdHist !== null) {
    if (macdHist > 0 && macdHist > prevMacdHist) {
      score += 15;
      factors.push('MACD expanding bullish green histogram');
    } else if (macdHist < 0 && macdHist < prevMacdHist) {
      score -= 15;
      factors.push('MACD expanding bearish red histogram');
    }
  }

  // 4. Candlestick Patterns
  if (patterns.length > 0) {
    const latestPattern = patterns[patterns.length - 1];
    if (latestPattern.bias === 'BULLISH') {
      score += latestPattern.reliability === 'HIGH' ? 25 : 15;
      factors.push(`Pattern: ${latestPattern.name} (Bullish)`);
    } else if (latestPattern.bias === 'BEARISH') {
      score -= latestPattern.reliability === 'HIGH' ? 25 : 15;
      factors.push(`Pattern: ${latestPattern.name} (Bearish)`);
    }
  }

  // 5. Bollinger Bands Squeeze/Expansion
  const bb = indicators.bollingerBands;
  const upper = bb.upper[lastIndex];
  const lower = bb.lower[lastIndex];
  if (upper !== null && lower !== null) {
    if (close <= lower) {
      score += 15;
      factors.push('Price testing lower Bollinger Band support');
    } else if (close >= upper) {
      score -= 15;
      factors.push('Price testing upper Bollinger Band resistance');
    }
  }

  // Normalize score between -100 and +100
  score = Math.max(-100, Math.min(100, score));

  let bias: ConfluenceItem['bias'] = 'NEUTRAL';
  if (score >= 25) bias = 'BULLISH';
  else if (score <= -25) bias = 'BEARISH';

  return {
    timeframe,
    bias,
    score,
    keyFactors: factors.slice(0, 4),
  };
}

export function evaluateMultiTimeframeAlignment(
  timeframeCandles: Partial<Record<Timeframe, Candle[]>>
): {
  confluences: ConfluenceItem[];
  overallScore: number;
  overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confluenceRatio: number; // e.g., 0.8 (4 out of 5 timeframes agree)
} {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];
  const confluences: ConfluenceItem[] = [];

  let weightedScoreSum = 0;
  let totalWeight = 0;

  // Timeframe weights (Higher timeframes hold greater weight)
  const tfWeights: Record<Timeframe, number> = {
    '1m': 0.5,
    '5m': 1.0,
    '15m': 1.5,
    '30m': 1.8,
    '1h': 2.2,
    '4h': 2.8,
    '1D': 3.2,
  };

  let bullishCount = 0;
  let bearishCount = 0;
  let evaluatedCount = 0;

  for (const tf of timeframes) {
    const candles = timeframeCandles[tf];
    if (candles && candles.length >= 20) {
      const conf = analyzeTimeframeConfluence(tf, candles);
      confluences.push(conf);

      const weight = tfWeights[tf] || 1;
      weightedScoreSum += conf.score * weight;
      totalWeight += weight;
      evaluatedCount++;

      if (conf.bias === 'BULLISH') bullishCount++;
      else if (conf.bias === 'BEARISH') bearishCount++;
    }
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;
  let overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (overallScore >= 25) overallBias = 'BULLISH';
  else if (overallScore <= -25) overallBias = 'BEARISH';

  const maxAgreement = Math.max(bullishCount, bearishCount);
  const confluenceRatio = evaluatedCount > 0 ? Number((maxAgreement / evaluatedCount).toFixed(2)) : 0;

  return {
    confluences,
    overallScore,
    overallBias,
    confluenceRatio,
  };
}
