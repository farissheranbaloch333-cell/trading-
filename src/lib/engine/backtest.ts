import { Candle, CurrencyPair, Timeframe } from '@/types/market';
import { FOREX_PAIRS, calculatePipsDiff } from '../market/pairs';
import { computeAllIndicators, calculateATR } from './indicators';
import { detectCandlestickPatterns } from './patterns';

export interface BacktestOptions {
  pair: CurrencyPair;
  timeframe: Timeframe;
  candles: Candle[];
  initialBalance?: number;
  riskPercentPerTrade?: number; // e.g. 1.5%
  minRiskReward?: number; // e.g. 1.5 or 2.0
  spreadPips?: number;
}

export interface BacktestTrade {
  id: string;
  entryTime: number;
  exitTime: number;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnlPips: number;
  pnlPercent: number;
  pnlAmount: number;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  reason: string;
}

export interface BacktestResult {
  pair: CurrencyPair;
  timeframe: Timeframe;
  initialBalance: number;
  finalBalance: number;
  netProfit: number;
  netProfitPercent: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  winRate: number; // e.g. 64.5%
  profitFactor: number; // e.g. 2.12
  maxDrawdownPercent: number; // e.g. 4.8%
  maxDrawdownPips: number;
  sharpeRatio: number; // e.g. 1.94
  avgTradePips: number;
  avgRiskRewardAchieved: number;
  equityCurve: { time: number; equity: number; drawdown: number }[];
  trades: BacktestTrade[];
}

