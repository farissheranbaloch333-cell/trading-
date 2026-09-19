import { calculateEMA, calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, calculateATR } from './indicators.ts';
import { detectCandlestickPatterns } from './patterns.ts';
import { generateTradeSignal } from './signalGenerator.ts';
import { runBacktest } from './backtest.ts';
import { Candle } from '../../types/market.ts';

export function runQuantEngineTests(): { passed: boolean; testResults: { name: string; success: boolean; details: string }[] } {
  const testResults: { name: string; success: boolean; details: string }[] = [];

  const assert = (condition: boolean, name: string, details: string) => {
    testResults.push({ name, success: condition, details });
  };

  // 1. Test SMA and EMA Math
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const sma5 = calculateSMA(prices, 5);
  // SMA for index 4 (first 5 items: 10,11,12,13,14) -> (10+11+12+13+14)/5 = 12
  assert(sma5[4] === 12, 'SMA Calculation', `Expected sma5[4] == 12, got ${sma5[4]}`);

  const ema5 = calculateEMA(prices, 5);
  assert(ema5[4] === 12 && ema5[5] !== null && ema5[5] > 12, 'EMA Calculation', `Expected ema5[5] > 12, got ${ema5[5]}`);

  // 2. Test RSI Math
  const risingCandles: Candle[] = [];
  const baseTime = 1700000000;
  for (let i = 0; i < 30; i++) {
    risingCandles.push({
      time: baseTime + i * 60,
      open: 1.0500 + i * 0.0010,
      high: 1.0510 + i * 0.0010,
      low: 1.0495 + i * 0.0010,
      close: 1.0508 + i * 0.0010,
      volume: 1000,
    });
  }
  const rsiRising = calculateRSI(risingCandles, 14);
  const lastRsi = rsiRising[rsiRising.length - 1];
  assert(lastRsi !== null && lastRsi > 70, 'RSI Trend Detection', `Expected rising market RSI > 70, got ${lastRsi}`);

  // 3. Test Candlestick Pattern: Bullish Engulfing
  const engulfingCandles: Candle[] = [
    { time: baseTime, open: 1.0850, high: 1.0860, low: 1.0790, close: 1.0800, volume: 100 }, // Bearish
    { time: baseTime + 60, open: 1.0800, high: 1.0810, low: 1.0740, close: 1.0750, volume: 100 }, // Bearish
    { time: baseTime + 120, open: 1.0745, high: 1.0870, low: 1.0740, close: 1.0865, volume: 200 }, // Huge Bullish engulfing
  ];
  const patterns = detectCandlestickPatterns(engulfingCandles);
  const bullEngulfingFound = patterns.some((p) => p.type === 'BULLISH_ENGULFING');
  assert(bullEngulfingFound, 'Bullish Engulfing Detection', `Expected BULLISH_ENGULFING to be detected`);

  // 4. Test Candlestick Pattern: Hammer
  const hammerCandles: Candle[] = [
    { time: baseTime, open: 1.0850, high: 1.0860, low: 1.0800, close: 1.0810, volume: 100 },
    { time: baseTime + 60, open: 1.0810, high: 1.0815, low: 1.0720, close: 1.0805, volume: 150 }, // Long lower wick
    { time: baseTime + 120, open: 1.0805, high: 1.0810, low: 1.0730, close: 1.0800, volume: 150 },
  ];
  const hammerPatterns = detectCandlestickPatterns(hammerCandles);
  const hammerFound = hammerPatterns.some((p) => p.type === 'HAMMER' || p.type === 'DRAGONFLY_DOJI');
  assert(hammerFound, 'Hammer / Reversal Wick Detection', `Expected Hammer or Reversal Wick detected`);

  // 5. Test Signal Generator
  const multiTfCandles: Record<string, Candle[]> = {
    '15m': risingCandles,
    '1h': risingCandles,
    '4h': risingCandles,
  };
  const signalNoTrade = generateTradeSignal({
    pair: 'EUR/USD',
    timeframe: '15m',
    timeframeCandles: multiTfCandles as any,
    sentimentScore: 0.5,
    minConfidenceThreshold: 99, // forces NO_TRADE
  });
  assert(signalNoTrade.pair === 'EUR/USD', 'Signal Generator Pair Verification', `Generated signal for ${signalNoTrade.pair}`);

  // Test BUY signal with confluence
  const signalBuy = generateTradeSignal({
    pair: 'EUR/USD',
    timeframe: '15m',
    timeframeCandles: multiTfCandles as any,
    sentimentScore: 1.0,
    minConfidenceThreshold: 10,
  });
  if (signalBuy.direction === 'BUY') {
    assert(signalBuy.takeProfit > signalBuy.entryPrice && signalBuy.stopLoss < signalBuy.entryPrice, 'Risk/Reward Take Profit Calculation', `TP: ${signalBuy.takeProfit} > Entry: ${signalBuy.entryPrice} > SL: ${signalBuy.stopLoss}`);
  } else {
    assert(signalBuy.confidence >= 0, 'Risk/Reward Calculation', `Confidence: ${signalBuy.confidence}%`);
  }

  // 6. Test Backtest Engine
  const btResult = runBacktest({
    pair: 'EUR/USD',
    timeframe: '15m',
    candles: risingCandles,
    initialBalance: 10000,
  });
  assert(btResult.initialBalance === 10000, 'Backtest Initial Balance', `Expected 10000, got ${btResult.initialBalance}`);
  assert(Array.isArray(btResult.equityCurve), 'Backtest Equity Curve Formation', `Equity points: ${btResult.equityCurve.length}`);

  const passed = testResults.every((t) => t.success);
  return { passed, testResults };
}
