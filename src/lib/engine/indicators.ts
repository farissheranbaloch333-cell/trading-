import { Candle } from '@/types/market';
import { IndicatorResults } from '@/types/indicators';

export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(Number((sum / period).toFixed(6)));
    }
  }
  return result;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);

  let initialSMA = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      initialSMA = sum / period;
      result.push(Number(initialSMA.toFixed(6)));
    } else {
      const prevEma = result[i - 1]!;
      const currentEma = data[i] * k + prevEma * (1 - k);
      result.push(Number(currentEma.toFixed(6)));
    }
  }
  return result;
}

export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (candles.length < period + 1) {
    return candles.map(() => null);
  }

  const changes: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }

  result.push(null); // for index 0

  let avgGain = 0;
  let avgLoss = 0;

  // First period
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
    result.push(null);
  }
  avgGain /= period;
  avgLoss /= period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  result[period] = Number(rsi.toFixed(2));

  // Subsequent periods (Wilder's smoothing)
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
    result.push(Number(rsi.toFixed(2)));
  }

  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const closes = candles.map((c) => c.close);
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine.push(Number((fastEMA[i]! - slowEMA[i]!).toFixed(6)));
    } else {
      macdLine.push(null);
    }
  }

  // Calculate signal line from non-null macdLine values
  const validMacdValues: number[] = [];
  const validIndices: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      validMacdValues.push(macdLine[i]!);
      validIndices.push(i);
    }
  }

  const signalEma = calculateEMA(validMacdValues, signalPeriod);
  const signalLine: (number | null)[] = closes.map(() => null);
  const histogram: (number | null)[] = closes.map(() => null);

  for (let i = 0; i < validIndices.length; i++) {
    const originalIndex = validIndices[i];
    const sig = signalEma[i];
    signalLine[originalIndex] = sig;
    if (sig !== null && macdLine[originalIndex] !== null) {
      histogram[originalIndex] = Number((macdLine[originalIndex]! - sig).toFixed(6));
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  bandwidth: (number | null)[];
} {
  const closes = candles.map((c) => c.close);
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const bandwidth: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
      bandwidth.push(null);
    } else {
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
        const diff = closes[i - j] - middle[i]!;
        sumSquares += diff * diff;
      }
      const stdDev = Math.sqrt(sumSquares / period);
      const u = Number((middle[i]! + stdDevMultiplier * stdDev).toFixed(6));
      const l = Number((middle[i]! - stdDevMultiplier * stdDev).toFixed(6));
      upper.push(u);
      lower.push(l);
      bandwidth.push(middle[i]! !== 0 ? Number((((u - l) / middle[i]!) * 100).toFixed(3)) : 0);
    }
  }

  return { upper, middle, lower, bandwidth };
}

export function calculateATR(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (candles.length < 2) return candles.map(() => null);

  const trueRanges: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trueRanges.push(tr);
  }

  let atr = 0;
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += trueRanges[j];
      atr = sum / period;
      result.push(Number(atr.toFixed(6)));
    } else {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      result.push(Number(atr.toFixed(6)));
    }
  }

  return result;
}

