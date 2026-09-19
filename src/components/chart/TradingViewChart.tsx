'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, Time, CrosshairMode } from 'lightweight-charts';
import { Candle, CurrencyPair, Timeframe } from '@/types/market';
import { FOREX_PAIRS } from '@/lib/market/pairs';
import { computeAllIndicators } from '@/lib/engine/indicators';
import { detectCandlestickPatterns } from '@/lib/engine/patterns';
import { TradeSignal } from '@/types/signals';
import { Layers, Eye, EyeOff, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface TradingViewChartProps {
  pair: CurrencyPair;
  timeframe: Timeframe;
  candles: Candle[];
  activeSignal?: TradeSignal | null;
  onTimeframeChange?: (tf: Timeframe) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  pair,
  timeframe,
  candles,
  activeSignal,
  onTimeframeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Overlay Toggles
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showPatterns, setShowPatterns] = useState(true);
  const [showLevels, setShowLevels] = useState(true);

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Dispose existing chart if present
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 480,
      layout: {
        background: { color: '#080B11' },
        textColor: '#94A3B8',
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38BDF8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0F172A',
        },
        horzLine: {
          color: '#38BDF8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0F172A',
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: timeframe === '1m',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
    });

    // Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00F59B',
      downColor: '#FF4757',
      borderVisible: false,
      wickUpColor: '#00F59B',
      wickDownColor: '#FF4757',
    });

    // Add EMA 50
    const ema50Series = chart.addLineSeries({
      color: '#38BDF8',
      lineWidth: 2,
      title: 'EMA 50',
    });

    // Add EMA 200
    const ema200Series = chart.addLineSeries({
      color: '#F59E0B',
      lineWidth: 2,
      title: 'EMA 200',
    });

    // Add Bollinger Bands Upper / Lower
    const bbUpperSeries = chart.addLineSeries({
      color: 'rgba(168, 85, 247, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      title: 'BB Upper',
    });

    const bbLowerSeries = chart.addLineSeries({
      color: 'rgba(168, 85, 247, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      title: 'BB Lower',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;
    bbUpperRef.current = bbUpperSeries;
    bbLowerRef.current = bbLowerSeries;

    // Resize Observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [pair, timeframe]);

  // Update Data and Markers
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    // Format Candlestick data
    const chartData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeriesRef.current.setData(chartData);

    const indicators = computeAllIndicators(candles);

    // EMAs
    if (ema50SeriesRef.current && showEMA) {
      const ema50Data: LineData<Time>[] = [];
      candles.forEach((c, idx) => {
        const val = indicators.ema50[idx];
        if (val !== null) {
          ema50Data.push({ time: c.time as Time, value: val });
        }
      });
      ema50SeriesRef.current.setData(ema50Data);
    } else if (ema50SeriesRef.current) {
      ema50SeriesRef.current.setData([]);
    }

    if (ema200SeriesRef.current && showEMA) {
      const ema200Data: LineData<Time>[] = [];
      candles.forEach((c, idx) => {
        const val = indicators.ema200[idx];
        if (val !== null) {
          ema200Data.push({ time: c.time as Time, value: val });
        }
      });
      ema200SeriesRef.current.setData(ema200Data);
    } else if (ema200SeriesRef.current) {
      ema200SeriesRef.current.setData([]);
    }

    // Bollinger Bands
    if (bbUpperRef.current && bbLowerRef.current && showBB) {
      const bbUpData: LineData<Time>[] = [];
      const bbLowData: LineData<Time>[] = [];
      candles.forEach((c, idx) => {
        const up = indicators.bollingerBands.upper[idx];
        const low = indicators.bollingerBands.lower[idx];
        if (up !== null && low !== null) {
          bbUpData.push({ time: c.time as Time, value: up });
          bbLowData.push({ time: c.time as Time, value: low });
        }
      });
      bbUpperRef.current.setData(bbUpData);
      bbLowerRef.current.setData(bbLowData);
    } else {
      bbUpperRef.current?.setData([]);
      bbLowerRef.current?.setData([]);
    }

    // Candlestick Pattern Markers
    if (showPatterns) {
      const patterns = detectCandlestickPatterns(candles.slice(-60));
      const markers: any[] = patterns.map((p) => {
        const isBull = p.bias === 'BULLISH';
        return {
          time: p.time as Time,
          position: isBull ? 'belowBar' : 'aboveBar',
          color: isBull ? '#00F59B' : '#FF4757',
          shape: isBull ? 'arrowUp' : 'arrowDown',
          text: `${p.name} (${p.bias})`,
        };
      });

      // Add Signal Entry Marker if available
      if (activeSignal && activeSignal.direction !== 'NO_TRADE') {
        markers.push({
          time: candles[candles.length - 1].time as Time,
          position: activeSignal.direction === 'BUY' ? 'belowBar' : 'aboveBar',
          color: activeSignal.direction === 'BUY' ? '#00F59B' : '#FF4757',
          shape: 'circle',
          text: `SIGNAL: ${activeSignal.direction} (${activeSignal.confidence}%)`,
        });
      }

      candleSeriesRef.current.setMarkers(markers);
    } else {
      candleSeriesRef.current.setMarkers([]);
    }

    // Auto-fit chart view
    chartRef.current?.timeScale().fitContent();
  }, [candles, showEMA, showBB, showPatterns, activeSignal]);

  const lastCandle = candles[candles.length - 1];
  const pairCfg = FOREX_PAIRS[pair];

  return (
    <div className="flex flex-col w-full rounded-2xl bg-[#080B11] border border-white/10 overflow-hidden shadow-2xl">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#0C101A]">
        {/* Left: Pair Info & Live Quote */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">{pair}</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {pairCfg?.description}
            </span>
          </div>

          {lastCandle && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <span className="text-base font-mono font-bold text-white">
                {lastCandle.close.toFixed(pairCfg?.pipDecimalPlaces ? pairCfg.pipDecimalPlaces + 1 : 5)}
              </span>
              <span
                className={clsx(
                  'text-xs font-bold font-mono px-1.5 py-0.5 rounded',
                  lastCandle.close >= lastCandle.open
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                )}
              >
                {lastCandle.close >= lastCandle.open ? '+' : ''}
                {(((lastCandle.close - lastCandle.open) / lastCandle.open) * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Center: Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                timeframe === tf
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Right: Technical Overlays Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEMA(!showEMA)}
            title="Toggle Moving Averages (EMA 50/200)"
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition',
              showEMA
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            EMA
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            title="Toggle Bollinger Bands (20, 2)"
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition',
              showBB
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            BB
          </button>

          <button
            onClick={() => setShowPatterns(!showPatterns)}
            title="Toggle Candlestick Pattern Detection Markers"
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition',
              showPatterns
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Patterns
          </button>
        </div>
      </div>

      {/* Lightweight Chart Canvas Container */}
      <div ref={chartContainerRef} className="w-full relative min-h-[480px]" />

      {/* Chart Legend & Signal Overlay Footer */}
      {activeSignal && activeSignal.direction !== 'NO_TRADE' && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0F19] border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Target Parameters:</span>
            <span className="font-mono text-slate-200">
              Entry: <strong className="text-white">{activeSignal.entryPrice}</strong>
            </span>
            <span className="font-mono text-rose-400">
              Stop Loss: <strong>{activeSignal.stopLoss}</strong>
            </span>
            <span className="font-mono text-emerald-400">
              Take Profit: <strong>{activeSignal.takeProfit}</strong>
            </span>
            <span className="font-mono text-cyan-300">
              R:R <strong>1:{activeSignal.riskRewardRatio.toFixed(1)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Signal Confidence:</span>
            <span className="font-black text-emerald-400 font-mono">{activeSignal.confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
