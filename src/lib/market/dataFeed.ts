import { Candle, CurrencyPair, LiveQuote, Timeframe } from '@/types/market';
import { FOREX_PAIRS, ALL_PAIRS } from './pairs';
import { getMarketSessions } from './sessions';
import { TIMEFRAME_SECONDS } from '../engine/signalGenerator';

// In-memory candle storage per pair and timeframe
const candleCache: Map<string, Candle[]> = new Map();
const quoteCache: Map<CurrencyPair, LiveQuote> = new Map();
const subscribers: Set<(quote: LiveQuote) => void> = new Set();
const candleSubscribers: Set<(pair: CurrencyPair, tf: Timeframe, candle: Candle) => void> = new Set();

let isEngineStarted = false;
let tickIntervalId: NodeJS.Timeout | null = null;

// Initial base reference prices
const REFERENCE_PRICES: Record<CurrencyPair, number> = {
  'EUR/USD': 1.0865,
  'GBP/USD': 1.2940,
  'USD/JPY': 153.25,
  'AUD/USD': 0.6580,
  'USD/CAD': 1.3720,
  'USD/CHF': 0.8840,
  'NZD/USD': 0.5980,
  'XAU/USD': 2742.50,
};

// Generate realistic historical candles using random walk with mean-reversion
export function generateSeedCandles(
  pair: CurrencyPair,
  timeframe: Timeframe,
  count: number = 200
): Candle[] {
  const cacheKey = `${pair}-${timeframe}`;
  if (candleCache.has(cacheKey)) {
    return candleCache.get(cacheKey)!;
  }

  const config = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
  const basePrice = REFERENCE_PRICES[pair] || 1.0;
  const tfSecs = TIMEFRAME_SECONDS[timeframe] || 300;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * tfSecs;

  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const volatility = pair === 'XAU/USD' ? 1.8 : pair === 'USD/JPY' ? 0.08 : 0.00035 * Math.sqrt(tfSecs / 60);

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + i * tfSecs;
    const open = currentPrice;

    // Generate sub-steps within the candle
    const steps = 4;
    let high = open;
    let low = open;
    let stepPrice = open;

    for (let s = 0; s < steps; s++) {
      const meanReversion = (basePrice - stepPrice) * 0.02;
      const randomNoise = (Math.random() - 0.495) * volatility;
      stepPrice += meanReversion + randomNoise;
      if (stepPrice > high) high = stepPrice;
      if (stepPrice < low) low = stepPrice;
    }

    const close = stepPrice;
    currentPrice = close;

    const volume = Math.floor(500 + Math.random() * 1500 + (Math.abs(close - open) / (config.pipSize * 5)) * 400);

    candles.push({
      time: candleTime,
      open: Number(open.toFixed(config.pipDecimalPlaces + 1)),
      high: Number(high.toFixed(config.pipDecimalPlaces + 1)),
      low: Number(low.toFixed(config.pipDecimalPlaces + 1)),
      close: Number(close.toFixed(config.pipDecimalPlaces + 1)),
      volume,
    });
  }

  candleCache.set(cacheKey, candles);
  return candles;
}

export function getCandles(pair: CurrencyPair, timeframe: Timeframe): Candle[] {
  const cacheKey = `${pair}-${timeframe}`;
  if (!candleCache.has(cacheKey)) {
    return generateSeedCandles(pair, timeframe, 200);
  }
  return candleCache.get(cacheKey)!;
}

export function getLatestQuote(pair: CurrencyPair): LiveQuote {
  if (quoteCache.has(pair)) {
    return quoteCache.get(pair)!;
  }

  const candles = getCandles(pair, '1m');
  const lastCandle = candles[candles.length - 1];
  const config = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
  const spreadHalf = (config.defaultSpreadPips * config.pipSize) / 2;

  const quote: LiveQuote = {
    pair,
    bid: Number((lastCandle.close - spreadHalf).toFixed(config.pipDecimalPlaces + 1)),
    ask: Number((lastCandle.close + spreadHalf).toFixed(config.pipDecimalPlaces + 1)),
    mid: lastCandle.close,
    spread: config.defaultSpreadPips,
    change24h: Number((lastCandle.close - candles[0].open).toFixed(config.pipDecimalPlaces + 1)),
    changePercent24h: Number((((lastCandle.close - candles[0].open) / candles[0].open) * 100).toFixed(2)),
    high24h: Math.max(...candles.map((c) => c.high)),
    low24h: Math.min(...candles.map((c) => c.low)),
    timestamp: Math.floor(Date.now() / 1000),
  };

  quoteCache.set(pair, quote);
  return quote;
}

