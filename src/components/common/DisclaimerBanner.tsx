'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="w-full bg-amber-500/10 border-y border-amber-500/20 py-1.5 px-4 text-xs text-amber-300/90 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>
          <strong>Risk Disclaimer:</strong> Forex & CFDs trading involves substantial risk of loss. Signals are algorithmic analysis, not financial advice. No profits are guaranteed.
        </span>
        <Link href="/risk-disclosure" className="underline hover:text-amber-200 ml-1">
          Read Disclosure
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-6 text-xs text-amber-200/90 flex items-start sm:items-center gap-3 shadow-lg">
      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-amber-300 text-sm mb-0.5">High Risk Investment & Regulatory Disclaimer</p>
        <p className="text-amber-200/80 leading-relaxed">
          Trading Foreign Exchange (Forex), Commodities, and CFDs on margin carries a high level of risk and may not be suitable for all investors. Past performance of algorithmic signals or backtested strategies is not indicative of future results. SignalPro does not provide personalized investment advice.
        </p>
      </div>
      <Link
        href="/risk-disclosure"
        className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition text-xs border border-amber-500/30"
      >
        Full Terms
      </Link>
    </div>
  );
};
