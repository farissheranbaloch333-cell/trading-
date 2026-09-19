'use client';

import React from 'react';
import { DailyRankedTrade } from '@/types/signals';
import { SignalBadge } from '../common/Badge';
import { Trophy, TrendingUp, TrendingDown, ArrowRight, Zap, Target } from 'lucide-react';
import { CurrencyPair } from '@/types/market';
import { clsx } from 'clsx';

interface BestTradesTodayProps {
  rankedTrades: DailyRankedTrade[];
  onSelectPair?: (pair: CurrencyPair) => void;
}

export const BestTradesToday: React.FC<BestTradesTodayProps> = ({ rankedTrades, onSelectPair }) => {
  return (
    <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Best Opportunities Today
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE RANKING
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked dynamically by algorithmic confluence score & risk-to-reward ratio
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Exp. Value</th>
              <th className="py-2.5 px-3">Primary Catalyst</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankedTrades.map((trade) => (
              <tr
                key={trade.signalId}
                className="hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => onSelectPair && onSelectPair(trade.pair)}
              >
                <td className="py-3 px-3 font-mono font-bold">
                  <span
                    className={clsx(
                      'w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black',
                      trade.rank === 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : trade.rank === 2
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                        : trade.rank === 3
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    #{trade.rank}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white group-hover:text-emerald-400 transition">
                      {trade.pair}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {trade.timeframe}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <SignalBadge direction={trade.direction} size="sm" />
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{trade.confidence}%</span>
                    <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${trade.confidence}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                  +{trade.expectedValueR.toFixed(2)} R
                </td>
                <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                  {trade.catalyst}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPair && onSelectPair(trade.pair);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold transition border border-emerald-500/30 text-xs"
                  >
                    Chart <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
