'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, MinusCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { SignalDirection, SignalOutcome } from '@/types/signals';
import { NewsImpact } from '@/types/news';

interface SignalBadgeProps {
  direction: SignalDirection;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ direction, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-semibold',
    md: 'text-sm px-3 py-1 gap-1.5 font-bold',
    lg: 'text-base px-4 py-1.5 gap-2 font-black tracking-wide',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (direction === 'BUY') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-bullish',
          sizeClasses[size]
        )}
      >
        {showIcon && <TrendingUp className={iconSizes[size]} />}
        BUY / LONG
      </span>
    );
  }

  if (direction === 'SELL') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-bearish',
          sizeClasses[size]
        )}
      >
        {showIcon && <TrendingDown className={iconSizes[size]} />}
        SELL / SHORT
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg bg-slate-500/20 text-slate-400 border border-slate-500/30',
        sizeClasses[size]
      )}
    >
      {showIcon && <MinusCircle className={iconSizes[size]} />}
      NO TRADE
    </span>
  );
};

export const OutcomeBadge: React.FC<{ outcome: SignalOutcome; pnlPips?: number }> = ({ outcome, pnlPips }) => {
  if (outcome === 'WIN') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle className="w-3 h-3" />
        WIN {pnlPips !== undefined && `(+${pnlPips.toFixed(1)} pips)`}
      </span>
    );
  }
  if (outcome === 'LOSS') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3 h-3" />
        LOSS {pnlPips !== undefined && `(${pnlPips.toFixed(1)} pips)`}
      </span>
    );
  }
  if (outcome === 'BREAKEVEN') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <MinusCircle className="w-3 h-3" />
        BREAKEVEN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
      ACTIVE LIVE
    </span>
  );
};

export const ImpactBadge: React.FC<{ impact: NewsImpact }> = ({ impact }) => {
  if (impact === 'HIGH') {
    return (
      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40">
        HIGH IMPACT
      </span>
    );
  }
  if (impact === 'MEDIUM') {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        MED IMPACT
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/20">
      LOW
    </span>
  );
};
