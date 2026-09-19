import { supabase } from './client';
import { supabaseAdmin } from './server';
import { TradeSignal } from '@/types/signals';
import { FastTradeSignal } from '@/types/quickScan';
import { formatPakistanDateTime } from '../time/pakistanTime';

export interface SupabaseSignalRecord {
  id: string;
  asset: string;
  timeframe?: string;
  action: string;
  confidence: number;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  direction: string;
  technical_summary?: string;
  created_at_pkt: string;
  payout_percent?: number;
  is_fast_trade?: boolean;
}

export interface SupabaseTradeRecord {
  id: string;
  asset: string;
  trade_type: 'CALL' | 'PUT';
  amount: number;
  entry_price: number;
  result: 'WIN' | 'LOSS' | 'PENDING';
  pnl: number;
  created_at_pkt: string;
}

/**
 * Save a generated signal to Supabase database
 */
export async function saveSignalToSupabase(signal: TradeSignal | FastTradeSignal): Promise<boolean> {
  try {
    const isFast = 'expiry' in signal;
    const assetName = isFast ? (signal as FastTradeSignal).asset : (signal as TradeSignal).pair;
    const actionStr = isFast ? (signal as FastTradeSignal).action : (signal as TradeSignal).direction;
    const directionStr = isFast ? (signal as FastTradeSignal).direction : (signal as TradeSignal).direction;
    const summaryStr = isFast ? (signal as FastTradeSignal).technicalSummary : (signal as TradeSignal).reason;

    const record: SupabaseSignalRecord = {
      id: signal.id,
      asset: assetName,
      timeframe: isFast ? (signal as FastTradeSignal).expiry : (signal as TradeSignal).timeframe,
      action: actionStr,
      confidence: signal.confidence,
      entry_price: signal.entryPrice,
      stop_loss: isFast ? undefined : (signal as TradeSignal).stopLoss,
      take_profit: isFast ? undefined : (signal as TradeSignal).takeProfit,
      direction: directionStr,
      technical_summary: summaryStr,
      created_at_pkt: formatPakistanDateTime(),
      payout_percent: isFast ? (signal as FastTradeSignal).payoutPercent : undefined,
      is_fast_trade: isFast,
    };

    const { error } = await supabase.from('signals').upsert(record, { onConflict: 'id' });
    if (error) {
      // Table might not exist yet or permission denied
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Save a completed or active trade to Supabase database
 */
export async function saveTradeToSupabase(trade: {
  id: string;
  asset: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  result: 'WIN' | 'LOSS' | 'PENDING';
  pnl: number;
}): Promise<boolean> {
  try {
    const record: SupabaseTradeRecord = {
      id: trade.id,
      asset: trade.asset,
      trade_type: trade.type,
      amount: trade.amount,
      entry_price: trade.entryPrice,
      result: trade.result,
      pnl: trade.pnl,
      created_at_pkt: formatPakistanDateTime(),
    };

    const { error } = await supabase.from('trades').upsert(record, { onConflict: 'id' });
    if (error) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch latest signals from Supabase database
 */
export async function fetchLatestSignalsFromSupabase(limit = 20): Promise<SupabaseSignalRecord[]> {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at_pkt', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as SupabaseSignalRecord[];
  } catch {
    return [];
  }
}
