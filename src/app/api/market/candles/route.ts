import { NextResponse } from 'next/server';
import { getCandles } from '@/lib/market/dataFeed';
import { CurrencyPair, Timeframe } from '@/types/market';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get('pair') as CurrencyPair) || 'EUR/USD';
  const timeframe = (searchParams.get('timeframe') as Timeframe) || '15m';

  const candles = getCandles(pair, timeframe);
  return NextResponse.json({ success: true, pair, timeframe, candles });
}
