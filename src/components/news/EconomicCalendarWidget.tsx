'use client';

import React, { useState } from 'react';
import { EconomicEvent, NewsImpact } from '@/types/news';
import { ImpactBadge } from '../common/Badge';
import { Calendar, Filter, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatPakistanTime, formatPakistanDate } from '@/lib/time/pakistanTime';
import { clsx } from 'clsx';

interface EconomicCalendarWidgetProps {
  events: EconomicEvent[];
}

export const EconomicCalendarWidget: React.FC<EconomicCalendarWidgetProps> = ({ events }) => {
  const [impactFilter, setImpactFilter] = useState<'ALL' | NewsImpact>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

  const filteredEvents = events.filter((e) => {
    if (impactFilter !== 'ALL' && e.impact !== impactFilter) return false;
    if (currencyFilter !== 'ALL' && e.currency !== currencyFilter) return false;
    return true;
  });

  return (
    <div className="rounded-2xl bg-[#0F141F] border border-white/10 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Economic Calendar & Event Risks
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🇵🇰 Pakistan Time (PKT)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              High-impact releases automatically pause signals 15 min prior/post to avoid volatility spikes (Times in PKT)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Impact Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['ALL', 'HIGH', 'MEDIUM'] as ('ALL' | NewsImpact)[]).map((imp) => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition',
                  impactFilter === imp
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                {imp}
              </button>
            ))}
          </div>

          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {currencies.map((c) => (
              <option key={c} value={c} className="bg-[#0F141F]">
                {c === 'ALL' ? 'All Currencies' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Time (PKT)</th>
              <th className="py-2.5 px-3">Currency</th>
              <th className="py-2.5 px-3">Event Name</th>
              <th className="py-2.5 px-3">Impact</th>
              <th className="py-2.5 px-3">Forecast</th>
              <th className="py-2.5 px-3">Previous</th>
              <th className="py-2.5 px-3">Safety Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredEvents.map((evt) => {
              const timePktStr = formatPakistanTime(evt.timestamp, false);

              return (
                <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {timePktStr}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {evt.currency}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white max-w-[280px]">
                    {evt.title}
                  </td>
                  <td className="py-3 px-3">
                    <ImpactBadge impact={evt.impact} />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {evt.forecast || '--'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {evt.previous || '--'}
                  </td>
                  <td className="py-3 px-3">
                    {evt.impact === 'HIGH' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> 15m Blackout Guard
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Normal Trading
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
