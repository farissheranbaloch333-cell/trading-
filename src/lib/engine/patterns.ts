import { Candle } from '@/types/market';
import { DetectedPattern } from '@/types/indicators';

export function detectCandlestickPatterns(candles: Candle[]): DetectedPattern[] {
  if (candles.length < 3) return [];

  const detected: DetectedPattern[] = [];

  // Helper functions for candle geometry
  const body = (c: Candle) => Math.abs(c.close - c.open);
  const upperWick = (c: Candle) => c.high - Math.max(c.open, c.close);
  const lowerWick = (c: Candle) => Math.min(c.open, c.close) - c.low;
  const candleRange = (c: Candle) => c.high - c.low;
  const isBullish = (c: Candle) => c.close > c.open;
  const isBearish = (c: Candle) => c.close < c.open;

  for (let i = 2; i < candles.length; i++) {
    const c0 = candles[i - 2];
    const c1 = candles[i - 1];
    const c2 = candles[i]; // current candle

    const b2 = body(c2);
    const range2 = candleRange(c2);
    const uWick2 = upperWick(c2);
    const lWick2 = lowerWick(c2);

    if (range2 === 0) continue;

    // 1. DOJI Patterns
    if (b2 <= range2 * 0.1) {
      if (lWick2 >= range2 * 0.65 && uWick2 <= range2 * 0.15) {
        detected.push({
          id: `pattern-${c2.time}-dragonfly-doji`,
          type: 'DRAGONFLY_DOJI',
          name: 'Dragonfly Doji',
          bias: 'BULLISH',
          reliability: 'MEDIUM',
          time: c2.time,
          price: c2.close,
          description: 'Bullish reversal: buyers rejected lower prices with long lower shadow.',
        });
      } else if (uWick2 >= range2 * 0.65 && lWick2 <= range2 * 0.15) {
        detected.push({
          id: `pattern-${c2.time}-gravestone-doji`,
          type: 'GRAVESTONE_DOJI',
          name: 'Gravestone Doji',
          bias: 'BEARISH',
          reliability: 'MEDIUM',
          time: c2.time,
          price: c2.close,
          description: 'Bearish reversal: sellers pushed price down from highs.',
        });
      } else {
        detected.push({
          id: `pattern-${c2.time}-doji`,
          type: 'DOJI',
          name: 'Doji',
          bias: 'NEUTRAL',
          reliability: 'LOW',
          time: c2.time,
          price: c2.close,
          description: 'Market indecision: equilibrium between buyers and sellers.',
        });
      }
    }

    // 2. HAMMER (Bullish reversal at support/downtrend)
    if (
      lWick2 >= b2 * 2 &&
      uWick2 <= range2 * 0.15 &&
      b2 >= range2 * 0.15 &&
      isBearish(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-hammer`,
        type: 'HAMMER',
        name: 'Hammer',
        bias: 'BULLISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Bullish rejection: strong buying off lows after downtrend.',
      });
    }

    // 3. INVERTED HAMMER
    if (
      uWick2 >= b2 * 2 &&
      lWick2 <= range2 * 0.15 &&
      b2 >= range2 * 0.15 &&
      isBearish(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-inv-hammer`,
        type: 'INVERTED_HAMMER',
        name: 'Inverted Hammer',
        bias: 'BULLISH',
        reliability: 'MEDIUM',
        time: c2.time,
        price: c2.close,
        description: 'Bullish testing: buyers attempted upward breakout.',
      });
    }

    // 4. SHOOTING STAR (Bearish reversal at uptrend)
    if (
      uWick2 >= b2 * 2 &&
      lWick2 <= range2 * 0.15 &&
      b2 >= range2 * 0.15 &&
      isBullish(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-shooting-star`,
        type: 'SHOOTING_STAR',
        name: 'Shooting Star',
        bias: 'BEARISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Bearish rejection: buyers failed to sustain highs.',
      });
    }

    // 5. HANGING MAN (Bearish warning at uptrend)
    if (
      lWick2 >= b2 * 2 &&
      uWick2 <= range2 * 0.15 &&
      b2 >= range2 * 0.15 &&
      isBullish(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-hanging-man`,
        type: 'HANGING_MAN',
        name: 'Hanging Man',
        bias: 'BEARISH',
        reliability: 'MEDIUM',
        time: c2.time,
        price: c2.close,
        description: 'Bearish exhaustion: heavy selling pressure emerged during session.',
      });
    }

    // 6. BULLISH ENGULFING
    if (
      isBearish(c1) &&
      isBullish(c2) &&
      c2.open <= c1.close &&
      c2.close >= c1.open &&
      b2 > body(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-bull-engulfing`,
        type: 'BULLISH_ENGULFING',
        name: 'Bullish Engulfing',
        bias: 'BULLISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Strong bullish momentum completely overwhelming previous sellers.',
      });
    }

    // 7. BEARISH ENGULFING
    if (
      isBullish(c1) &&
      isBearish(c2) &&
      c2.open >= c1.close &&
      c2.close <= c1.open &&
      b2 > body(c1)
    ) {
      detected.push({
        id: `pattern-${c2.time}-bear-engulfing`,
        type: 'BEARISH_ENGULFING',
        name: 'Bearish Engulfing',
        bias: 'BEARISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Strong bearish reversal completely engulfing preceding bullish candle.',
      });
    }

    // 8. MORNING STAR (3-Candle Bullish Reversal)
    const b0 = body(c0);
    const b1 = body(c1);
    if (
      isBearish(c0) &&
      b0 > range2 * 0.3 &&
      b1 <= b0 * 0.4 &&
      isBullish(c2) &&
      c2.close >= c0.open - b0 * 0.5
    ) {
      detected.push({
        id: `pattern-${c2.time}-morning-star`,
        type: 'MORNING_STAR',
        name: 'Morning Star',
        bias: 'BULLISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Premier 3-bar bottom reversal showing buyer capitulation turn.',
      });
    }

    // 9. EVENING STAR (3-Candle Bearish Reversal)
    if (
      isBullish(c0) &&
      b0 > range2 * 0.3 &&
      b1 <= b0 * 0.4 &&
      isBearish(c2) &&
      c2.close <= c0.open + b0 * 0.5
    ) {
      detected.push({
        id: `pattern-${c2.time}-evening-star`,
        type: 'EVENING_STAR',
        name: 'Evening Star',
        bias: 'BEARISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Premier 3-bar top reversal showing seller control takeover.',
      });
    }

    // 10. BULLISH HARAMI
    if (
      isBearish(c1) &&
      isBullish(c2) &&
      c2.open > c1.close &&
      c2.close < c1.open &&
      b2 < body(c1) * 0.6
    ) {
      detected.push({
        id: `pattern-${c2.time}-bull-harami`,
        type: 'BULLISH_HARAMI',
        name: 'Bullish Harami',
        bias: 'BULLISH',
        reliability: 'MEDIUM',
        time: c2.time,
        price: c2.close,
        description: 'Inside candle pause in downtrend signaling decreasing bear pressure.',
      });
    }

    // 11. BEARISH HARAMI
    if (
      isBullish(c1) &&
      isBearish(c2) &&
      c2.open < c1.close &&
      c2.close > c1.open &&
      b2 < body(c1) * 0.6
    ) {
      detected.push({
        id: `pattern-${c2.time}-bear-harami`,
        type: 'BEARISH_HARAMI',
        name: 'Bearish Harami',
        bias: 'BEARISH',
        reliability: 'MEDIUM',
        time: c2.time,
        price: c2.close,
        description: 'Inside candle pause in uptrend signaling bull exhaustion.',
      });
    }

    // 12. THREE WHITE SOLDIERS
    if (
      isBullish(c0) &&
      isBullish(c1) &&
      isBullish(c2) &&
      c1.close > c0.close &&
      c2.close > c1.close &&
      c1.open > c0.open &&
      c2.open > c1.open &&
      upperWick(c0) < body(c0) * 0.3 &&
      upperWick(c1) < body(c1) * 0.3 &&
      upperWick(c2) < body(c2) * 0.3
    ) {
      detected.push({
        id: `pattern-${c2.time}-three-white-soldiers`,
        type: 'THREE_WHITE_SOLDIERS',
        name: 'Three White Soldiers',
        bias: 'BULLISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Consecutive strong bullish closes confirming solid uptrend rally.',
      });
    }

    // 13. THREE BLACK CROWS
    if (
      isBearish(c0) &&
      isBearish(c1) &&
      isBearish(c2) &&
      c1.close < c0.close &&
      c2.close < c1.close &&
      c1.open < c0.open &&
      c2.open < c1.open &&
      lowerWick(c0) < body(c0) * 0.3 &&
      lowerWick(c1) < body(c1) * 0.3 &&
      lowerWick(c2) < body(c2) * 0.3
    ) {
      detected.push({
        id: `pattern-${c2.time}-three-black-crows`,
        type: 'THREE_BLACK_CROWS',
        name: 'Three Black Crows',
        bias: 'BEARISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Consecutive strong bearish closes confirming intense selling impulse.',
      });
    }

    // 14. PIERCING LINE (Bullish 2-bar reversal)
    if (
      isBearish(c1) &&
      isBullish(c2) &&
      c2.open < c1.low &&
      c2.close > (c1.open + c1.close) / 2 &&
      c2.close < c1.open
    ) {
      detected.push({
        id: `pattern-${c2.time}-piercing-line`,
        type: 'PIERCING_LINE',
        name: 'Piercing Line',
        bias: 'BULLISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Bullish reversal piercing deep above 50% midpoint of bear candle.',
      });
    }

    // 15. DARK CLOUD COVER (Bearish 2-bar reversal)
    if (
      isBullish(c1) &&
      isBearish(c2) &&
      c2.open > c1.high &&
      c2.close < (c1.open + c1.close) / 2 &&
      c2.close > c1.open
    ) {
      detected.push({
        id: `pattern-${c2.time}-dark-cloud-cover`,
        type: 'DARK_CLOUD_COVER',
        name: 'Dark Cloud Cover',
        bias: 'BEARISH',
        reliability: 'HIGH',
        time: c2.time,
        price: c2.close,
        description: 'Bearish reversal penetrating deep below 50% midpoint of bull candle.',
      });
    }
  }

  return detected;
}
