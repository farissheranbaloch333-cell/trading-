'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { SubscriptionTier } from '@/types/user';
import { Check, Sparkles, Crown, Zap, Shield, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export const PricingCard: React.FC = () => {
  const { user, upgradeTier } = useAuth();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const router = useRouter();

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      await upgradeTier(tier);
      setTimeout(() => {
        router.push('/dashboard?upgraded=' + tier);
      }, 700);
    } catch {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Billing Switcher */}
      <div className="flex items-center justify-center gap-3">
        <span className={clsx('text-xs font-bold', billingInterval === 'month' ? 'text-white' : 'text-slate-400')}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
          className="w-14 h-8 bg-slate-900 border border-white/20 rounded-full p-1 relative transition flex items-center"
        >
          <div
            className={clsx(
              'w-6 h-6 rounded-full bg-emerald-400 transition-all shadow-md',
              billingInterval === 'year' ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
        <span className={clsx('text-xs font-bold flex items-center gap-1', billingInterval === 'year' ? 'text-white' : 'text-slate-400')}>
          Yearly Billing
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            SAVE 32%
          </span>
        </span>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE PLAN */}
        <div className="rounded-3xl bg-[#0F141F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                Starter
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white font-mono">$0</span>
              <span className="text-xs text-slate-400 font-medium"> / forever</span>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Explore basic candlestick pattern detection and delayed forex market quotes.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2 Major Pairs (EUR/USD, GBP/USD)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Delayed Signals (15m delay)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic Moving Averages & RSI</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 shrink-0 text-center">-</span>
                <span>No Live AI Trade Explanations</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 shrink-0 text-center">-</span>
                <span>No Floating Mini Widget</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('FREE')}
            className="w-full mt-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition"
          >
            {user?.tier === 'FREE' ? 'Current Plan' : 'Select Free'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="rounded-3xl bg-gradient-to-b from-[#121B2C] via-[#0F141F] to-[#080B11] border-2 border-emerald-500/50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
            MOST POPULAR
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Pro Trader
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                3-Day Free Trial
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white font-mono">
                {billingInterval === 'month' ? '$49' : '$39'}
              </span>
              <span className="text-xs text-slate-400 font-medium"> / month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Real-time institutional signal engine, full AI trade rationales, and countdown HUD.
            </p>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">All 8 Forex & Gold Pairs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Instant Sub-Second Live Signals</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Plain-English AI Trade Explanations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Draggable Floating Live Mini Widget</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sound Chimes & Browser Notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All Timeframes (1m, 5m, 15m, 30m, 1h, 4h, 1D)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('PRO')}
            disabled={loadingTier === 'PRO'}
            className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
          >
            {loadingTier === 'PRO' ? 'Activating...' : user?.tier === 'PRO' ? 'Active Subscription' : 'Start 3-Day Free Trial'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* VIP INSTITUTIONAL PLAN */}
        <div className="rounded-3xl bg-gradient-to-b from-[#1C1710] via-[#0F141F] to-[#080B11] border border-amber-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> VIP Institutional
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Annual VIP
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white font-mono">
                {billingInterval === 'month' ? '$399' : '$329'}
              </span>
              <span className="text-xs text-slate-400 font-medium"> / year</span>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Complete quant suite with Backtester, Multi-Timeframe Confluence scanner, and news blackout guards.
            </p>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Everything in Pro Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Multi-Timeframe Confluence Radar</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Strategy Backtester Engine Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>15-Minute News Blackout Safety Filter</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Priority Webhook & Discord / Telegram Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>VIP 1-on-1 Dedicated Support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('VIP')}
            disabled={loadingTier === 'VIP'}
            className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            {loadingTier === 'VIP' ? 'Activating VIP...' : user?.tier === 'VIP' ? 'Active VIP Member' : 'Upgrade to VIP Institutional'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
