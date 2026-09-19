import { NextResponse } from 'next/server';
import { getUpcomingEconomicEvents } from '@/lib/news/calendar';
import { LATEST_NEWS_ARTICLES, getCurrencySentiments } from '@/lib/news/sentiment';

export async function GET() {
  const events = getUpcomingEconomicEvents();
  const news = LATEST_NEWS_ARTICLES;
  const sentiments = getCurrencySentiments();

  return NextResponse.json({
    success: true,
    events,
    news,
    sentiments,
  });
}
