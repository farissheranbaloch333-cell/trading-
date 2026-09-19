# SignalPro - Institutional Forex Trading Analysis & Signal Platform

SignalPro is a full-stack, production-ready live forex trading analysis platform and subscription signal service built with Next.js (App Router), TypeScript, Tailwind CSS, and TradingView Lightweight Charts.

---

## Key Features

1. **Live Market Data & Candlestick Engine**
   - 8 Major Pairs: `EUR/USD`, `GBP/USD`, `USD/JPY`, `AUD/USD`, `USD/CAD`, `USD/CHF`, `NZD/USD`, `XAU/USD` (Gold).
   - High-fidelity real-time tick streaming and multi-timeframe candle generator (`1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1D`).
   - Live bid/ask spread, 24h change, and dynamic session indicator (Tokyo, London, New York, Sydney with overlap alerts).

2. **Candlestick Pattern Recognition & Technicals**
   - 11+ Mathematical pattern detectors: Doji (Dragonfly, Gravestone), Hammer, Inverted Hammer, Shooting Star, Hanging Man, Bullish/Bearish Engulfing, Morning/Evening Star, Harami, Three White Soldiers/Black Crows, Piercing Line, Dark Cloud Cover.
   - Indicators: EMA (9, 21, 50, 200), SMA (20, 50, 200), RSI (14), MACD (12, 26, 9), Bollinger Bands (20, 2), ATR (14), Stochastic (%K/%D), ADX, VWAP, Support/Resistance pivots.
   - Dynamic pattern markers drawn directly over TradingView candles.

3. **Multi-Timeframe Confluence Scanner**
   - High-probability signals require multi-timeframe consensus across lower and higher timeframes to eliminate false breakout noise.

4. **AI News Fundamentals & 15-Minute Blackout Guard**
   - Live macro news feed with AI sentiment scoring per currency (-100 to +100).
   - Automated 15-minute pre/post high-impact economic news (CPI, NFP, Rate Decisions) safety blackout to protect capital.

5. **Institutional Signal Engine**
   - Clear trade signals (`BUY` / `SELL` / `NO TRADE`) with exact Entry, Stop Loss, Take Profit (min 1:1.5 R:R), confidence %, plain-English AI explanations, and live countdown timers for candle close and signal validity.
   - "Best Opportunities Today" daily ranking matrix.

6. **Strategy Backtester & 100% Audited Track Record**
   - Backtest quantitative strategies across historical candle series with Net Profit, Win Rate, Profit Factor, Max Drawdown %, and Sharpe Ratio.
   - Transparent public `/performance` audit page with verified historical signals.

7. **Floating Draggable HUD Widget**
   - Compact mini HUD widget draggable across the screen with live quote, UP/DOWN arrow, active signal, countdown timer, and Web Audio API procedural sound chimes.

8. **Subscriptions & SuperAdmin Panel**
   - 3-Day Free Trial, Pro ($49/mo), and VIP Institutional ($399/yr) Stripe subscription checkout with customer portal.
   - Admin Panel (`/admin`) for system health monitoring, MRR analytics, strategy weight tuning, and pair routing.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your optional API keys for Twelve Data, Polygon.io, Finnhub, Stripe, and Gemini/Claude. SignalPro includes a built-in high-fidelity market data simulator so the platform operates fully out-of-the-box even without API keys!

### 3. Run Unit Tests
```bash
npx tsx scripts/test-engine.mjs
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Regulatory & Legal Compliance Note

> [!CAUTION]
> In many jurisdictions (including the US CFTC/NFA, UK FCA, European ESMA, and Australian ASIC), distributing or commercially selling trading signals or investment advice requires formal registration, licensing, or authorization. SignalPro software is provided for educational and analytical purposes. Operators must ensure compliance with all applicable local financial regulations.

---

## Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set your environment variables from `.env.example`.
4. Deploy!