export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3,
  slowing: number = 3
): {
  k: (number | null)[];
  d: (number | null)[];
} {
  const rawK: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) {
      rawK.push(null);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = 0; j < kPeriod; j++) {
        if (candles[i - j].high > highestHigh) highestHigh = candles[i - j].high;
        if (candles[i - j].low < lowestLow) lowestLow = candles[i - j].low;
      }
      const range = highestHigh - lowestLow;
      if (range === 0) {
        rawK.push(50);
      } else {
        const val = ((candles[i].close - lowestLow) / range) * 100;
        rawK.push(Number(val.toFixed(2)));
      }
    }
  }

  // Smooth rawK to get %K
  const validRawK: number[] = [];
  const validIndices: number[] = [];
  for (let i = 0; i < rawK.length; i++) {
    if (rawK[i] !== null) {
      validRawK.push(rawK[i]!);
      validIndices.push(i);
    }
  }

  const smoothedK = calculateSMA(validRawK, slowing);
  const finalK: (number | null)[] = candles.map(() => null);

  for (let i = 0; i < validIndices.length; i++) {
    finalK[validIndices[i]] = smoothedK[i];
  }

  // Calculate %D as SMA of %K
  const validKList: number[] = [];
  const validKIndices: number[] = [];
  for (let i = 0; i < finalK.length; i++) {
    if (finalK[i] !== null) {
      validKList.push(finalK[i]!);
      validKIndices.push(i);
    }
  }

  const dValues = calculateSMA(validKList, dPeriod);
  const finalD: (number | null)[] = candles.map(() => null);

  for (let i = 0; i < validKIndices.length; i++) {
    finalD[validKIndices[i]] = dValues[i];
  }

  return { k: finalK, d: finalD };
}

export function calculateADX(
  candles: Candle[],
  period: number = 14
): {
  adx: (number | null)[];
  pdi: (number | null)[];
  ndi: (number | null)[];
} {
  const len = candles.length;
  if (len < period * 2) {
    return {
      adx: candles.map(() => null),
      pdi: candles.map(() => null),
      ndi: candles.map(() => null),
    };
  }

  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < len; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    const prevClose = candles[i - 1].close;

    const currentTR = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    tr.push(currentTR);

    const upMove = high - prevHigh;
    const downMove = prevLow - low;

    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }

    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }

  const smoothedTR: number[] = [];
  const smoothedPlusDM: number[] = [];
  const smoothedMinusDM: number[] = [];

  let trSum = 0;
  let pDmSum = 0;
  let mDmSum = 0;

  for (let i = 0; i < period; i++) {
    trSum += tr[i];
    pDmSum += plusDM[i];
    mDmSum += minusDM[i];
  }

  smoothedTR.push(trSum);
  smoothedPlusDM.push(pDmSum);
  smoothedMinusDM.push(mDmSum);

  for (let i = period; i < tr.length; i++) {
    const prevTR = smoothedTR[smoothedTR.length - 1];
    const prevPDM = smoothedPlusDM[smoothedPlusDM.length - 1];
    const prevMDM = smoothedMinusDM[smoothedMinusDM.length - 1];

    smoothedTR.push(prevTR - prevTR / period + tr[i]);
    smoothedPlusDM.push(prevPDM - prevPDM / period + plusDM[i]);
    smoothedMinusDM.push(prevMDM - prevMDM / period + minusDM[i]);
  }

  const pdi: (number | null)[] = [null];
  const ndi: (number | null)[] = [null];
  const dx: number[] = [];

  for (let i = 0; i < period - 1; i++) {
    pdi.push(null);
    ndi.push(null);
  }

  for (let i = 0; i < smoothedTR.length; i++) {
    const currentTR = smoothedTR[i];
    const pVal = currentTR === 0 ? 0 : (smoothedPlusDM[i] / currentTR) * 100;
    const nVal = currentTR === 0 ? 0 : (smoothedMinusDM[i] / currentTR) * 100;
    pdi.push(Number(pVal.toFixed(2)));
    ndi.push(Number(nVal.toFixed(2)));

    const sum = pVal + nVal;
    const diff = Math.abs(pVal - nVal);
    const dxVal = sum === 0 ? 0 : (diff / sum) * 100;
    dx.push(dxVal);
  }

  const adxResult: (number | null)[] = candles.map(() => null);
  if (dx.length >= period) {
    let adxSum = 0;
    for (let i = 0; i < period; i++) adxSum += dx[i];
    let currentADX = adxSum / period;

    const firstAdxIndex = period * 2;
    if (firstAdxIndex < candles.length) {
      adxResult[firstAdxIndex] = Number(currentADX.toFixed(2));
      for (let i = period; i < dx.length; i++) {
        currentADX = (currentADX * (period - 1) + dx[i]) / period;
        const targetIdx = firstAdxIndex + (i - period + 1);
        if (targetIdx < candles.length) {
          adxResult[targetIdx] = Number(currentADX.toFixed(2));
        }
      }
    }
  }

  return { adx: adxResult, pdi, ndi };
}

