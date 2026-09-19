'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { useAuth } from '@/lib/auth/authContext';
import { ALL_PAIRS } from '@/lib/market/pairs';
import { CurrencyPair, Timeframe } from '@/types/market';
import {
  User,
  Shield,
  Crown,
  Bell,
  Volume2,
  Sliders,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Save,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isSubscribed, isVIP, updatePreferences, logout } = useAuth();

  const [favorites, setFavorites] = useState<CurrencyPair[]>(user?.preferences?.favoritePairs || ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD']);
  const [defaultTf, setDefaultTf] = useState<Timeframe>(user?.preferences?.defaultTimeframe || '15m');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(user?.preferences?.soundAlerts ?? true);
  const [browserNotifs, setBrowserNotifs] = useState<boolean>(user?.preferences?.browserNotifications ?? true);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(user?.preferences?.emailAlerts ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleFavorite = (p: CurrencyPair) => {
    if (favorites.includes(p)) {
      if (favorites.length > 1) {
        setFavorites(favorites.filter((item) => item !== p));
      }
    } else {
      setFavorites([...favorites, p]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      favoritePairs: favorites,
      defaultTimeframe: defaultTf,
      soundAlerts,
      browserNotifications: browserNotifs,
      emailAlerts,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-[#0F141F] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0F141F] rounded-[14px] flex items-center justify-center">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{user?.name || 'Trader Profile'}</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5',
                isVIP
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              )}
            >
              {isVIP ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Shield className="w-3.5 h-3.5 text-emerald-400" />}
              {user?.tier} PLAN
            </span>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subscription & Billing Card */}
        <div className="p-6 rounded-2xl bg-[#0F141F] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Subscription & Customer Billing Portal
            </h3>
            <Link
              href="/pricing"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              Change Plan
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white text-sm">
                {isVIP ? 'VIP Institutional Membership' : isSubscribed ? 'Pro Trader Membership' : 'Free Starter Plan'}
              </p>
              <p className="text-slate-400 mt-0.5">
                Status:{' '}
                <span className="text-emerald-400 font-bold uppercase">
                  {user?.subscriptionStatus || 'Active'}
                </span>
                {' • '}Renews on {new Date(user?.currentPeriodEnd || Date.now() + 30 * 86400000).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => alert('Stripe Customer Billing Portal opened in secure window.')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 shrink-0"
            >
              Manage Billing <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Signal & Terminal Preferences Form */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0F141F] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Terminal Preferences & Watchlist
            </h3>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preferences Saved!
              </span>
            )}
          </div>

          {/* Favorite Pairs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Watchlist & Signal Alerts (Click to toggle)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_PAIRS.map((pair) => {
                const isFav = favorites.includes(pair);
                return (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => toggleFavorite(pair)}
                    className={clsx(
                      'p-2.5 rounded-xl text-xs font-mono font-bold transition border text-center',
                      isFav
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {pair}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Timeframe */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Chart & Signal Timeframe
            </label>
            <select
              value={defaultTf}
              onChange={(e) => setDefaultTf(e.target.value as Timeframe)}
              className="w-full sm:w-64 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            >
              {(['1m', '5m', '15m', '30m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
                <option key={tf} value={tf} className="bg-[#0F141F]">
                  {tf} Timeframe
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-400" /> Web Audio Synthesizer Chimes
              </span>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Bell className="w-4 h-4 text-cyan-400" /> Real-time Browser Push Notifications
              </span>
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => setBrowserNotifs(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Bell className="w-4 h-4 text-purple-400" /> High-Confidence Email Alerts (&gt;85%)
              </span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save User Settings
          </button>
        </form>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
