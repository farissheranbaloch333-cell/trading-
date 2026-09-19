'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-6 w-full">
        <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
        <div className="p-8 rounded-3xl bg-[#0F141F] border border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed shadow-xl">
          <p>
            SignalPro takes your privacy seriously. This Privacy Policy describes what information we collect, how it is processed, and your privacy rights.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">1. Information We Collect</h2>
          <p>
            We collect account credentials (email, name), user terminal preferences, and subscription status. Payment processing is handled directly by Stripe; we never store your full credit card information on our servers.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">2. Data Security</h2>
          <p>
            All network communication is encrypted with TLS/SSL. We adhere to industry best practices to protect your information from unauthorized access.
          </p>
          <h2 className="text-sm font-bold text-white pt-2">3. Third-Party Services</h2>
          <p>
            We use third-party APIs for market data streaming and payment processing. No personal financial data is sold to advertisers.
          </p>
        </div>
      </main>
    </div>
  );
}
