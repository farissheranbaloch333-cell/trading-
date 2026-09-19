'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-6 w-full">
        <h1 className="text-2xl font-black text-white">Terms of Service</h1>
        <div className="p-8 rounded-3xl bg-[#0F141F] border border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed shadow-xl">
          <p>
            Welcome to SignalPro. By accessing or using our subscription platform, automated signal feed, backtester, or market indicators, you agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">1. Subscription & Billing</h2>
          <p>
            Subscriptions are billed on a recurring monthly or annual basis via Stripe. You may cancel your subscription at any time via the Customer Portal. Cancellations take effect at the conclusion of the current billing cycle.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">2. Educational Use Only</h2>
          <p>
            Signals provided are generated algorithmically. Users acknowledge that signals do not constitute financial advice. All trades placed on third-party brokerage accounts are executed at the user&apos;s own risk.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">3. Limitation of Liability</h2>
          <p>
            SignalPro and its operators shall not be liable for any trading losses, damages, or lost profits arising from data feed delays, downtime, or market volatility.
          </p>
        </div>
      </main>
    </div>
  );
}