export function getAllQuotes(): LiveQuote[] {
  return ALL_PAIRS.map((pair) => getLatestQuote(pair));
}

// Tick Simulation Step
function processLiveTick() {
  const { isHighVolatilityOverlap } = getMarketSessions();
  const volMultiplier = isHighVolatilityOverlap ? 1.5 : 1.0;
  const now = Math.floor(Date.now() / 1000);

  ALL_PAIRS.forEach((pair) => {
    const config = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
    const currentQuote = getLatestQuote(pair);

    const basePip = config.pipSize;
    const tickVariance = (Math.random() - 0.49) * basePip * 1.5 * volMultiplier;
    const newMid = Number((currentQuote.mid + tickVariance).toFixed(config.pipDecimalPlaces + 1));
    const spreadPips = config.defaultSpreadPips + (Math.random() * 0.3 - 0.15);
    const spreadHalf = (spreadPips * basePip) / 2;

    const newQuote: LiveQuote = {
      pair,
      bid: Number((newMid - spreadHalf).toFixed(config.pipDecimalPlaces + 1)),
      ask: Number((newMid + spreadHalf).toFixed(config.pipDecimalPlaces + 1)),
      mid: newMid,
      spread: Number(spreadPips.toFixed(1)),
      change24h: Number((newMid - REFERENCE_PRICES[pair]).toFixed(config.pipDecimalPlaces + 1)),
      changePercent24h: Number((((newMid - REFERENCE_PRICES[pair]) / REFERENCE_PRICES[pair]) * 100).toFixed(2)),
      high24h: Math.max(currentQuote.high24h, newMid),
      low24h: Math.min(currentQuote.low24h, newMid),
      timestamp: now,
    };

    quoteCache.set(pair, newQuote);

    // Update Candles across all active timeframes
    const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];
    timeframes.forEach((tf) => {
      const cacheKey = `${pair}-${tf}`;
      const candles = getCandles(pair, tf);
      const tfSecs = TIMEFRAME_SECONDS[tf];
      const candleStartTime = Math.floor(now / tfSecs) * tfSecs;

      if (candles.length > 0) {
        const lastCandle = candles[candles.length - 1];

        if (lastCandle.time === candleStartTime) {
          // Update current candle
          lastCandle.high = Math.max(lastCandle.high, newMid);
          lastCandle.low = Math.min(lastCandle.low, newMid);
          lastCandle.close = newMid;
          lastCandle.volume += Math.floor(5 + Math.random() * 15);
          candleSubscribers.forEach((cb) => cb(pair, tf, lastCandle));
        } else if (now >= candleStartTime) {
          // New candle period started
          const newCandle: Candle = {
            time: candleStartTime,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newMid),
            low: Math.min(lastCandle.close, newMid),
            close: newMid,
            volume: 10,
          };
          candles.push(newCandle);
          if (candles.length > 300) candles.shift();
          candleSubscribers.forEach((cb) => cb(pair, tf, newCandle));
        }
      }
    });

    // Notify Quote Subscribers
    subscribers.forEach((cb) => cb(newQuote));
  });
}

export function startLiveMarketEngine() {
  if (isEngineStarted) return;
  isEngineStarted = true;

  // Initialize seed candles for all pairs
  ALL_PAIRS.forEach((pair) => {
    (['1m', '5m', '15m', '30m', '1h', '4h', '1D'] as Timeframe[]).forEach((tf) => {
      generateSeedCandles(pair, tf, 200);
    });
  });

  // Run tick updates every 1.5 seconds
  tickIntervalId = setInterval(() => {
    processLiveTick();
  }, 1500);
}

export function subscribeToQuotes(callback: (quote: LiveQuote) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function subscribeToCandles(
  callback: (pair: CurrencyPair, tf: Timeframe, candle: Candle) => void
): () => void {
  candleSubscribers.add(callback);
  return () => {
    candleSubscribers.delete(callback);
  };
}
