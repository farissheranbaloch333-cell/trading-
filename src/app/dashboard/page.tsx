'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { TradingViewChart } from '@/components/chart/TradingViewChart';
import { SignalCard } from '@/components/signals/SignalCard';
import { BestTradesToday } from '@/components/signals/BestTradesToday';
import { FloatingMiniWidget } from '@/components/widget/FloatingMiniWidget';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { CurrencyPair, Timeframe, Candle, LiveQuote } from '@/types/market';
import { TradeSignal, DailyRankedTrade } from '@/types/signals';
import { ALL_PAIRS, FOREX_PAIRS } from '@/lib/market/pairs';
import {
  getCandles,
  getLatestQuote,
  getAllQuotes,
  subscribeToQuotes,
  subscribeToCandles,
  startLiveMarketEngine,
} from '@/lib/market/dataFeed';
import { generateAllPairSignals, getBestTradesToday } from '@/lib/store/signalsStore';
import { useAuth } from '@/lib/auth/authContext';
import {
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Target,
  Shield,
  Sliders,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

import { QuotexQuickScanner } from '@/components/scanner/QuotexQuickScanner';

export default function DashboardPage() {
  const { user, isSubscribed } = useAuth();

  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'QUICK_SCANNER'>('TERMINAL');
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('15m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [quotes, setQuotes] = useState<Record<CurrencyPair, LiveQuote>>({} as any);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [rankedTrades, setRankedTrades] = useState<DailyRankedTrade[]>([]);
  const [isMiniWidgetOpen, setIsMiniWidgetOpen] = useState(true);

  // Initialize Market Engine and Initial State
  useEffect(() => {
    startLiveMarketEngine();

    // Initial load
    const initialCandles = getCandles(selectedPair, selectedTimeframe);
    setCandles([...initialCandles]);

    const allQ = getAllQuotes();
    const qMap: any = {};
    allQ.forEach((q) => (qMap[q.pair] = q));
    setQuotes(qMap);

    const sigs = generateAllPairSignals(selectedTimeframe);
    setSignals(sigs);

    const best = getBestTradesToday();
    setRankedTrades(best);

    // Subscribe to live tick updates
    const unsubQuotes = subscribeToQuotes((newQuote) => {
      setQuotes((prev) => ({
        ...prev,
        [newQuote.pair]: newQuote,
      }));
    });

    const unsubCandles = subscribeToCandles((pair, tf, candle) => {
      if (pair === selectedPair && tf === selectedTimeframe) {
        setCandles((prev) => {
          if (prev.length === 0) return [candle];
          const last = prev[prev.length - 1];
          if (last.time === candle.time) {
            return [...prev.slice(0, -1), candle];
          }
          return [...prev, candle];
        });
      }
    });

    // Refresh signals every 5 seconds
    const sigInterval = setInterval(() => {
      const updatedSigs = generateAllPairSignals(selectedTimeframe);
      setSignals(updatedSigs);
      setRankedTrades(getBestTradesToday());
    }, 5000);

    return () => {
      unsubQuotes();
      unsubCandles();
      clearInterval(sigInterval);
    };
  }, [selectedPair, selectedTimeframe]);

  const activeSignal = signals.find((s) => s.pair === selectedPair) || signals[0] || null;
  const currentQuote = quotes[selectedPair] || getLatestQuote(selectedPair);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6] relative pb-16">
      <Navbar
        onToggleMiniWidget={() => setIsMiniWidgetOpen(!isMiniWidgetOpen)}
        isMiniWidgetOpen={isMiniWidgetOpen}
      />

      {/* PAIR SELECTOR HORIZONTAL STRIP */}
      <div className="w-full bg-[#0C101A] border-b border-white/10 px-4 sm:px-6 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Pairs:
          </span>

          {ALL_PAIRS.map((pair) => {
            const q = quotes[pair];
            const isSelected = pair === selectedPair;
            const pairSig = signals.find((s) => s.pair === pair);

            return (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 border',
                  isSelected
                    ? 'bg-emerald-500/20 text-white border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-black/40 text-slate-300 border-white/5 hover:border-white/20 hover:bg-white/5'
                )}
              >
                <span>{pair}</span>
                {q && <span className="text-slate-200">{q.mid}</span>}
                {q && (
                  <span
                    className={clsx(
                      'text-[10px] px-1 rounded',
                      q.changePercent24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {q.changePercent24h >= 0 ? '+' : ''}
                    {q.changePercent24h}%
                  </span>
                )}
                {pairSig && pairSig.direction !== 'NO_TRADE' && (
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      pairSig.direction === 'BUY' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TERMINAL WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        {/* Terminal Mode Switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('TERMINAL')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition',
                activeTab === 'TERMINAL'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Activity className="w-4 h-4" />
              Interactive Chart Terminal
            </button>
            <button
              onClick={() => setActiveTab('QUICK_SCANNER')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition',
                activeTab === 'QUICK_SCANNER'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Zap className="w-4 h-4 fill-current" />
              5-Second Real-Time AI Analyzer (Quotex / Fast Trades)
            </button>
          </div>
        </div>

        {activeTab === 'QUICK_SCANNER' ? (
          <QuotexQuickScanner />
        ) : (
          <>
            {/* Top Split: Chart + Active Signal Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Interactive TradingView Chart (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <TradingViewChart
                  pair={selectedPair}
                  timeframe={selectedTimeframe}
                  candles={candles}
                  activeSignal={activeSignal}
                  onTimeframeChange={(tf) => setSelectedTimeframe(tf)}
                />
              </div>

              {/* Right Column: Live Signal Card & Parameters (1 Col) */}
              <div className="space-y-6">
                {activeSignal ? (
                  <SignalCard
                    signal={activeSignal}
                    onSelectPair={(p) => setSelectedPair(p)}
                  />
                ) : (
                  <div className="p-8 rounded-2xl bg-[#0F141F] border border-white/10 text-center text-slate-400">
                    <Activity className="w-8 h-8 text-emerald-400 mx-auto animate-spin mb-2" />
                    <p className="text-xs">Analyzing {selectedPair} live candles...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Best Trades Today Ranking Matrix */}
            <div className="w-full">
              <BestTradesToday
                rankedTrades={rankedTrades}
                onSelectPair={(p) => setSelectedPair(p)}
              />
            </div>
          </>
        )}

        {/* Mandatory Risk Disclaimer */}
        <DisclaimerBanner />
      </main>

      {/* FLOATING DRAGGABLE MINI HUD WIDGET */}
      {isMiniWidgetOpen && (
        <FloatingMiniWidget
          quote={currentQuote}
          signal={activeSignal}
          currentPair={selectedPair}
          onSelectPair={(p) => setSelectedPair(p)}
          onClose={() => setIsMiniWidgetOpen(false)}
        />
      )}
    </div>
  );
}