export function calculateVWAP(candles: Candle[]): (number | null)[] {
  const result: (number | null)[] = [];
  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume > 0 ? c.volume : 100;

    cumulativeTypicalVolume += typicalPrice * vol;
    cumulativeVolume += vol;

    const vwap = cumulativeTypicalVolume / cumulativeVolume;
    result.push(Number(vwap.toFixed(6)));
  }

  return result;
}

export function calculatePivotPoints(candles: Candle[]): {
  pp: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
} {
  if (candles.length === 0) {
    return { pp: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 };
  }

  // Use the last completed candle
  const lastCandle = candles[candles.length - 1];
  const { high, low, close } = lastCandle;

  const pp = (high + low + close) / 3;
  const r1 = 2 * pp - low;
  const s1 = 2 * pp - high;
  const r2 = pp + (high - low);
  const s2 = pp - (high - low);
  const r3 = high + 2 * (pp - low);
  const s3 = low - 2 * (high - pp);

  return {
    pp: Number(pp.toFixed(5)),
    r1: Number(r1.toFixed(5)),
    r2: Number(r2.toFixed(5)),
    r3: Number(r3.toFixed(5)),
    s1: Number(s1.toFixed(5)),
    s2: Number(s2.toFixed(5)),
    s3: Number(s3.toFixed(5)),
  };
}

export function detectSupportResistance(
  candles: Candle[],
  thresholdPercent: number = 0.0015
): { price: number; strength: number; type: 'SUPPORT' | 'RESISTANCE' }[] {
  if (candles.length < 20) return [];

  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    if (
      current.high > candles[i - 1].high &&
      current.high > candles[i - 2].high &&
      current.high > candles[i + 1].high &&
      current.high > candles[i + 2].high
    ) {
      pivotHighs.push(current.high);
    }

    if (
      current.low < candles[i - 1].low &&
      current.low < candles[i - 2].low &&
      current.low < candles[i + 1].low &&
      current.low < candles[i + 2].low
    ) {
      pivotLows.push(current.low);
    }
  }

  // Cluster nearby levels
  const clusters: { price: number; strength: number; type: 'SUPPORT' | 'RESISTANCE' }[] = [];

  const clusterLevels = (levels: number[], type: 'SUPPORT' | 'RESISTANCE') => {
    levels.forEach((level) => {
      const existing = clusters.find(
        (c) => c.type === type && Math.abs(c.price - level) / level < thresholdPercent
      );
      if (existing) {
        existing.strength = Math.min(5, existing.strength + 1);
        existing.price = (existing.price + level) / 2;
      } else {
        clusters.push({
          price: Number(level.toFixed(5)),
          strength: 1,
          type,
        });
      }
    });
  };

  clusterLevels(pivotHighs, 'RESISTANCE');
  clusterLevels(pivotLows, 'SUPPORT');

  return clusters.sort((a, b) => b.strength - a.strength).slice(0, 8);
}

export function computeAllIndicators(candles: Candle[]): IndicatorResults {
  const closes = candles.map((c) => c.close);
  return {
    ema9: calculateEMA(closes, 9),
    ema21: calculateEMA(closes, 21),
    ema50: calculateEMA(closes, 50),
    ema200: calculateEMA(closes, 200),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    rsi14: calculateRSI(candles, 14),
    macd: calculateMACD(candles, 12, 26, 9),
    bollingerBands: calculateBollingerBands(candles, 20, 2),
    atr14: calculateATR(candles, 14),
    stochastic: calculateStochastic(candles, 14, 3, 3),
    adx14: calculateADX(candles, 14),
    vwap: calculateVWAP(candles),
    pivotPoints: calculatePivotPoints(candles),
    supportResistanceLevels: detectSupportResistance(candles),
  };
}
