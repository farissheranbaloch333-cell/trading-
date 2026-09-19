'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { AuditedPerformanceView } from '@/components/performance/AuditedPerformanceView';
import { calculatePerformanceStats, getSignalsHistory } from '@/lib/store/signalsStore';
import { PerformanceStats, TradeSignal } from '@/types/signals';

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats>(() => calculatePerformanceStats());
  const [history, setHistory] = useState<TradeSignal[]>(() => getSignalsHistory());

  useEffect(() => {
    setStats(calculatePerformanceStats());
    setHistory(getSignalsHistory());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <AuditedPerformanceView stats={stats} history={history} />
      </main>
    </div>
  );
}
