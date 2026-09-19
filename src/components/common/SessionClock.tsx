'use client';

import React, { useState, useEffect } from 'react';
import { getMarketSessionsInPakistanTime, PakistanSessionConfig } from '@/lib/time/pakistanTime';
import { Globe, Zap, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const SessionClock: React.FC = () => {
  const [sessionData, setSessionData] = useState<{
    sessions: PakistanSessionConfig[];
    activeCount: number;
    isHighVolatilityOverlap: boolean;
    currentPktTime: string;
  }>({
    sessions: [],
    activeCount: 0,
    isHighVolatilityOverlap: false,
    currentPktTime: '--:--:-- PKT',
  });

  useEffect(() => {
    const update = () => {
      setSessionData(getMarketSessionsInPakistanTime());
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs select-none">
      {/* Pakistan Standard Time Clock */}
      <div className="flex items-center gap-2 text-slate-300 font-mono px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/30 shadow-sm">
        <span className="text-sm">🇵🇰</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-black text-white text-xs tracking-wider">
            {sessionData.currentPktTime}
          </span>
          <span className="text-[10px] text-emerald-300/80 font-sans font-bold bg-emerald-500/20 px-1 py-0.2 rounded">
            PKT (UTC+5)
          </span>
        </div>
      </div>

      {/* Live Market Sessions in Pakistan Time */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {sessionData.sessions.map((sess) => (
          <div
            key={sess.name}
            title={`${sess.label}: ${sess.openPkt} - ${sess.closePkt}`}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-default',
              sess.isActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            )}
          >
            <span
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                sess.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              )}
            />
            <span>{sess.label.split(' ')[0]}</span>
            {sess.isActive && (
              <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
            )}
          </div>
        ))}

        {sessionData.isHighVolatilityOverlap && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>London/NY PKT Overlap</span>
          </div>
        )}
      </div>
    </div>
  );
};
