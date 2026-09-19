'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { SignalBadge } from '@/components/common/Badge';
import { getAllQuotes } from '@/lib/market/dataFeed';
import { LiveQuote } from '@/types/market';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Crown,
  Layers,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function LandingPage() {
  const [quotes, setQuotes] = useState<LiveQuote[]>([]);

  useEffect(() => {
    setQuotes(getAllQuotes());
    const interval = setInterval(() => {
      setQuotes(getAllQuotes());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] selection:bg-emerald-500 selection:text-black">
      <Navbar />
      <DisclaimerBanner compact />

      {/* Live Market Ticker Strip */}
      <div className="w-full bg-[#0C101A] border-b border-white/5 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-xs whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE QUOTES
          </span>

          {quotes.map((q) => (
            <div key={q.pair} className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white">{q.pair}</span>
              <span className="text-slate-300 font-semibold">{q.mid}</span>
              <span
                className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.2 rounded',
                  q.changePercent24h >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                )}
              >
                {q.changePercent24h >= 0 ? '+' : ''}
                {q.changePercent24h}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Candlestick & Confluence Signal Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Trade Forex With <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Institutional Precision
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Real-time candlestick pattern recognition, multi-timeframe indicator confluence, AI macro sentiment, and audited signals with exact Entry, Stop Loss, and Take Profit (min 1:1.5 R:R).
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:opacity-95 text-black font-black text-base shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition duration-200"
            >
              <Zap className="w-5 h-5 fill-black" />
              Launch Live Terminal
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-bold text-base transition duration-200 flex items-center justify-center gap-2"
            >
              Start 3-Day Free Trial
            </Link>
          </div>

          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-black text-white font-mono">71.4%</span>
              <span className="text-xs text-slate-400 block mt-0.5">Audited Win Rate</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-black text-cyan-300 font-mono">2.45</span>
              <span className="text-xs text-slate-400 block mt-0.5">Profit Factor</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-black text-emerald-400 font-mono">8 Pairs</span>
              <span className="text-xs text-slate-400 block mt-0.5">Live Forex & Gold</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-black text-purple-300 font-mono">7 Frames</span>
              <span className="text-xs text-slate-400 block mt-0.5">1m to 1D Confluence</span>
            </div>
          </div>
        </div>
      </section>

      {/* TERMINAL PREVIEW SECTION */}
      <section className="py-16 bg-[#06090F] border-y border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Institutional Signal Terminal In Action
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Inspect active candlestick markers, multi-timeframe confluence bars, and live countdown timers.
            </p>
          </div>

          {/* Interactive Card Mockup */}
          <div className="rounded-3xl bg-gradient-to-b from-[#121A28] to-[#080B11] border border-white/15 p-4 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">EUR/USD</span>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs font-bold">
                  15m Timeframe
                </span>
                <SignalBadge direction="BUY" size="md" />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Entry: <strong className="text-white">1.08650</strong>
                </span>
                <span className="text-rose-400">
                  SL: <strong>1.08400</strong>
                </span>
                <span className="text-emerald-400">
                  TP: <strong>1.09150</strong>
                </span>
                <span className="text-cyan-300">
                  R:R <strong>1:2.0</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Quant Confluence Explanation
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bullish Engulfing candle formed at key 1.0860 demand zone. 15m and 1h moving averages aligned above 200 EMA with RSI rebound from 34 oversold. Macro US CPI news buffer clear (+30 mins).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Candle Closes in <strong className="text-emerald-400 font-mono">03m 42s</strong>
              </span>

              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition flex items-center gap-1.5"
              >
                Open Terminal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6 CORE PILLARS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Engineered For Consistent Traders
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Combining rigorous quantitative mathematics with modern institutional trading workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">11+ Candlestick Patterns</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Doji, Hammer, Inverted Hammer, Shooting Star, Engulfing, Morning/Evening Star, Harami, Three White Soldiers, and Piercing Line recognized in real-time.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-cyan-500/40 transition group">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Timeframe Confluence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Signals require consensus across 1m, 5m, 15m, 30m, 1h, 4h, and 1D timeframes. Higher timeframes filter false breakout noise.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-purple-500/40 transition group">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit group-hover:scale-110 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Macro News Sentiment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              LLM models analyze central bank statements, inflation, and rate expectations to score currency strength from -100 to +100.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-rose-500/40 transition group">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit group-hover:scale-110 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">15m News Blackout Guard</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automatically pauses new signals 15 minutes before and after high-impact economic events (CPI, NFP, FOMC) to protect capital.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-amber-500/40 transition group">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Countdown Timers</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every signal displays exact validity duration and real-time candle close countdowns so you never enter late or stale setups.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="p-6 rounded-3xl bg-[#0F141F] border border-white/10 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Audited Track Record</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transparent live performance logs, win/loss breakdowns, and historical strategy backtesting on every pair and timeframe.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-[#080B11] via-[#0F1626] to-[#080B11] border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-2xl">
            <Zap className="w-8 h-8 fill-emerald-400" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Start Trading With Institutional Clarity
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of forex traders who rely on SignalPro for quantitative signals, clean charts, and disciplined risk management.
          </p>

          <div className="pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-black text-base shadow-2xl shadow-emerald-500/30 hover:opacity-95 transition"
            >
              Start 3-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
