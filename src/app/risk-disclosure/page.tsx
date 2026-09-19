'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { ShieldAlert, AlertTriangle, Scale, Lock } from 'lucide-react';
import Link from 'next/link';

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8 w-full">
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <ShieldAlert className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-amber-300">Important Financial & Regulatory Risk Disclosure</h1>
            <p className="text-xs text-amber-200/80 mt-1">
              Last updated: September 2026 • Please read carefully before subscribing to SignalPro.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0F141F] border border-white/10 space-y-6 text-xs text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              1. High Risk of Leveraged Trading
            </h2>
            <p>
              Trading Foreign Exchange (Forex), Commodities (such as Gold/XAU), Indices, and Contracts for Difference (CFDs) on margin carries a very high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange or any financial market, you should carefully consider your investment objectives, level of experience, and risk appetite.
            </p>
            <p className="text-amber-300/90 font-semibold">
              The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              2. Algorithmic Signals Are Not Financial Advice
            </h2>
            <p>
              All signals, technical candlestick pattern indicators, multi-timeframe scoring metrics, and AI trade explanations provided on SignalPro are algorithmic outputs intended solely for educational, informational, and analytical purposes. None of the materials or signals generated constitute personalized financial, investment, legal, or tax advice.
            </p>
            <p>
              SignalPro does not recommend the purchase, sale, or holding of any specific currency pair or asset. Any trade executions carried out on your personal broker accounts are done strictly at your own sole discretion and risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              3. Regulatory Compliance & Licensing Notice
            </h2>
            <p>
              SignalPro operates as a financial technology software provider. Depending on your jurisdiction or country of residence (such as the United States CFTC/NFA, UK FCA, European ESMA, Australian ASIC), the distribution or commercial sale of trading signals, copy-trading services, or managed accounts may require specific regulatory authorization, licensing, or registration.
            </p>
            <p>
              Users are responsible for ensuring that their use of SignalPro complies with all local laws and regulations applicable in their country of residence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. No Guaranteed Returns or Profit Promises</h2>
            <p>
              Past performance, audited historical backtesting logs, win rate statistics, or hypothetical simulation results are not indicative of future performance. Market conditions, execution latency, broker spreads, slippage, and macroeconomic events can significantly alter trade outcomes.
            </p>
          </section>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs transition"
          >
            Acknowledge & Return to Terminal
          </Link>
        </div>
      </main>
    </div>
  );
}
