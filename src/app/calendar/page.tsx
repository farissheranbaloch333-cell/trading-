'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { EconomicCalendarWidget } from '@/components/news/EconomicCalendarWidget';
import { CurrencySentimentMeter } from '@/components/news/CurrencySentimentMeter';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { getUpcomingEconomicEvents } from '@/lib/news/calendar';
import { LATEST_NEWS_ARTICLES, getCurrencySentiments } from '@/lib/news/sentiment';

export default function CalendarPage() {
  const [events, setEvents] = useState(() => getUpcomingEconomicEvents());
  const [news] = useState(() => LATEST_NEWS_ARTICLES);
  const [sentiments, setSentiments] = useState(() => getCurrencySentiments());

  useEffect(() => {
    setEvents(getUpcomingEconomicEvents());
    setSentiments(getCurrencySentiments());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-[#F3F4F6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 w-full">
        {/* Economic Calendar */}
        <EconomicCalendarWidget events={events} />

        {/* AI Sentiment Meter & News */}
        <CurrencySentimentMeter sentiments={sentiments} news={news} />

        <DisclaimerBanner />
      </main>
    </div>
  );
}
