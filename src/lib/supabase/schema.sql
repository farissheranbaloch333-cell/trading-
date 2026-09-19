-- SignalPro Database Schema for Supabase
-- Target Database: https://idrkfjhgiodhbstktmcs.supabase.co

-- 1. Signals Table
CREATE TABLE IF NOT EXISTS public.signals (
    id TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    timeframe TEXT,
    action TEXT NOT NULL,
    confidence NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    direction TEXT NOT NULL,
    technical_summary TEXT,
    created_at_pkt TEXT NOT NULL,
    payout_percent NUMERIC,
    is_fast_trade BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trades Table
CREATE TABLE IF NOT EXISTS public.trades (
    id TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    result TEXT NOT NULL,
    pnl NUMERIC NOT NULL,
    created_at_pkt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    tier TEXT DEFAULT 'FREE',
    status TEXT DEFAULT 'ACTIVE',
    created_at_pkt TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 5. Open Read/Write Policies for Public Anon Access
CREATE POLICY "Allow public read access on signals" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on signals" ON public.signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on signals" ON public.signals FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on trades" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Allow public insert on trades" ON public.trades FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on subscribers" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
