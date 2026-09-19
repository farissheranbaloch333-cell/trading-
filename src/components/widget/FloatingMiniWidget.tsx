'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CurrencyPair, LiveQuote } from '@/types/market';
import { TradeSignal } from '@/types/signals';
import { ALL_PAIRS } from '@/lib/market/pairs';
import { CountdownTimer } from '../common/CountdownTimer';
import { SignalBadge } from '../common/Badge';
import { sounds } from '@/lib/audio/sounds';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  GripHorizontal,
  X,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

interface FloatingMiniWidgetProps {
  quote?: LiveQuote | null;
  signal?: TradeSignal | null;
  currentPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
  onClose: () => void;
}

export const FloatingMiniWidget: React.FC<FloatingMiniWidgetProps> = ({
  quote,
  signal,
  currentPair,
  onSelectPair,
  onClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 24, posY: 120 });

  const [priceFlash, setPriceFlash] = useState<'UP' | 'DOWN' | null>(null);
  const prevPriceRef = useRef(quote?.mid || 0);

  useEffect(() => {
    if (quote && quote.mid !== prevPriceRef.current) {
      if (quote.mid > prevPriceRef.current) {
        setPriceFlash('UP');
      } else {
        setPriceFlash('DOWN');
      }
      prevPriceRef.current = quote.mid;
      const timeout = setTimeout(() => setPriceFlash(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [quote?.mid]);

  // Mouse Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.posX + dx)),
        y: Math.max(60, Math.min(window.innerHeight - 200, dragStartRef.current.posY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const isBuy = signal?.direction === 'BUY';
  const isSell = signal?.direction === 'SELL';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      className={clsx(
        'rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all duration-150 select-none overflow-hidden',
        isBuy
          ? 'bg-[#080B11]/95 border-emerald-500/40 shadow-emerald-500/20'
          : isSell
          ? 'bg-[#080B11]/95 border-rose-500/40 shadow-rose-500/20'
          : 'bg-[#080B11]/95 border-white/15 shadow-black/80',
        isCollapsed ? 'w-64' : 'w-80'
      )}
    >
      {/* Top Drag Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 cursor-grab active:cursor-grabbing text-xs"
      >
        <div className="flex items-center gap-1.5 text-slate-400 font-bold">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex items-center gap-1 text-white font-extrabold text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> SIGNAL HUD
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-3.5 space-y-3">
        {/* Pair Selector & Live Quote */}
        <div className="flex items-center justify-between">
          <select
            value={currentPair}
            onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
            className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-black text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {ALL_PAIRS.map((p) => (
              <option key={p} value={p} className="bg-[#0F141F] text-white">
                {p}
              </option>
            ))}
          </select>

          {quote && (
            <div
              className={clsx(
                'px-2 py-0.5 rounded text-xs font-mono font-bold transition-all duration-300',
                priceFlash === 'UP'
                  ? 'bg-emerald-500/30 text-emerald-300 scale-105'
                  : priceFlash === 'DOWN'
                  ? 'bg-rose-500/30 text-rose-300 scale-105'
                  : 'bg-white/5 text-white'
              )}
            >
              {quote.mid}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Signal Direction Badge & Confidence */}
            {signal && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">LATEST SIGNAL</span>
                  <SignalBadge direction={signal.direction} size="sm" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">CONFIDENCE</span>
                  <span className="font-mono font-black text-emerald-400 text-xs">
                    {signal.confidence}%
                  </span>
                </div>
              </div>
            )}

            {/* Target Parameters */}
            {signal && signal.direction !== 'NO_TRADE' && (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <span className="text-[9px] text-rose-400 uppercase block font-sans">Stop Loss</span>
                  <strong>{signal.stopLoss}</strong>
                </div>
                <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="text-[9px] text-emerald-400 uppercase block font-sans">Take Profit</span>
                  <strong>{signal.takeProfit}</strong>
                </div>
              </div>
            )}

            {/* Candle Close Live Timer */}
            {signal && (
              <div className="pt-1">
                <CountdownTimer
                  targetTimestamp={signal.candleCloseTime}
                  label="Candle Close"
                  variant="compact"
                />
              </div>
            )}

            {/* Link to full dashboard */}
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Stream Active
              </span>
              <Link
                href="/dashboard"
                className="hover:text-cyan-300 flex items-center gap-1 transition"
              >
                Full Terminal <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
