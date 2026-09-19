'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastTradeAsset, FastTradeExpiry, FastTradeSignal } from '@/types/quickScan';
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
  Flame,
  Volume2,
  VolumeX,
  Cpu,
  Bot,
} from 'lucide-react';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';

export type AnalysisDuration = 5 | 10 | 20 | 30;

export const QuotexQuickScanner: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('EUR/USD (OTC)');
  const [expiry, setExpiry] = useState<FastTradeExpiry>('5s');
  const [analysisDuration, setAnalysisDuration] = useState<AnalysisDuration>(5);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [scanSecondsLeft, setScanSecondsLeft] = useState(5.0);
  const [currentTelemetry, setCurrentTelemetry] = useState('');
  const [signalResult, setSignalResult] = useState<FastTradeSignal | null>(null);
  const [executionSecondsLeft, setExecutionSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const expiryOptions: FastTradeExpiry[] = ['5s', '15s', '30s', '1m', '2m', '5m'];
  const durationOptions: { dur: AnalysisDuration; label: string }[] = [
    { dur: 5, label: '5s Lightning' },
    { dur: 10, label: '10s Momentum' },
    { dur: 20, label: '20s Swing' },
    { dur: 30, label: '30s Deep AI' },
  ];

  // Start Real-Time Market Scan
  const handleStartAnalysis = () => {
    if (isScanning) return;
    sounds.unlockAudio();
    setIsScanning(true);
    setScanProgress(0);
    setScanSecondsLeft(analysisDuration);
    setSignalResult(null);

    const startTime = Date.now();
    const durationMs = analysisDuration * 1000;

    sounds.playPing();

    const telemetrySteps = [
      { at: 0.0, msg: `⚡ Connecting to live Quotex tick stream (${selectedAsset})...` },
      { at: 0.25, msg: `📈 Calculating micro-tick velocity & ${analysisDuration}s buyer/seller vectors...` },
      { at: 0.5, msg: `🕯️ Evaluating candlestick rejection wicks & 1000-IQ order flow...` },
      { at: 0.75, msg: `📊 Scanning RSI momentum delta & Stochastic 1000-IQ crossover...` },
      { at: 0.9, msg: '🎯 Synthesizing high-probability trade direction & expiry...' },
    ];

    let lastBeep = -1;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      const remainingSecs = Math.max(0, (durationMs - elapsed) / 1000);
      const wholeSec = Math.ceil(remainingSecs);

      // Countdown audio ticks for last 3s
      if (wholeSec >= 1 && wholeSec <= 3 && wholeSec !== lastBeep && remainingSecs <= wholeSec - 0.05) {
        lastBeep = wholeSec;
        sounds.playCountdownBeep(wholeSec === 1 ? 1200 : wholeSec === 2 ? 1000 : 800);
        if (voiceEnabled) {
          RobotVoiceEngine.speakCountdown(wholeSec);
        }
      }

      setScanProgress(progress);
      setScanSecondsLeft(Number(remainingSecs.toFixed(1)));

      const ratio = elapsed / durationMs;
      const currentStep = telemetrySteps
        .slice()
        .reverse()
        .find((s) => ratio >= s.at);
      if (currentStep) {
        setCurrentTelemetry(currentStep.msg);
      }

      if (elapsed >= durationMs) {
        clearInterval(timer);
        setIsScanning(false);

        // Generate high-probability trade signal
        const result = performFastTradeAnalysis(selectedAsset, expiry, analysisDuration);
        setSignalResult(result);
        setExecutionSecondsLeft(result.validForSeconds);

        sounds.playQuantumScanSwoosh();

        // Play voice announcement and procedural chime
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

        // Fire celebratory confetti on high confidence
        if (result.confidence >= 88) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.5 },
              colors: result.direction === 'UP' ? ['#00F59B', '#10B981', '#38BDF8'] : ['#FF4757', '#EF4444', '#F43F5E'],
            });
          } catch {}
        }
      }
    }, 100);
  };

  // Execution window timer
  useEffect(() => {
    if (executionSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setExecutionSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [executionSecondsLeft]);

  const handleCopyParameters = () => {
    if (!signalResult) return;
    const text = `SignalPro Quick Signal:
Asset: ${signalResult.asset}
Action: ${signalResult.action}
Expiry: ${signalResult.expiry}
Duration Mode: ${analysisDuration}s
Entry: ${signalResult.entryPrice}
Confidence: ${signalResult.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAssetConfig =
    POPULAR_QUOTEX_ASSETS.find((a) => a.symbol === selectedAsset) || POPULAR_QUOTEX_ASSETS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none" onClick={() => sounds.unlockAudio()}>
      {/* Top Banner with Quotex Platform Reference */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0F141F] to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-6 h-6 fill-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              1000-IQ Quotex Real-Time AI Analyzer
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PARTNER ID: 2133876
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Select 5s, 10s, 20s or 30s deep quant analysis with robotic voice countdown and direct Quotex execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={clsx(
              'px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border',
              voiceEnabled
                ? 'bg-purple-500/25 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            )}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span>Voice: {voiceEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          <a
            href="https://market-qx.trade/en/?lid=2133876"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            Open Quotex <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Asset Selection & Expiry Toolbar */}
      <div className="rounded-3xl bg-[#0F141F] border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Speed Option Selection (5s, 10s, 20s, 30s) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Select AI Analysis Speed / Duration:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {durationOptions.map((opt) => (
              <button
                key={opt.dur}
                type="button"
                onClick={() => {
                  setAnalysisDuration(opt.dur);
                  setSignalResult(null);
                }}
                disabled={isScanning}
                className={clsx(
                  'py-3 px-4 rounded-2xl text-xs font-bold transition border flex items-center justify-between',
                  analysisDuration === opt.dur
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-black border-emerald-300 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/20'
                )}
              >
                <div className="text-left">
                  <span className="font-mono font-black text-sm block leading-none">{opt.dur} Seconds</span>
                  <span className="text-[10px] opacity-85 block mt-0.5">{opt.label}</span>
                </div>
                {analysisDuration === opt.dur && (
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Asset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Select Quotex Asset / Pair (OTC & Live)</span>
              <span className="text-emerald-400 font-mono font-black">
                Payout: {currentAssetConfig.payoutPercent}%
              </span>
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => {
                setSelectedAsset(e.target.value);
                setSignalResult(null);
              }}
              disabled={isScanning}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
            >
              <optgroup label="🔥 High-Payout OTC Pairs (Quotex)" className="bg-[#080B11] text-emerald-400">
                {POPULAR_QUOTEX_ASSETS.filter((a) => a.category === 'OTC' || a.category === 'COMMODITY' || a.category === 'CRYPTO').map(
                  (asset) => (
                    <option key={asset.symbol} value={asset.symbol} className="bg-[#0F141F] text-white">
                      {asset.symbol} — {asset.payoutPercent}% Payout ({asset.name})
                    </option>
                  )
                )}
              </optgroup>
              <optgroup label="🌐 Live Standard Forex Markets" className="bg-[#080B11] text-cyan-400">
                {POPULAR_QUOTEX_ASSETS.filter((a) => a.category === 'FOREX').map((asset) => (
                  <option key={asset.symbol} value={asset.symbol} className="bg-[#0F141F] text-white">
                    {asset.symbol} — {asset.payoutPercent}% Payout
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Expiry Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Trade Duration / Expiry Time
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {expiryOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setExpiry(opt);
                    setSignalResult(null);
                  }}
                  disabled={isScanning}
                  className={clsx(
                    'py-3 rounded-xl text-xs font-mono font-black transition border text-center',
                    expiry === opt
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-black/40 text-slate-300 border-white/5 hover:border-white/20'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Giant Start Analysis Button */}
        {!isScanning && (
          <button
            onClick={handleStartAnalysis}
            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-black text-base sm:text-lg shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-6 h-6 fill-black" />
            START {analysisDuration}-SECOND 1000-IQ MARKET ANALYSIS
          </button>
        )}

        {/* Analyzing Scanner Progress Screen */}
        {isScanning && (
          <div className="p-8 rounded-2xl bg-black/60 border border-emerald-500/40 text-center space-y-5 relative overflow-hidden">
            <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <span className="text-2xl font-mono font-black text-white">
                {scanSecondsLeft.toFixed(1)}s
              </span>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 animate-pulse block">
                ANALYZING {selectedAsset} ({scanProgress.toFixed(0)}%)
              </span>
              <p className="text-xs text-slate-300 font-mono h-6 transition-all">
                {currentTelemetry}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Post-Scan Prediction Result Card */}
        {signalResult && !isScanning && (
          <div
            className={clsx(
              'p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 space-y-6',
              signalResult.direction === 'UP'
                ? 'bg-gradient-to-b from-emerald-950/40 via-[#0F141F] to-[#080B11] border-emerald-500 shadow-2xl shadow-emerald-500/20'
                : 'bg-gradient-to-b from-rose-950/40 via-[#0F141F] to-[#080B11] border-rose-500 shadow-2xl shadow-rose-500/20'
            )}
          >
            {/* Top Prediction Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1000-IQ PREDICTION FOR {signalResult.asset} ({signalResult.expiry})
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'text-3xl sm:text-5xl font-black tracking-tight flex items-center gap-2',
                      signalResult.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {signalResult.direction === 'UP' ? (
                      <TrendingUp className="w-10 h-10 sm:w-14 h-14 animate-bounce" />
                    ) : (
                      <TrendingDown className="w-10 h-10 sm:w-14 h-14 animate-bounce" />
                    )}
                    {signalResult.direction === 'UP' ? 'CALL / UP (BUY)' : 'PUT / DOWN (SELL)'}
                  </span>
                </div>
              </div>

              {/* Win Probability Badge */}
              <div className="text-left sm:text-right p-3 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Win Probability
                </span>
                <span
                  className={clsx(
                    'text-2xl sm:text-3xl font-black font-mono',
                    signalResult.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {signalResult.winProbability}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Est. Payout: +{signalResult.payoutPercent}%
                </span>
              </div>
            </div>

            {/* Execution Countdown Timer & Entry Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Entry Price</span>
                <span className="text-xl font-mono font-bold text-white mt-1">
                  {signalResult.entryPrice}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Recommended Expiry</span>
                <span className="text-xl font-mono font-bold text-cyan-300 mt-1">
                  {signalResult.expiry.toUpperCase()} DURATION
                </span>
              </div>

              <div
                className={clsx(
                  'p-4 rounded-xl border flex flex-col justify-center',
                  executionSecondsLeft > 0
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                )}
              >
                <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Execution Window
                </span>
                <span className="text-xl font-mono font-black mt-1">
                  {executionSecondsLeft > 0 ? `${executionSecondsLeft}s REMAINING` : 'WINDOW EXPIRED'}
                </span>
              </div>
            </div>

            {/* Technical Rationale Breakdown */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Plain-English Trade Rationale ({analysisDuration}s Mode)
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {signalResult.technicalSummary}
              </p>
            </div>

            {/* 4-Phase Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {signalResult.phases.map((phase) => (
                <div
                  key={phase.name}
                  className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">{phase.name}</span>
                    <span
                      className={clsx(
                        'text-[10px] px-1.5 py-0.2 rounded font-black',
                        phase.status === 'BULLISH'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : phase.status === 'BEARISH'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {phase.status} ({phase.score}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{phase.detail}</p>
                </div>
              ))}
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleStartAnalysis}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" /> Run New {analysisDuration}s Scan
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyParameters}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Signal'}
                </button>

                <a
                  href="https://market-qx.trade/en/?lid=2133876"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition',
                    signalResult.direction === 'UP'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  )}
                >
                  Execute on Quotex <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
