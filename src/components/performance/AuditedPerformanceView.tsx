'use client';

import React, { useState } from 'react';
import { PerformanceStats, TradeSignal } from '@/types/signals';
import { OutcomeBadge, SignalBadge } from '../common/Badge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  TrendingUp,
  Percent,
  ShieldCheck,
  Scale,
  Award,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AuditedPerformanceViewProps {
  stats: PerformanceStats;
  history: TradeSignal[];
}

export const AuditedPerformanceView: React.FC<AuditedPerformanceViewProps> = ({ stats, history }) => {
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');

  const filteredHistory = history.filter((sig) => {
    if (filterPair !== 'ALL' && sig.pair !== filterPair) return false;
    if (filterOutcome !== 'ALL' && sig.outcome !== filterOutcome) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Audited Guarantee & Compliance Alert */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0F141F] to-blue-950/40 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                100% Audited & Transparent Track Record
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Every trade signal is recorded automatically in the database at the exact candle open timestamp.
                No deleted trades, no cherry-picking, no hidden drawdowns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Sample: {stats.samplePeriod}</span>
          </div>
        </div>
      </div>

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Win Rate */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{stats.winRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">
              {stats.winCount}W / {stats.lossCount}L
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stats.winRate}%` }} />
          </div>
        </div>

        {/* Profit Factor */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profit Factor</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{stats.profitFactor}</span>
            <span className="text-xs text-cyan-400 font-semibold">Gross P/L Ratio</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Institutional benchmark: &gt;1.75</p>
        </div>

        {/* Total Net Pips */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Pips</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">+{stats.totalPips}</span>
            <span className="text-xs text-slate-400 font-semibold">pips gained</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Across 8 major currency pairs</p>
        </div>

        {/* Max Drawdown */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Drawdown</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-300 font-mono">-{stats.maxDrawdownPercent}%</span>
            <span className="text-xs text-slate-400 font-semibold">Sharpe: {stats.sharpeRatio}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Conservative capital preservation</p>
        </div>
      </div>

      {/* Audited Signal Ledger Table */}
      <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Verified Signals History
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {filteredHistory.length} Trades
              </span>
            </h3>
            <p className="text-xs text-slate-400">Complete historical trade logs with executed prices and results</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">Wins Only</option>
              <option value="LOSS">Losses Only</option>
              <option value="BREAKEVEN">Breakevens</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Pair</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Entry</th>
                <th className="py-2.5 px-3">Stop Loss</th>
                <th className="py-2.5 px-3">Take Profit</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 text-right">Net Pips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((sig) => {
                const dateStr = new Date(sig.timestamp * 1000).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });

                return (
                  <tr key={sig.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">{dateStr}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        {sig.pair}
                        <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                          {sig.timeframe}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <SignalBadge direction={sig.direction} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">{sig.entryPrice}</td>
                    <td className="py-3 px-3 font-mono text-rose-400">{sig.stopLoss}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{sig.takeProfit}</td>
                    <td className="py-3 px-3">
                      <OutcomeBadge outcome={sig.outcome || 'WIN'} pnlPips={sig.pnlPips} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {sig.pnlPips !== undefined && (
                        <span className={sig.pnlPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sig.pnlPips >= 0 ? '+' : ''}
                          {sig.pnlPips.toFixed(1)} pips
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Risk Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
