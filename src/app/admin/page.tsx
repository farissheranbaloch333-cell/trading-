'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        <AdminWorkspace />
        <DisclaimerBanner />
      </main>
    </div>
  );
}
