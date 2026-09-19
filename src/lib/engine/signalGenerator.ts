import { Candle, CurrencyPair, Timeframe } from '@/types/market';
import { TradeSignal, SignalDirection } from '@/types/signals';
import { FOREX_PAIRS } from '../market/pairs';
import { computeAllIndicators, calculateATR } from './indicators';
import { detectCandlestickPatterns } from './patterns';
import { evaluateMultiTimeframeAlignment } from './confluence';

// Duration in seconds for each timeframe
export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '1D': 86400,
};

export interface GenerateSignalOptions {
  pair: CurrencyPair;
  timeframe: Timeframe;
  timeframeCandles: Partial<Record<Timeframe, Candle[]>>;
  newsBlackoutActive?: boolean;
  nextHighImpactEvent?: string;
  minutesToEvent?: number;
  sentimentScore?: number; // -1.0 to 1.0
  minRiskReward?: number;
  minConfidenceThreshold?: number;
}

export function generateTradeSignal(options: GenerateSignalOptions): TradeSignal {
  const {
    pair,
    timeframe,
    timeframeCandles,
    newsBlackoutActive = false,
    nextHighImpactEvent,
    minutesToEvent,
    sentimentScore = 0,
    minRiskReward = 1.5,
    minConfidenceThreshold = 60,
  } = options;

  const currentCandles = timeframeCandles[timeframe] || [];
  const now = Math.floor(Date.now() / 1000);
  const tfSecs = TIMEFRAME_SECONDS[timeframe] || 300;
  const candleCloseTime = Math.floor(now / tfSecs) * tfSecs + tfSecs;
  const validUntil = candleCloseTime + tfSecs * 2;

  const pairConfig = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
  const decimals = pairConfig.pipDecimalPlaces + 1;

  // If news blackout is active, immediately return NO_TRADE
  if (newsBlackoutActive) {
    const lastPrice = currentCandles.length > 0 ? currentCandles[currentCandles.length - 1].close : 1.0;
    return {
      id: `sig-${pair.replace('/', '')}-${timeframe}-${now}`,
      pair,
      timeframe,
      direction: 'NO_TRADE',
      entryPrice: Number(lastPrice.toFixed(decimals)),
      stopLoss: Number(lastPrice.toFixed(decimals)),
      takeProfit: Number(lastPrice.toFixed(decimals)),
      riskRewardRatio: 0,
      confidence: 0,
      timestamp: now,
      validUntil,
      candleCloseTime,
      reason: `NO TRADE: High-impact economic news event "${nextHighImpactEvent || 'Central Bank / Economic Release'}" is imminent (${minutesToEvent || '<15'}m). Signal engine safety blackout enabled to prevent slippage.`,
      patterns: [],
      confluences: [],
      newsStatus: {
        blackoutActive: true,
        nextHighImpactEvent,
        minutesToEvent,
      },
      sentimentScore: Math.round(sentimentScore * 100),
      technicalScore: 0,
      outcome: 'PENDING',
    };
  }

  if (currentCandles.length < 20) {
    const lastPrice = currentCandles.length > 0 ? currentCandles[currentCandles.length - 1].close : 1.0;
    return {
      id: `sig-${pair.replace('/', '')}-${timeframe}-${now}`,
      pair,
      timeframe,
      direction: 'NO_TRADE',
      entryPrice: Number(lastPrice.toFixed(decimals)),
      stopLoss: Number(lastPrice.toFixed(decimals)),
      takeProfit: Number(lastPrice.toFixed(decimals)),
      riskRewardRatio: 0,
      confidence: 0,
      timestamp: now,
      validUntil,
      candleCloseTime,
      reason: 'NO TRADE: Market data warming up. Awaiting sufficient historical bars for institutional confluence validation.',
      patterns: [],
      confluences: [],
      newsStatus: { blackoutActive: false },
      sentimentScore: 0,
      technicalScore: 0,
      outcome: 'PENDING',
    };
  }

  // 1. Technical Analysis on Active Timeframe
  const indicators = computeAllIndicators(currentCandles);
  const patterns = detectCandlestickPatterns(currentCandles.slice(-15));
  const lastIndex = currentCandles.length - 1;
  const currentCandle = currentCandles[lastIndex];
  const entryPrice = currentCandle.close;

  // 2. Multi-Timeframe Confluence
  const mtfAnalysis = evaluateMultiTimeframeAlignment(timeframeCandles);

  // 3. Technical Scoring
  let techScore = 0;
  const reasonsList: string[] = [];

  // EMA alignment
  const ema9 = indicators.ema9[lastIndex];
  const ema21 = indicators.ema21[lastIndex];
  const ema50 = indicators.ema50[lastIndex];
  const ema200 = indicators.ema200[lastIndex];

  if (ema9 !== null && ema21 !== null && ema9 > ema21) {
    techScore += 15;
    reasonsList.push('EMA 9/21 bullish fast cross');
  } else if (ema9 !== null && ema21 !== null && ema9 < ema21) {
    techScore -= 15;
    reasonsList.push('EMA 9/21 bearish cross');
  }

  if (ema50 !== null && ema200 !== null) {
    if (entryPrice > ema50 && ema50 > ema200) {
      techScore += 20;
      reasonsList.push('Macro trend bullish above 50/200 EMA');
    } else if (entryPrice < ema50 && ema50 < ema200) {
      techScore -= 20;
      reasonsList.push('Macro trend bearish below 50/200 EMA');
    }
  }

  // RSI
  const rsi = indicators.rsi14[lastIndex];
  if (rsi !== null) {
    if (rsi < 35) {
      techScore += 18;
      reasonsList.push(`RSI (${rsi.toFixed(1)}) oversold turnaround`);
    } else if (rsi > 65) {
      techScore -= 18;
      reasonsList.push(`RSI (${rsi.toFixed(1)}) overbought pullback risk`);
    }
  }

  // MACD
  const macdHist = indicators.macd.histogram[lastIndex];
  if (macdHist !== null && macdHist > 0) {
    techScore += 12;
    reasonsList.push('MACD positive momentum acceleration');
  } else if (macdHist !== null && macdHist < 0) {
    techScore -= 12;
    reasonsList.push('MACD negative histogram expansion');
  }

  // Candlestick Pattern Confirmation
  const recentPatterns = patterns.slice(-2);
  recentPatterns.forEach((p) => {
    if (p.bias === 'BULLISH') {
      techScore += p.reliability === 'HIGH' ? 25 : 15;
      reasonsList.push(`Confirmed pattern: ${p.name}`);
    } else if (p.bias === 'BEARISH') {
      techScore -= p.reliability === 'HIGH' ? 25 : 15;
      reasonsList.push(`Confirmed pattern: ${p.name}`);
    }
  });

  // Sentiment Boost
  const sentimentScoreNorm = sentimentScore * 20; // -20 to +20

  // Combine Scores
  // Weighting: 40% Tech Score + 40% Multi-Timeframe + 20% News Sentiment
  const combinedScore = techScore * 0.45 + mtfAnalysis.overallScore * 0.4 + sentimentScoreNorm * 0.15;

  let direction: SignalDirection = 'NO_TRADE';
  let confidence = Math.min(95, Math.round(Math.abs(combinedScore)));

  if (combinedScore >= 30 && mtfAnalysis.overallBias === 'BULLISH') {
    direction = 'BUY';
  } else if (combinedScore <= -30 && mtfAnalysis.overallBias === 'BEARISH') {
    direction = 'SELL';
  } else {
    direction = 'NO_TRADE';
  }

  if (confidence < minConfidenceThreshold) {
    direction = 'NO_TRADE';
  }

  // Calculate Dynamic Stop Loss & Take Profit via ATR
  const atrArray = calculateATR(currentCandles, 14);
  const currentATR = atrArray[lastIndex] || pairConfig.pipSize * 20;
  const slPipsDistance = Math.max(currentATR * 1.5, pairConfig.pipSize * 15);
  const targetRiskReward = Math.max(minRiskReward, 2.0); // 1:2.0 target

  let stopLoss = entryPrice;
  let takeProfit = entryPrice;

  if (direction === 'BUY') {
    stopLoss = entryPrice - slPipsDistance;
    takeProfit = entryPrice + slPipsDistance * targetRiskReward;
  } else if (direction === 'SELL') {
    stopLoss = entryPrice + slPipsDistance;
    takeProfit = entryPrice - slPipsDistance * targetRiskReward;
  }

  // Plain-English Explanation
  let plainEnglishReason = '';
  if (direction === 'BUY') {
    plainEnglishReason = `High-probability BUY signal on ${pair} (${timeframe}): ${reasonsList.slice(0, 3).join(', ')}. Multi-timeframe confluence aligns bullish (${mtfAnalysis.confluences.filter(c => c.bias === 'BULLISH').length}/${mtfAnalysis.confluences.length} frames). Target 1:${targetRiskReward.toFixed(1)} Risk-to-Reward with protective SL at ${stopLoss.toFixed(decimals)}.`;
  } else if (direction === 'SELL') {
    plainEnglishReason = `High-probability SELL signal on ${pair} (${timeframe}): ${reasonsList.slice(0, 3).join(', ')}. Multi-timeframe confluence aligns bearish (${mtfAnalysis.confluences.filter(c => c.bias === 'BEARISH').length}/${mtfAnalysis.confluences.length} frames). Target 1:${targetRiskReward.toFixed(1)} Risk-to-Reward with protective SL at ${stopLoss.toFixed(decimals)}.`;
  } else {
    plainEnglishReason = `Market currently in consolidation on ${pair} (${timeframe}). Multi-timeframe trend lacks unified directional consensus (Score: ${Math.round(combinedScore)}). Waiting for clear breakout pattern or indicator confluence before executing.`;
  }

  return {
    id: `sig-${pair.replace('/', '')}-${timeframe}-${now}`,
    pair,
    timeframe,
    direction,
    entryPrice: Number(entryPrice.toFixed(decimals)),
    stopLoss: Number(stopLoss.toFixed(decimals)),
    takeProfit: Number(takeProfit.toFixed(decimals)),
    riskRewardRatio: direction === 'NO_TRADE' ? 0 : targetRiskReward,
    confidence: direction === 'NO_TRADE' ? Math.max(20, confidence) : confidence,
    timestamp: now,
    validUntil,
    candleCloseTime,
    reason: plainEnglishReason,
    patterns: recentPatterns,
    confluences: mtfAnalysis.confluences,
    newsStatus: {
      blackoutActive: false,
      nextHighImpactEvent,
      minutesToEvent,
    },
    sentimentScore: Math.round(sentimentScore * 100),
    technicalScore: Math.round(techScore),
    outcome: 'PENDING',
  };
}
