import { NextResponse } from 'next/server';
import { getAllQuotes, getLatestQuote } from '@/lib/market/dataFeed';
import { CurrencyPair } from '@/types/market';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair') as CurrencyPair | null;

  if (pair) {
    const quote = getLatestQuote(pair);
    return NextResponse.json({ success: true, quote });
  }

  const quotes = getAllQuotes();
  return NextResponse.json({ success: true, quotes });
}
