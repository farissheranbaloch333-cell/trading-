'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';
import { clsx } from 'clsx';

interface CountdownTimerProps {
  targetTimestamp: number; // Unix seconds
  totalDurationSeconds?: number;
  label?: string;
  variant?: 'compact' | 'badge' | 'full';
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTimestamp,
  totalDurationSeconds = 300,
  label = 'Candle Close',
  variant = 'compact',
  onExpire,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, targetTimestamp - now);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, targetTimestamp - now);
      setSecondsRemaining(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onExpire]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const percent = Math.min(100, Math.max(0, (secondsRemaining / totalDurationSeconds) * 100));
  const isUrgent = secondsRemaining < 30 && secondsRemaining > 0;

  if (variant === 'badge') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors',
          isUrgent
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
            : 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30'
        )}
      >
        <Timer className="w-3.5 h-3.5" />
        <span>{formatted}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
        <Clock className={clsx('w-3.5 h-3.5', isUrgent ? 'text-rose-400 animate-pulse' : 'text-cyan-400')} />
        <span className="text-slate-400">{label}:</span>
        <span className={clsx('font-bold', isUrgent ? 'text-rose-400' : 'text-slate-200')}>{formatted}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          {label}
        </span>
        <span className={clsx('font-mono font-bold text-sm', isUrgent ? 'text-rose-400' : 'text-cyan-300')}>
          {formatted}
        </span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-1000',
            isUrgent ? 'bg-rose-500' : percent > 50 ? 'bg-cyan-400' : 'bg-amber-400'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
