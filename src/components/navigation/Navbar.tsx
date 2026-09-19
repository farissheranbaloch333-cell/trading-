'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Menu,
  X,
  Crown,
  LayoutDashboard,
  Sliders,
  ExternalLink,
  Zap,
  Bot,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { sounds } from '@/lib/audio/sounds';
import { SessionClock } from '../common/SessionClock';
import { clsx } from 'clsx';

interface NavbarProps {
  onToggleMiniWidget?: () => void;
  isMiniWidgetOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMiniWidget, isMiniWidgetOpen = true }) => {
  const pathname = usePathname();
  const { user, isSubscribed, isVIP, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sounds.setMuted(newMuted);
    if (!newMuted) {
      sounds.playPing();
    }
  };

  const handleLockSite = () => {
    localStorage.removeItem('signalpro_unlocked_key');
    window.location.reload();
  };

  const navLinks = [
    { href: '/robot', label: '🤖 Quotex Robot', icon: Bot },
    { href: '/dashboard', label: 'Terminal', icon: LayoutDashboard },
    { href: '/scanner', label: '5s Scanner', icon: Zap },
    { href: '/signals', label: 'Signals Feed', icon: Activity },
    { href: '/performance', label: 'Performance', icon: BarChart3 },
    { href: '/backtest', label: 'Backtester', icon: Layers },
    { href: '/calendar', label: 'News & AI', icon: Calendar },
    { href: '/pricing', label: 'Pricing', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080B11]/90 backdrop-blur-xl">
      {/* Top Utility Strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 border-b border-white/5 bg-[#0B0F19]/60 text-xs">
        <SessionClock />
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Market Feed Connected (0.2s latency)
          </span>
          <span className="text-slate-600">|</span>
          <Link href="/risk-disclosure" className="hover:text-slate-200 transition">
            Risk Disclosure
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/admin" className="hover:text-cyan-400 flex items-center gap-1 transition">
            <Sliders className="w-3 h-3" /> Admin
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
              <div className="w-full h-full bg-[#080B11] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition duration-200" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                SIGNAL<span className="text-emerald-400">PRO</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.4
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-white/10 text-emerald-300 border border-white/15 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-emerald-400' : 'text-slate-500')} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Lock Website Button */}
            <button
              onClick={handleLockSite}
              title="Lock Terminal (Requires Master Password 'swibaloch')"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition flex items-center gap-1 text-xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* User Tier Status & Upgrade */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  {isVIP ? (
                    <Crown className="w-4 h-4 text-amber-400" />
                  ) : isSubscribed ? (
                    <Shield className="w-4 h-4 text-emerald-400" />
                  ) : null}
                  <span>{user.name}</span>
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded font-black',
                      isVIP
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isSubscribed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {user.tier}
                  </span>
                </Link>
                {!isVIP && (
                  <Link
                    href="/pricing"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition"
              >
                Start Free Trial
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#080B11] px-4 pt-2 pb-6 space-y-2">
          <div className="py-2 border-b border-white/5">
            <SessionClock />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-900'
                )}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-emerald-500 font-bold text-black text-sm"
            >
              Start Free Trial / Plans
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
