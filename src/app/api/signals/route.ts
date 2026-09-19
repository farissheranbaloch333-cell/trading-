import { NextResponse } from 'next/server';
import { generateAllPairSignals, getSignalsHistory, getBestTradesToday, calculatePerformanceStats } from '@/lib/store/signalsStore';
import { Timeframe } from '@/types/market';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = (searchParams.get('timeframe') as Timeframe) || '15m';
  const type = searchParams.get('type') || 'live'; // live, history, best, performance

  if (type === 'best') {
    const bestTrades = getBestTradesToday();
    return NextResponse.json({ success: true, bestTrades });
  }

  if (type === 'history') {
    const history = getSignalsHistory();
    return NextResponse.json({ success: true, history });
  }

  if (type === 'performance') {
    const stats = calculatePerformanceStats();
    return NextResponse.json({ success: true, stats });
  }

  const liveSignals = generateAllPairSignals(timeframe);
  return NextResponse.json({ success: true, signals: liveSignals });
}
