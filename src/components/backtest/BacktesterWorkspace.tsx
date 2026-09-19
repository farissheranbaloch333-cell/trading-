'use client';

import React, { useState } from 'react';
import { CurrencyPair, Timeframe } from '@/types/market';
import { ALL_PAIRS } from '@/lib/market/pairs';
import { getCandles } from '@/lib/market/dataFeed';
import { runBacktest, BacktestResult } from '@/lib/engine/backtest';
import { OutcomeBadge } from '../common/Badge';
import { Layers, Play, DollarSign, Percent, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

export const BacktesterWorkspace: React.FC = () => {
  const [pair, setPair] = useState<CurrencyPair>('EUR/USD');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [initialBalance, setInitialBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [minRiskReward, setMinRiskReward] = useState<number>(2.0);

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(() => {
    const candles = getCandles('EUR/USD', '15m');
    return runBacktest({
      pair: 'EUR/USD',
      timeframe: '15m',
      candles,
      initialBalance: 10000,
      riskPercentPerTrade: 1.5,
      minRiskReward: 2.0,
    });
  });

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const candles = getCandles(pair, timeframe);
      const res = runBacktest({
        pair,
        timeframe,
        candles,
        initialBalance,
        riskPercentPerTrade: riskPercent,
        minRiskReward,
      });
      setResult(res);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Backtest Parameters Toolbar */}
      <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Strategy Backtester Engine</h3>
            <p className="text-xs text-slate-400">
              Simulate quantitative candlestick & confluence strategy across historical candle series
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {/* Pair */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Asset / Pair</label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value as CurrencyPair)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            >
              {ALL_PAIRS.map((p) => (
                <option key={p} value={p} className="bg-[#0F141F]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            >
              {(['1m', '5m', '15m', '30m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
                <option key={tf} value={tf} className="bg-[#0F141F]">
                  {tf}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Starting Balance ($)</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Risk % */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Risk per Trade (%)</label>
            <input
              type="number"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              {isRunning ? 'Simulating...' : 'Run Backtest'}
            </button>
          </div>
        </div>
      </div>

      {/* Backtest Results KPIs */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Final Balance */}
            <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Net Profit</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={clsx(
                    'text-2xl font-black font-mono',
                    result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {result.netProfit >= 0 ? '+' : ''}${result.netProfit}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {result.netProfitPercent >= 0 ? '+' : ''}
                {result.netProfitPercent}% return
              </span>
            </div>

            {/* Win Rate */}
            <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Win Rate</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {result.winRate}%
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                {result.winCount}W / {result.lossCount}L
              </span>
            </div>

            {/* Profit Factor */}
            <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Profit Factor</span>
              <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">
                {result.profitFactor}
              </span>
              <span className="text-xs text-slate-400">Gross P/L Ratio</span>
            </div>

            {/* Max Drawdown */}
            <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Max Drawdown</span>
              <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">
                -{result.maxDrawdownPercent}%
              </span>
              <span className="text-xs text-slate-400 font-mono">Peak-to-valley</span>
            </div>

            {/* Total Trades */}
            <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Trades</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {result.totalTrades}
              </span>
              <span className="text-xs text-slate-400 font-mono">Sharpe: {result.sharpeRatio}</span>
            </div>
          </div>

          {/* Trade Execution Ledger */}
          <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl">
            <h4 className="text-sm font-black text-white mb-3">Simulated Backtest Trade Log</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase font-semibold">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Entry Price</th>
                    <th className="py-2 px-3">Exit Price</th>
                    <th className="py-2 px-3">Stop Loss</th>
                    <th className="py-2 px-3">Take Profit</th>
                    <th className="py-2 px-3">Pips</th>
                    <th className="py-2 px-3">Profit ($)</th>
                    <th className="py-2 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.trades.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 font-mono">
                      <td className="py-2.5 px-3">
                        <span
                          className={clsx(
                            'font-bold px-2 py-0.5 rounded text-[11px]',
                            t.direction === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          )}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{t.entryPrice}</td>
                      <td className="py-2.5 px-3 text-slate-300">{t.exitPrice}</td>
                      <td className="py-2.5 px-3 text-rose-400">{t.stopLoss}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{t.takeProfit}</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={t.pnlPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.pnlPips >= 0 ? '+' : ''}
                          {t.pnlPips}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={t.pnlAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.pnlAmount >= 0 ? '+' : ''}${t.pnlAmount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <OutcomeBadge outcome={t.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
