import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/authContext';
import { PasswordLockGate } from '@/components/auth/PasswordLockGate';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SignalPro | Institutional Forex Signals, Live Charts & AI Confluence Engine',
  description:
    'Real-time forex candlestick pattern recognition, multi-timeframe indicator confluence, AI macro sentiment, and audited algorithmic trading signals with countdown timers.',
  keywords: [
    'Forex Signals',
    'Candlestick Patterns',
    'TradingView Charts',
    'Algorithmic Trading',
    'Forex Analysis',
    'Trading Terminal',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080B11] text-[#F3F4F6]">
        <PasswordLockGate>
          <AuthProvider>
            <div className="flex-1 flex flex-col">{children}</div>

          {/* Institutional Global Footer */}
          <footer className="border-t border-white/10 bg-[#06080E] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-base font-black text-white flex items-center gap-1.5">
                    SIGNAL<span className="text-emerald-400">PRO</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      v2.4
                    </span>
                  </span>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Institutional quantitative signals, multi-timeframe candlestick pattern recognition, and AI macro analysis for disciplined forex traders.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                  <Link href="/dashboard" className="hover:text-white transition">
                    Live Terminal
                  </Link>
                  <Link href="/signals" className="hover:text-white transition">
                    Signals Feed
                  </Link>
                  <Link href="/performance" className="hover:text-white transition">
                    Audited Track Record
                  </Link>
                  <Link href="/backtest" className="hover:text-white transition">
                    Backtester
                  </Link>
                  <Link href="/calendar" className="hover:text-white transition">
                    Economic Calendar
                  </Link>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms
                  </Link>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy
                  </Link>
                  <Link href="/risk-disclosure" className="text-amber-400 hover:text-amber-300 font-semibold transition">
                    Risk Disclosure
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <p>© {new Date().getFullYear()} SignalPro Technologies Ltd. All rights reserved.</p>
                <p className="text-slate-500 text-center sm:text-right">
                  Financial Market Data powered by high-frequency algorithmic streaming engine.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </PasswordLockGate>
    </body>
  </html>
  );
}
