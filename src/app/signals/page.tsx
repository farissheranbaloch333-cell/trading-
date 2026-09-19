'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { SignalCard } from '@/components/signals/SignalCard';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { generateAllPairSignals } from '@/lib/store/signalsStore';
import { TradeSignal, SignalDirection } from '@/types/signals';
import { CurrencyPair, Timeframe } from '@/types/market';
import { ALL_PAIRS } from '@/lib/market/pairs';
import { Activity, Filter, Layers, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export default function SignalsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [filterDirection, setFilterDirection] = useState<'ALL' | SignalDirection>('ALL');

  useEffect(() => {
    setSignals(generateAllPairSignals(timeframe));
    const interval = setInterval(() => {
      setSignals(generateAllPairSignals(timeframe));
    }, 4000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const filtered = signals.filter((s) => {
    if (filterDirection !== 'ALL' && s.direction !== filterDirection) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        {/* Header & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Live Algorithmic Signals Scanner
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Institutional confluence signals generated across all 8 forex & precious metal pairs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
              {(['1m', '5m', '15m', '30m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg font-bold transition',
                    timeframe === tf
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Direction Filter */}
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Directions</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
              <option value="NO_TRADE">Consolidation / NO TRADE</option>
            </select>
          </div>
        </div>

        {/* Signal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>

        {/* Risk Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
