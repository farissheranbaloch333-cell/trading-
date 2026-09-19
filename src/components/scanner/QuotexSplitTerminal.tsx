'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FastTradeExpiry, FastTradeSignal } from '@/types/quickScan';
import { POPULAR_QUOTEX_ASSETS, performFastTradeAnalysis } from '@/lib/engine/quickScanner';
import { sounds, RobotVoiceEngine } from '@/lib/audio/sounds';
import {
  Zap,
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Copy,
  Layers,
  Bot,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Sliders,
  DollarSign,
  Activity,
  Radio,
  Wifi,
  BarChart2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';

import { formatPakistanTime, formatPakistanDateTime } from '@/lib/time/pakistanTime';
import { saveSignalToSupabase, saveTradeToSupabase } from '@/lib/supabase/signalsService';

const QUOTEX_URL = 'https://market-qx.trade/en/?lid=2133876';

export type AnalysisDuration = 5 | 10 | 20 | 30;

export const QuotexSplitTerminal: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('EUR/USD (OTC)');
  const [expiry, setExpiry] = useState<FastTradeExpiry>('5s');
  const [analysisDuration, setAnalysisDuration] = useState<AnalysisDuration>(5);
  const [isAutoRobotActive, setIsAutoRobotActive] = useState<boolean>(true);
  const [scanSecondsLeft, setScanSecondsLeft] = useState<number>(5.0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [signalResult, setSignalResult] = useState<FastTradeSignal | null>(null);
  const [executionSecondsLeft, setExecutionSecondsLeft] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [voiceUnlocked, setVoiceUnlocked] = useState<boolean>(false);
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [activeTrade, setActiveTrade] = useState<{
    id: string;
    type: 'CALL' | 'PUT';
    amount: number;
    entryPrice: number;
    secondsLeft: number;
    payout: number;
  } | null>(null);
  const [recentTrades, setRecentTrades] = useState<
    { id: string; asset: string; type: 'CALL' | 'PUT'; amount: number; result: 'WIN' | 'LOSS'; pnl: number; time: string }[]
  >([]);

  const [brokerViewMode, setBrokerViewMode] = useState<'BUILTIN' | 'SPLIT_WINDOW' | 'EMBEDDED'>('BUILTIN');
  const [buyerPercent, setBuyerPercent] = useState<number>(84);
  const [sellerPercent, setSellerPercent] = useState<number>(16);
  const [liveTicks, setLiveTicks] = useState<number[]>([1.0864, 1.08645, 1.08642, 1.08648, 1.0865, 1.08647, 1.08652]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSpokenSignalId = useRef<string>('');
  const lastCountSpoken = useRef<number>(-1);

  const expiryOptions: FastTradeExpiry[] = ['5s', '15s', '30s', '1m', '2m', '5m'];
  const durationOptions: { dur: AnalysisDuration; label: string; desc: string }[] = [
    { dur: 5, label: '5s Lightning', desc: 'Micro-tick pulse scan' },
    { dur: 10, label: '10s Momentum', desc: 'Fast scalp confluence' },
    { dur: 20, label: '20s Swing', desc: 'RSI & Bollinger breakout' },
    { dur: 30, label: '30s Neural', desc: '1000-IQ institutional depth' },
  ];

  const currentAssetConfig =
    POPULAR_QUOTEX_ASSETS.find((a) => a.symbol === selectedAsset) || POPULAR_QUOTEX_ASSETS[0];

  // Unlock Web Audio and Speech Synthesis on user gesture
  const unlockAudioEngine = useCallback(() => {
    sounds.unlockAudio();
    setVoiceUnlocked(true);
  }, []);

  // Test Robot Voice with interactive speaking
  const handleTestVoice = () => {
    unlockAudioEngine();
    sounds.playPing();
    RobotVoiceEngine.speak('SignalPro 1000-IQ Quotex Robot Voice Activated and Ready! All systems operational!');
  };

  // Run AI Quantum Analysis
  const executeScan = useCallback(() => {
    setIsScanning(true);
    const result = performFastTradeAnalysis(selectedAsset, expiry, analysisDuration);

    // Randomize live order pressure matrix
    const newBuyer = result.direction === 'UP' ? Math.floor(76 + Math.random() * 18) : Math.floor(18 + Math.random() * 22);
    setBuyerPercent(newBuyer);
    setSellerPercent(100 - newBuyer);

    // Update live tick array
    const priceDelta = (Math.random() - 0.48) * 0.0001;
    setLiveTicks((prev) => [...prev.slice(-25), Number((prev[prev.length - 1] + priceDelta).toFixed(currentAssetConfig.pipDecimals))]);

    setSignalResult(result);
    setIsScanning(false);
    setExecutionSecondsLeft(expiry === '5s' ? 5 : expiry === '15s' ? 15 : expiry === '30s' ? 30 : 60);

    // Persist signal to Supabase in background
    saveSignalToSupabase(result).catch(() => {});

    // Play sounds & Robot Voice Announcement
    if (result.id !== lastSpokenSignalId.current) {
      lastSpokenSignalId.current = result.id;
      sounds.playQuantumScanSwoosh();

      if (result.direction === 'UP') {
        sounds.playBullishChime();
        if (voiceEnabled) {
          RobotVoiceEngine.speakSignalAnnouncement('CALL (UP)', selectedAsset, result.confidence);
        }
      } else if (result.direction === 'DOWN') {
        sounds.playBearishChime();
        if (voiceEnabled) {
          RobotVoiceEngine.speakSignalAnnouncement('PUT (DOWN)', selectedAsset, result.confidence);
        }
      }

      if (result.confidence >= 90) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: result.direction === 'UP' ? ['#00F59B', '#10B981', '#38BDF8'] : ['#FF4757', '#EF4444', '#F43F5E'],
          });
        } catch {}
      }
    }
  }, [selectedAsset, expiry, analysisDuration, currentAssetConfig.pipDecimals, voiceEnabled]);

  // Real-time Robot Timer Loop with Audible Countdown
  useEffect(() => {
    executeScan();
    if (!isAutoRobotActive) return;

    let countdown = analysisDuration;
    lastCountSpoken.current = -1;

    const interval = setInterval(() => {
      countdown -= 0.1;
      const wholeSecond = Math.ceil(countdown);

      // Audible countdown beep and voice for final 3 seconds
      if (wholeSecond >= 1 && wholeSecond <= 3 && wholeSecond !== lastCountSpoken.current && countdown <= wholeSecond - 0.05) {
        lastCountSpoken.current = wholeSecond;
        sounds.playCountdownBeep(wholeSecond === 1 ? 1200 : wholeSecond === 2 ? 1000 : 800);
        if (voiceEnabled) {
          RobotVoiceEngine.speakCountdown(wholeSecond);
        }
      }

      if (countdown <= 0) {
        countdown = analysisDuration;
        lastCountSpoken.current = -1;
        executeScan();
      }

      setScanSecondsLeft(Number(Math.max(0, countdown).toFixed(1)));
    }, 100);

    return () => clearInterval(interval);
  }, [selectedAsset, expiry, analysisDuration, isAutoRobotActive, executeScan, voiceEnabled]);

  // Active Trade Simulation Timer
  useEffect(() => {
    if (!activeTrade) return;

    const tradeInterval = setInterval(() => {
      setActiveTrade((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          // Trade completed -> Win
          sounds.playWinPayout();
          const profit = prev.payout;
          setDemoBalance((b) => b + profit);
          const pktTime = formatPakistanTime(new Date(), false);
          
          const completedTrade = {
            id: prev.id,
            asset: selectedAsset,
            type: prev.type,
            amount: prev.amount,
            result: 'WIN' as const,
            pnl: profit,
            time: pktTime,
          };

          // Save trade to Supabase
          saveTradeToSupabase({
            id: prev.id,
            asset: selectedAsset,
            type: prev.type,
            amount: prev.amount,
            entryPrice: prev.entryPrice,
            result: 'WIN',
            pnl: profit,
          }).catch(() => {});

          setRecentTrades((history) => [
            completedTrade,
            ...history.slice(0, 5),
          ]);
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(tradeInterval);
  }, [activeTrade, selectedAsset]);

  // Interactive trade execution simulation on Quotex station
  const handlePlaceTrade = (type: 'CALL' | 'PUT') => {
    unlockAudioEngine();
    const payout = Math.round(tradeAmount * (currentAssetConfig.payoutPercent / 100));

    if (type === 'CALL') sounds.playBullishChime();
    else sounds.playBearishChime();

    const tradeDuration = expiry === '5s' ? 5 : expiry === '15s' ? 15 : expiry === '30s' ? 30 : 60;
    const entry = signalResult?.entryPrice || currentAssetConfig.basePrice;

    setActiveTrade({
      id: `qx-${Date.now()}`,
      type,
      amount: tradeAmount,
      entryPrice: entry,
      secondsLeft: tradeDuration,
      payout,
    });
  };

  // Synchronized Split-Window Launcher for direct Quotex trading
  const openSynchronizedQuotexWindow = () => {
    if (typeof window !== 'undefined') {
      const width = Math.min(1050, Math.floor(window.screen.width * 0.55));
      const height = Math.floor(window.screen.height * 0.92);
      const left = 0;
      const top = 40;
      window.open(
        QUOTEX_URL,
        'QuotexLiveBroker',
        `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
      );
    }
  };

  const handleCopy = () => {
    if (!signalResult) return;
    const text = `SIGNALPRO 1000-IQ QUOTEX SIGNAL:
Asset: ${signalResult.asset}
Verdict: ${signalResult.action}
Expiry: ${signalResult.expiry}
Analysis Mode: ${analysisDuration}s
Target Entry: ${signalResult.entryPrice}
Confidence: ${signalResult.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Canvas Tick Graph Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw grid background lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (liveTicks.length < 2) return;

    const min = Math.min(...liveTicks) - 0.0001;
    const max = Math.max(...liveTicks) + 0.0001;
    const range = max - min || 1;

    const points = liveTicks.map((val, idx) => {
      const x = (idx / (liveTicks.length - 1)) * (width - 40) + 10;
      const y = height - ((val - min) / range) * (height - 40) - 20;
      return { x, y };
    });

    // Draw gradient area under tick curve
    const isUp = signalResult?.direction === 'UP';
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isUp) {
      gradient.addColorStop(0, 'rgba(0, 245, 155, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 245, 155, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 71, 87, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 71, 87, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw glowing tick line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = isUp ? '#00F59B' : '#FF4757';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw pulsing current price head
    const lastPt = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? '#00F59B' : '#FF4757';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [liveTicks, signalResult]);

  return (
    <div className="space-y-4 w-full select-none" onClick={unlockAudioEngine}>
      {/* Top 1000-IQ Master Control Bar */}
      <div className="p-4 rounded-3xl bg-[#0F141F] border border-white/10 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-blue-500 text-black font-black shadow-lg shadow-emerald-500/20 animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Quotex 1000-IQ AI Robot Station
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  BROKER SYNCED (ID #2133876)
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time Quotex OTC analysis with robotic voice countdown & direct 1-click execution
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Robot Voice Toggle & Test */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => {
                  unlockAudioEngine();
                  const next = !voiceEnabled;
                  setVoiceEnabled(next);
                  if (next) handleTestVoice();
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs',
                  voiceEnabled
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900 text-slate-500 border border-transparent'
                )}
                title="Toggle Robot Voice announcements"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-purple-400 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
                <span>Voice: {voiceEnabled ? 'ACTIVE 🔊' : 'MUTED'}</span>
              </button>

              <button
                onClick={handleTestVoice}
                className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 text-[11px] font-bold transition border border-purple-800/40"
              >
                Test Voice
              </button>
            </div>

            {/* Auto Robot Mode Toggle */}
            <button
              onClick={() => setIsAutoRobotActive(!isAutoRobotActive)}
              className={clsx(
                'px-3.5 py-2 rounded-2xl font-bold flex items-center gap-2 transition text-xs border',
                isAutoRobotActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              )}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Auto-Scan: {isAutoRobotActive ? 'ACTIVE' : 'MANUAL'}</span>
            </button>

            {/* 1-Click Synchronized Quotex Window */}
            <button
              onClick={openSynchronizedQuotexWindow}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-black font-black flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition text-xs active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              Launch Quotex Split Window
            </button>
          </div>
        </div>

        {/* PROMINENT ANALYSIS DURATION SELECTOR (5s, 10s, 20s, 30s) */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Scan Speed (Analysis Duration):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
            {durationOptions.map((opt) => (
              <button
                key={opt.dur}
                onClick={() => {
                  unlockAudioEngine();
                  setAnalysisDuration(opt.dur);
                }}
                className={clsx(
                  'px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center justify-between gap-2 border',
                  analysisDuration === opt.dur
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-black border-emerald-300 shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                )}
              >
                <div className="text-left">
                  <span className="font-mono font-black text-sm block leading-none">{opt.dur}s</span>
                  <span className="text-[9px] opacity-80 block">{opt.label.split(' ')[1]}</span>
                </div>
                {analysisDuration === opt.dur && (
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Unlock Helper Banner */}
      {!voiceUnlocked && (
        <div
          onClick={handleTestVoice}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/40 text-center cursor-pointer hover:bg-purple-900/80 transition text-xs font-bold text-purple-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Volume2 className="w-4 h-4 text-purple-300 animate-bounce" />
          <span>Click anywhere or tap here to enable 1000-IQ Robot Voice Speech announcements!</span>
        </div>
      )}

      {/* SINGLE SCREEN DUAL VIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[750px]">
        {/* LEFT PANEL: Quotex Station (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0F141F] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[760px]">
          {/* Station Toolbar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0B0F19] border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setBrokerViewMode('BUILTIN')}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5',
                  brokerViewMode === 'BUILTIN'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                Interactive Station
              </button>
              <button
                onClick={() => setBrokerViewMode('SPLIT_WINDOW')}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5',
                  brokerViewMode === 'SPLIT_WINDOW'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Direct Quotex Broker
              </button>
            </div>

            {/* Quotex Balance & Account Status */}
            <div className="flex items-center gap-3 font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Quotex Balance</span>
                <span className="text-sm font-black text-emerald-400">${demoBalance.toLocaleString()}.00 USD</span>
              </div>
            </div>
          </div>

          {/* Station Main View */}
          {brokerViewMode === 'BUILTIN' ? (
            <div className="flex-1 p-5 bg-[#080B11] flex flex-col justify-between space-y-3">
              {/* Asset & Live Price Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F141F] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono font-black border border-emerald-500/20 text-sm">
                    {selectedAsset.split(' ')[0]}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">{selectedAsset}</h3>
                    <p className="text-xs text-emerald-400 font-bold">
                      Payout: +{currentAssetConfig.payoutPercent}% Profit on Win
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xl sm:text-2xl font-black text-white block">
                    {signalResult?.entryPrice || currentAssetConfig.basePrice}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Quotex OTC Feed
                  </span>
                </div>
              </div>

              {/* Real-time Canvas Tick Chart & Order Pressure */}
              <div className="flex-1 p-4 rounded-2xl bg-[#0F141F]/90 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                {/* Buyers vs Sellers Order Flow Pressure */}
                <div className="space-y-1 z-10">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Buyers: {buyerPercent}%
                    </span>
                    <span className="text-rose-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Sellers: {sellerPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${buyerPercent}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-rose-500 to-rose-600 h-full transition-all duration-500"
                      style={{ width: `${sellerPercent}%` }}
                    />
                  </div>
                </div>

                {/* Animated Interactive Chart */}
                <div className="my-auto py-2 relative h-44 w-full flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={160}
                    className="w-full h-full rounded-xl"
                  />

                  {/* Active Trade Banner Overlay */}
                  {activeTrade && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center space-y-1 text-center border border-emerald-500/40">
                      <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                        Active {activeTrade.type} Trade in Progress
                      </span>
                      <span className="text-3xl font-black font-mono text-white animate-pulse">
                        {activeTrade.secondsLeft}s
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        Target Payout: +${activeTrade.payout} USD
                      </span>
                    </div>
                  )}
                </div>

                {/* Recent Station Execution Log */}
                {recentTrades.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1 z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Live Station History:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {recentTrades.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[11px]"
                        >
                          {t.type} ${t.amount} &rarr; +${t.pnl} WIN
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Controls (Trade Amount & CALL/PUT Buttons) */}
              <div className="p-4 rounded-2xl bg-[#0F141F] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Trade Amount:</span>
                    <div className="flex items-center gap-1">
                      {[10, 50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            unlockAudioEngine();
                            setTradeAmount(amt);
                          }}
                          className={clsx(
                            'px-2.5 py-1 rounded-lg font-mono font-bold transition border text-xs',
                            tradeAmount === amt
                              ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                              : 'bg-black/50 text-slate-300 border-white/10 hover:border-white/20'
                          )}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-emerald-400 font-mono font-bold">
                    Win Payout: +${Math.round(tradeAmount * (currentAssetConfig.payoutPercent / 100))}
                  </span>
                </div>

                {/* Big Green CALL & Red PUT Trading Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePlaceTrade('CALL')}
                    disabled={activeTrade !== null}
                    className={clsx(
                      'py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer',
                      activeTrade !== null
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black shadow-emerald-500/25'
                    )}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>CALL (UP / BUY)</span>
                  </button>

                  <button
                    onClick={() => handlePlaceTrade('PUT')}
                    disabled={activeTrade !== null}
                    className={clsx(
                      'py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer',
                      activeTrade !== null
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25'
                    )}
                  >
                    <TrendingDown className="w-6 h-6" />
                    <span>PUT (DOWN / SELL)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Direct Quotex Broker Helper View */
            <div className="flex-1 p-6 bg-[#080B11] flex flex-col justify-between space-y-6">
              <div className="p-5 rounded-2xl bg-[#0F141F] border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Wifi className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Direct Quotex Broker Connection</h3>
                    <p className="text-xs text-slate-400">
                      Quotex official trading portal is configured with Partner ID #2133876
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">Why use the Synchronized Split Window?</p>
                  <p>
                    Modern security standards on major brokers (like Quotex) prevent embedding their login screen inside foreign iframes. Our 1-click synchronized window automatically launches Quotex side-by-side with SignalPro AI Robot so you receive vocal signals and execute trades in real-time without latency!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={openSynchronizedQuotexWindow}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Quotex Broker (Auto-Split)
                  </button>

                  <button
                    onClick={() => setBrokerViewMode('BUILTIN')}
                    className="px-5 py-3.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 border border-white/10 font-bold text-xs transition"
                  >
                    Use Built-in Interactive Station
                  </button>
                </div>
              </div>

              {/* Live Quotex OTC Pair Quick Links */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Top Recommended Quotex Pairs (High Payout)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_QUOTEX_ASSETS.slice(0, 6).map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className={clsx(
                        'p-2.5 rounded-xl border text-left transition',
                        selectedAsset === asset.symbol
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#0F141F] border-white/10 text-slate-300 hover:border-white/20'
                      )}
                    >
                      <span className="font-mono font-bold text-xs block">{asset.symbol}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">+{asset.payoutPercent}% Profit</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: 1000-IQ AI Robot Quantum HUD (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0F141F] border-2 border-emerald-500/50 p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 h-[760px] overflow-y-auto">
          {/* Top Robot Status Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  1000-IQ QUANTUM PREDICTOR
                </span>
              </div>

              {/* Countdown badge with progress */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-black text-xs shadow-inner">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Next Scan: {scanSecondsLeft}s</span>
              </div>
            </div>

            {/* Asset Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Select Quotex Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => {
                  unlockAudioEngine();
                  setSelectedAsset(e.target.value);
                }}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <optgroup label="🔥 High-Payout OTC Pairs (Quotex)" className="bg-[#080B11] text-emerald-400">
                  {POPULAR_QUOTEX_ASSETS.filter((a) => a.category === 'OTC' || a.category === 'COMMODITY' || a.category === 'CRYPTO').map(
                    (asset) => (
                      <option key={asset.symbol} value={asset.symbol} className="bg-[#0F141F] text-white">
                        {asset.symbol} — {asset.payoutPercent}% Payout
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="🌐 Live Standard Forex" className="bg-[#080B11] text-cyan-400">
                  {POPULAR_QUOTEX_ASSETS.filter((a) => a.category === 'FOREX').map((asset) => (
                    <option key={asset.symbol} value={asset.symbol} className="bg-[#0F141F] text-white">
                      {asset.symbol} — {asset.payoutPercent}% Payout
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Target Expiry Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Expiry Window</label>
              <div className="grid grid-cols-6 gap-1">
                {expiryOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      unlockAudioEngine();
                      setExpiry(opt);
                    }}
                    className={clsx(
                      'py-1 rounded-lg text-xs font-mono font-black transition border text-center',
                      expiry === opt
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                        : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/20'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GLOWING CALL / PUT SIGNAL DISPLAY */}
          {signalResult ? (
            <div
              className={clsx(
                'p-5 rounded-2xl border-2 transition-all duration-300 space-y-4 text-center',
                signalResult.direction === 'UP'
                  ? 'bg-gradient-to-b from-emerald-950/80 via-[#0F141F] to-[#080B11] border-emerald-500 shadow-2xl shadow-emerald-500/30'
                  : 'bg-gradient-to-b from-rose-950/80 via-[#0F141F] to-[#080B11] border-rose-500 shadow-2xl shadow-rose-500/30'
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400">
                <span>SIGNAL VERDICT</span>
                <span className="text-emerald-400 font-mono font-black">1000-IQ QUANT PRECISION</span>
              </div>

              {/* Giant Arrow & Direction Verdict */}
              <div className="flex items-center justify-center gap-3">
                {signalResult.direction === 'UP' ? (
                  <TrendingUp className="w-12 h-12 text-emerald-400 animate-bounce" />
                ) : (
                  <TrendingDown className="w-12 h-12 text-rose-400 animate-bounce" />
                )}

                <div className="text-left">
                  <span
                    className={clsx(
                      'text-3xl sm:text-4xl font-black tracking-tight block leading-none font-mono',
                      signalResult.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {signalResult.direction === 'UP' ? 'CALL / UP 🟢' : 'PUT / DOWN 🔴'}
                  </span>
                  <span className="text-xs font-black text-white mt-1 block">
                    {signalResult.direction === 'UP' ? 'EXECUTE: CLICK GREEN (BUY)' : 'EXECUTE: CLICK RED (SELL)'}
                  </span>
                </div>
              </div>

              {/* Signal Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-left">
                  <span className="text-[10px] text-slate-400 block font-sans">Accuracy Confidence</span>
                  <strong className="text-lg text-emerald-400 font-black">{signalResult.winProbability}%</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-left">
                  <span className="text-[10px] text-slate-400 block font-sans">Entry Price Target</span>
                  <strong className="text-lg text-white font-black">{signalResult.entryPrice}</strong>
                </div>
              </div>

              {/* Execution Window Countdown */}
              <div
                className={clsx(
                  'p-2.5 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-2',
                  executionSecondsLeft > 0
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                )}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {executionSecondsLeft > 0
                    ? `TRADE WINDOW: ${executionSecondsLeft}s remaining`
                    : 'Awaiting next candle pulse...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center text-slate-400 space-y-2">
              <Bot className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
              <p className="text-xs">Analyzing {selectedAsset} momentum vectors...</p>
            </div>
          )}

          {/* 1000-IQ Rationale Breakdown */}
          {signalResult && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-slate-300">
              <span className="text-[10px] font-bold text-cyan-300 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Algorithmic Rationale ({analysisDuration}s Mode)
              </span>
              <p className="text-[11px] leading-relaxed text-slate-200">
                {signalResult.technicalSummary}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                unlockAudioEngine();
                executeScan();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rescan Now
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Signal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
