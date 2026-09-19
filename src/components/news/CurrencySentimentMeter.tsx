'use client';

import React from 'react';
import { CurrencySentiment, NewsArticle } from '@/types/news';
import { Sparkles, TrendingUp, TrendingDown, Newspaper, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface CurrencySentimentMeterProps {
  sentiments: Record<string, CurrencySentiment>;
  news: NewsArticle[];
}

export const CurrencySentimentMeter: React.FC<CurrencySentimentMeterProps> = ({ sentiments, news }) => {
  const sentimentList = Object.values(sentiments);

  return (
    <div className="space-y-6">
      {/* Currency AI Sentiment Radar Matrix */}
      <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              AI Currency Sentiment Meter
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LLM Real-time Scored
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Macro headlines & central bank releases analyzed for directional institutional bias (-100 to +100)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sentimentList.map((item) => {
            const isBull = item.score > 15;
            const isBear = item.score < -15;

            return (
              <div
                key={item.currency}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white font-mono">{item.currency}</span>
                  <span
                    className={clsx(
                      'text-xs font-mono font-bold flex items-center gap-1',
                      isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-slate-400'
                    )}
                  >
                    {isBull && <TrendingUp className="w-3.5 h-3.5" />}
                    {isBear && <TrendingDown className="w-3.5 h-3.5" />}
                    {item.score > 0 ? '+' : ''}
                    {item.score}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-700',
                      isBull ? 'bg-emerald-400' : isBear ? 'bg-rose-400' : 'bg-slate-500'
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(10, Math.abs(item.score)))}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
                  {item.rationale}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Forex News Feed with AI Sentiment Tags */}
      <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Live Macro News & AI Trade Analysis</h3>
            <p className="text-xs text-slate-400">Institutional headlines tagged with affected currencies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {news.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 hover:border-white/15 transition group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-400">{n.source}</span>
                <span className="text-slate-500">{n.publishedAt}</span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                {n.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">{n.summary}</p>

              {n.aiAnalysis && (
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 text-xs text-slate-200">
                  <span className="text-[10px] font-bold text-purple-300 uppercase block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> AI Impact Rationale
                  </span>
                  {n.aiAnalysis}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                <div className="flex items-center gap-1.5">
                  {n.currencies.map((curr) => (
                    <span
                      key={curr}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[10px]"
                    >
                      {curr}
                    </span>
                  ))}
                </div>

                <span
                  className={clsx(
                    'text-[10px] font-bold px-2 py-0.5 rounded',
                    n.sentiment === 'BULLISH'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : n.sentiment === 'BEARISH'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {n.sentiment} ({(n.sentimentScore * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
