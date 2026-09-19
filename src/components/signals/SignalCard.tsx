'use client';

import React, { useEffect, useRef } from 'react';
import { TradeSignal } from '@/types/signals';
import { SignalBadge } from '../common/Badge';
import { CountdownTimer } from '../common/CountdownTimer';
import { sounds } from '@/lib/audio/sounds';
import {
  ShieldAlert,
  Sparkles,
  Layers,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import { formatPakistanTime } from '@/lib/time/pakistanTime';
import { clsx } from 'clsx';

interface SignalCardProps {
  signal: TradeSignal;
  onSelectPair?: (pair: any) => void;
  compact?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onSelectPair, compact = false }) => {
  const prevDirectionRef = useRef(signal.direction);

  useEffect(() => {
    if (prevDirectionRef.current !== signal.direction && signal.direction !== 'NO_TRADE') {
      if (signal.direction === 'BUY') {
        sounds.playBullishChime();
      } else if (signal.direction === 'SELL') {
        sounds.playBearishChime();
      }
    }
    prevDirectionRef.current = signal.direction;
  }, [signal.direction]);

  const isBuy = signal.direction === 'BUY';
  const isSell = signal.direction === 'SELL';
  const isNoTrade = signal.direction === 'NO_TRADE';

  return (
    <div
      className={clsx(
        'relative rounded-2xl border transition-all duration-300 overflow-hidden',
        isBuy
          ? 'bg-gradient-to-b from-emerald-950/30 via-[#0F141F] to-[#080B11] border-emerald-500/30 shadow-lg shadow-emerald-500/10'
          : isSell
          ? 'bg-gradient-to-b from-rose-950/30 via-[#0F141F] to-[#080B11] border-rose-500/30 shadow-lg shadow-rose-500/10'
          : 'bg-[#0F141F] border-white/10'
      )}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectPair && onSelectPair(signal.pair)}
            className="cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white group-hover:text-emerald-400 transition">
                {signal.pair}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {signal.timeframe}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                🇵🇰 {formatPakistanTime(signal.timestamp, false)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SignalBadge direction={signal.direction} size="md" />
        </div>
      </div>

      {/* Main Signal Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Entry Price</span>
            <span className="text-base font-mono font-bold text-white mt-1">{signal.entryPrice}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex flex-col">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Stop Loss
            </span>
            <span className="text-base font-mono font-bold text-rose-300 mt-1">{signal.stopLoss}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex flex-col">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3" /> Take Profit
            </span>
            <span className="text-base font-mono font-bold text-emerald-300 mt-1">{signal.takeProfit}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Risk / Reward</span>
            <span className="text-base font-mono font-bold text-cyan-300 mt-1">
              {signal.riskRewardRatio > 0 ? `1:${signal.riskRewardRatio.toFixed(1)}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Confidence Gauge & Live Countdown Timers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/30 border border-white/5">
          {/* Confidence Meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Algorithm Confidence
              </span>
              <span className="font-mono font-black text-emerald-400 text-sm">{signal.confidence}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-700',
                  signal.confidence >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : signal.confidence >= 60
                    ? 'bg-amber-400'
                    : 'bg-slate-600'
                )}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>

          {/* Candle Close & Validity Countdown */}
          <div>
            <CountdownTimer
              targetTimestamp={signal.candleCloseTime}
              label="Candle Close"
              variant="compact"
            />
            <div className="mt-1">
              <CountdownTimer
                targetTimestamp={signal.validUntil}
                label="Signal Expiry"
                variant="compact"
              />
            </div>
          </div>
        </div>

        {/* Plain-English AI Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Quant Rationale & Confluence Breakdown</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{signal.reason}</p>
        </div>

        {/* Multi-Timeframe Alignment Pills */}
        {signal.confluences && signal.confluences.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Confluence:
            </span>
            {signal.confluences.map((c) => (
              <span
                key={c.timeframe}
                className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                  c.bias === 'BULLISH'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : c.bias === 'BEARISH'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}
              >
                {c.timeframe}: {c.bias}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