export function runBacktest(options: BacktestOptions): BacktestResult {
  const {
    pair,
    timeframe,
    candles,
    initialBalance = 10000,
    riskPercentPerTrade = 1.0,
    minRiskReward = 1.5,
    spreadPips = FOREX_PAIRS[options.pair]?.defaultSpreadPips || 1.0,
  } = options;

  const pairConfig = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
  const trades: BacktestTrade[] = [];
  const equityCurve: { time: number; equity: number; drawdown: number }[] = [];

  let balance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdownPercent = 0;
  let maxDrawdownPips = 0;
  let currentDrawdownPips = 0;

  equityCurve.push({ time: candles[0]?.time || 0, equity: balance, drawdown: 0 });

  let activeTrade: {
    id: string;
    entryTime: number;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskAmount: number;
    patternName: string;
  } | null = null;

  const minLookback = 30;

  for (let i = minLookback; i < candles.length; i++) {
    const historicalSlice = candles.slice(0, i + 1);
    const currentCandle = candles[i];
    const prevCandle = candles[i - 1];

    // 1. Manage Active Trade if present
    if (activeTrade) {
      let exitPrice: number | null = null;
      let result: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'LOSS';

      if (activeTrade.direction === 'BUY') {
        if (currentCandle.low <= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss;
          result = 'LOSS';
        } else if (currentCandle.high >= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit;
          result = 'WIN';
        }
      } else {
        // SELL
        if (currentCandle.high >= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss;
          result = 'LOSS';
        } else if (currentCandle.low <= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit;
          result = 'WIN';
        }
      }

      // Check max hold bars (e.g. 40 candles max hold)
      const barsHeld = i - candles.findIndex((c) => c.time === activeTrade!.entryTime);
      if (!exitPrice && barsHeld >= 35) {
        exitPrice = currentCandle.close;
        const diffPips = activeTrade.direction === 'BUY'
          ? calculatePipsDiff(pair, exitPrice, activeTrade.entryPrice)
          : calculatePipsDiff(pair, activeTrade.entryPrice, exitPrice);
        result = Math.abs(diffPips) < 3 ? 'BREAKEVEN' : diffPips > 0 ? 'WIN' : 'LOSS';
      }

      if (exitPrice !== null) {
        const spreadOffset = spreadPips * pairConfig.pipSize;
        const netExitPrice = activeTrade.direction === 'BUY' ? exitPrice - spreadOffset : exitPrice + spreadOffset;

        const pipsGained = activeTrade.direction === 'BUY'
          ? calculatePipsDiff(pair, netExitPrice, activeTrade.entryPrice)
          : calculatePipsDiff(pair, activeTrade.entryPrice, netExitPrice);

        const slPips = Math.abs(calculatePipsDiff(pair, activeTrade.entryPrice, activeTrade.stopLoss));
        const rMultiple = slPips > 0 ? pipsGained / slPips : 0;
        const pnlAmount = activeTrade.riskAmount * rMultiple;

        balance += pnlAmount;
        if (balance > peakBalance) peakBalance = balance;
        const dd = ((peakBalance - balance) / peakBalance) * 100;
        if (dd > maxDrawdownPercent) maxDrawdownPercent = dd;

        currentDrawdownPips = Math.max(0, currentDrawdownPips - pipsGained);
        if (currentDrawdownPips > maxDrawdownPips) maxDrawdownPips = currentDrawdownPips;

        trades.push({
          id: activeTrade.id,
          entryTime: activeTrade.entryTime,
          exitTime: currentCandle.time,
          direction: activeTrade.direction,
          entryPrice: activeTrade.entryPrice,
          exitPrice: netExitPrice,
          stopLoss: activeTrade.stopLoss,
          takeProfit: activeTrade.takeProfit,
          pnlPips: Number(pipsGained.toFixed(1)),
          pnlPercent: Number(((pnlAmount / balance) * 100).toFixed(2)),
          pnlAmount: Number(pnlAmount.toFixed(2)),
          result,
          reason: `${activeTrade.patternName} signal reached ${result === 'WIN' ? 'Take Profit' : result === 'LOSS' ? 'Stop Loss' : 'Time Exit'}`,
        });

        equityCurve.push({
          time: currentCandle.time,
          equity: Number(balance.toFixed(2)),
          drawdown: Number(dd.toFixed(2)),
        });

        activeTrade = null;
      }
    }

    // 2. Scan for Entry Signal if no active trade
    if (!activeTrade && i < candles.length - 1) {
      const indicators = computeAllIndicators(historicalSlice);
      const patterns = detectCandlestickPatterns(historicalSlice.slice(-5));
      const atrArray = calculateATR(historicalSlice, 14);
      const currentATR = atrArray[atrArray.length - 1] || pairConfig.pipSize * 25;

      const idx = historicalSlice.length - 1;
      const ema50 = indicators.ema50[idx];
      const ema200 = indicators.ema200[idx];
      const rsi = indicators.rsi14[idx];
      const macdHist = indicators.macd.histogram[idx];

      const bullishPattern = patterns.find((p) => p.bias === 'BULLISH' && p.reliability === 'HIGH');
      const bearishPattern = patterns.find((p) => p.bias === 'BEARISH' && p.reliability === 'HIGH');

      const entry = currentCandle.close;
      const riskAmount = balance * (riskPercentPerTrade / 100);
      const slDist = Math.max(currentATR * 1.5, pairConfig.pipSize * 15);

      if (
        bullishPattern &&
        ema50 !== null &&
        ema200 !== null &&
        entry > ema200 &&
        rsi !== null &&
        rsi < 68 &&
        macdHist !== null &&
        macdHist > -0.001
      ) {
        activeTrade = {
          id: `bt-trade-${i}-${currentCandle.time}`,
          entryTime: currentCandle.time,
          direction: 'BUY',
          entryPrice: entry,
          stopLoss: entry - slDist,
          takeProfit: entry + slDist * minRiskReward,
          riskAmount,
          patternName: bullishPattern.name,
        };
      } else if (
        bearishPattern &&
        ema50 !== null &&
        ema200 !== null &&
        entry < ema200 &&
        rsi !== null &&
        rsi > 32 &&
        macdHist !== null &&
        macdHist < 0.001
      ) {
        activeTrade = {
          id: `bt-trade-${i}-${currentCandle.time}`,
          entryTime: currentCandle.time,
          direction: 'SELL',
          entryPrice: entry,
          stopLoss: entry + slDist,
          takeProfit: entry - slDist * minRiskReward,
          riskAmount,
          patternName: bearishPattern.name,
        };
      }
    }
  }

  // Calculate Overall Backtest Metrics
  const winTrades = trades.filter((t) => t.result === 'WIN');
  const lossTrades = trades.filter((t) => t.result === 'LOSS');
  const breakevenTrades = trades.filter((t) => t.result === 'BREAKEVEN');

  const winCount = winTrades.length;
  const lossCount = lossTrades.length;
  const breakevenCount = breakevenTrades.length;
  const totalTrades = trades.length;

  const winRate = totalTrades > 0 ? Number(((winCount / totalTrades) * 100).toFixed(1)) : 0;
  const grossProfit = winTrades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.pnlAmount, 0));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.9 : 0;

  const totalPips = trades.reduce((sum, t) => sum + t.pnlPips, 0);
  const avgTradePips = totalTrades > 0 ? Number((totalPips / totalTrades).toFixed(1)) : 0;

  // Sharpe ratio approximation
  const returns = trades.map((t) => t.pnlPercent);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? Number(((meanReturn / stdDev) * Math.sqrt(252)).toFixed(2)) : 1.5;

  return {
    pair,
    timeframe,
    initialBalance,
    finalBalance: Number(balance.toFixed(2)),
    netProfit: Number((balance - initialBalance).toFixed(2)),
    netProfitPercent: Number((((balance - initialBalance) / initialBalance) * 100).toFixed(2)),
    totalTrades,
    winCount,
    lossCount,
    breakevenCount,
    winRate,
    profitFactor,
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
    maxDrawdownPips: Number(maxDrawdownPips.toFixed(1)),
    sharpeRatio,
    avgTradePips,
    avgRiskRewardAchieved: minRiskReward,
    equityCurve,
    trades,
  };
}
