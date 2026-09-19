'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '@/lib/audio/sounds';

interface PasswordLockGateProps {
  children: React.ReactNode;
}

const MASTER_KEY = 'swibaloch';

export const PasswordLockGate: React.FC<PasswordLockGateProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check if previously unlocked in this session
    const saved = localStorage.getItem('signalpro_unlocked_key');
    if (saved === MASTER_KEY) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setErrorMessage('');

    setTimeout(() => {
      if (inputPassword.trim() === MASTER_KEY) {
        setIsUnlocked(true);
        localStorage.setItem('signalpro_unlocked_key', MASTER_KEY);
        sounds.playBullishChime();
      } else {
        setErrorMessage('Access Denied: Incorrect Master Password. Verification failed.');
        sounds.playBearishChime();
      }
      setIsChecking(false);
    }, 400);
  };

  const handleLock = () => {
    localStorage.removeItem('signalpro_unlocked_key');
    setIsUnlocked(false);
    setInputPassword('');
  };

  // Loading state while checking localStorage
  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  // If locked, display Cyber Security Lock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
        {/* Background glow effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0F141F]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6">
          {/* Lock Glyph Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-blue-600 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
              <div className="w-full h-full bg-[#080B11] rounded-[14px] flex items-center justify-center">
                <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              SIGNAL<span className="text-emerald-400">PRO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LOCKED
              </span>
            </h1>

            <p className="text-xs text-slate-400">
              Enter the authorized terminal master key to unlock institutional market analysis & Quotex robot signals.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Terminal Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter master password..."
                  required
                  autoFocus
                  className="w-full bg-black/60 border border-white/15 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isChecking || !inputPassword.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:opacity-95 text-black font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  <span>Verifying Terminal Key...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Terminal Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-white/5 text-center text-[11px] text-slate-500">
            Protected Institutional Signal Environment • 256-bit Encryption
          </div>
        </div>
      </div>
    );
  }

  // Unlocked: Render full application with instant lock control available
  return <>{children}</>;
};
