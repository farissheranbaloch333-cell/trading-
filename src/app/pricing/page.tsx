'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { PricingCard } from '@/components/pricing/PricingCard';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Sparkles, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Invest In Quantitative Edge
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Gain immediate access to sub-second institutional forex signals, multi-timeframe confluence scanning, and AI trade explanations. Cancel anytime with 1 click.
          </p>
        </div>

        <PricingCard />

        {/* FAQ & Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" /> 3-Day Risk-Free Trial
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test all Pro signals live on demo or live accounts for 3 full days. Cancel anytime before trial ends.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Zap className="w-4 h-4" /> Instant Activation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access is provisioned within 500ms after payment. Realtime WebSockets stream directly to your terminal.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <RefreshCw className="w-4 h-4" /> 1-Click Cancellation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage your subscription, change payment methods, or cancel anytime directly in your customer billing portal.
            </p>
          </div>
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
