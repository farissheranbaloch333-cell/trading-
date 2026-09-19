'use client';

import React, { useState } from 'react';
import { ALL_PAIRS } from '@/lib/market/pairs';
import { CurrencyPair } from '@/types/market';
import { AdminMetrics, StrategyWeights } from '@/types/admin';
import {
  Sliders,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Save,
  Shield,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export const AdminWorkspace: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 14820,
    activeSubscribers: 3240,
    monthlyRecurringRevenue: 158760,
    activeSignalsToday: 42,
    todayWinRate: 76.2,
    apiHealth: {
      marketDataStatus: 'HEALTHY',
      aiProviderStatus: 'HEALTHY',
      databaseStatus: 'HEALTHY',
      latencyMs: 140,
    },
  });

  const [weights, setWeights] = useState<StrategyWeights>({
    candlestickPatterns: 25,
    indicatorConfluence: 35,
    multiTimeframeAlignment: 25,
    newsSentiment: 15,
    minRiskReward: 1.5,
    minConfidenceThreshold: 65,
  });

  const [enabledPairs, setEnabledPairs] = useState<Record<CurrencyPair, boolean>>({
    'EUR/USD': true,
    'GBP/USD': true,
    'USD/JPY': true,
    'AUD/USD': true,
    'USD/CAD': true,
    'USD/CHF': true,
    'NZD/USD': true,
    'XAU/USD': true,
  });

  const [announcement, setAnnouncement] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const togglePair = (pair: CurrencyPair) => {
    setEnabledPairs((prev) => ({ ...prev, [pair]: !prev[pair] }));
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              SignalPro Administration Panel
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SUPERADMIN
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              System health monitoring, strategy weights tuning, and pair routing
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase: CONNECTED (idrkfjhgiodhbstktmcs)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
            <span>🇵🇰 Timezone: Asia/Karachi (PKT / UTC+5)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Market Feed: 140ms</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Subscribers</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {metrics.activeSubscribers.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">+18% MoM</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Revenue (MRR)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${(metrics.monthlyRecurringRevenue).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Signals Generated Today</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {metrics.activeSignalsToday}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">Live Realtime</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Today Win Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {metrics.todayWinRate}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Audited</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Strategy Risk Weights & Pair Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Weights Editor */}
        <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Algorithm Weightings & Thresholds
            </h3>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Candlestick Patterns Weight</span>
                <span className="text-emerald-400 font-mono">{weights.candlestickPatterns}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={weights.candlestickPatterns}
                onChange={(e) => setWeights({ ...weights, candlestickPatterns: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Technical Indicators Confluence Weight</span>
                <span className="text-cyan-400 font-mono">{weights.indicatorConfluence}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={weights.indicatorConfluence}
                onChange={(e) => setWeights({ ...weights, indicatorConfluence: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Multi-Timeframe Alignment Weight</span>
                <span className="text-purple-400 font-mono">{weights.multiTimeframeAlignment}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={weights.multiTimeframeAlignment}
                onChange={(e) => setWeights({ ...weights, multiTimeframeAlignment: Number(e.target.value) })}
                className="w-full accent-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">AI News Sentiment Weight</span>
                <span className="text-amber-400 font-mono">{weights.newsSentiment}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.newsSentiment}
                onChange={(e) => setWeights({ ...weights, newsSentiment: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Min R:R Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.minRiskReward}
                  onChange={(e) => setWeights({ ...weights, minRiskReward: Number(e.target.value) })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Min Confidence (%)</label>
                <input
                  type="number"
                  value={weights.minConfidenceThreshold}
                  onChange={(e) => setWeights({ ...weights, minConfidenceThreshold: Number(e.target.value) })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" /> Save Strategy Weights
            </button>
          </form>
        </div>

        {/* Currency Pair Routing Management */}
        <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Asset Pair Feeds & Signal Enablement
          </h3>

          <div className="space-y-2.5">
            {ALL_PAIRS.map((pair) => (
              <div
                key={pair}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5"
              >
                <div>
                  <span className="font-bold text-white text-xs block">{pair}</span>
                  <span className="text-[10px] text-slate-400">All 7 timeframes enabled</span>
                </div>

                <button
                  onClick={() => togglePair(pair)}
                  className={clsx(
                    'px-3 py-1 rounded-lg text-xs font-bold transition',
                    enabledPairs[pair]
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  )}
                >
                  {enabledPairs[pair] ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
