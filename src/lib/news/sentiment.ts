import { NewsArticle, CurrencySentiment } from '@/types/news';

export const LATEST_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Fed Officials Signal Measured Stance on Rate Cuts Amid Resilient Labor Market',
    summary: 'Federal Reserve policymakers indicated patience on further monetary easing as US consumer demand remains robust.',
    source: 'Financial Times',
    url: 'https://ft.com',
    publishedAt: '25 mins ago',
    timestamp: Math.floor(Date.now() / 1000) - 1500,
    currencies: ['USD'],
    sentiment: 'BULLISH',
    sentimentScore: 0.65,
    aiAnalysis: 'Hawkish lean supports USD yields across short-term swap curves.',
  },
  {
    id: 'news-2',
    title: 'Eurozone Manufacturing PMI Contracts Further in Germany and France',
    summary: 'Flash Purchasing Managers Index data revealed persistent industrial weakness in core European economies.',
    source: 'Bloomberg',
    url: 'https://bloomberg.com',
    publishedAt: '45 mins ago',
    timestamp: Math.floor(Date.now() / 1000) - 2700,
    currencies: ['EUR'],
    sentiment: 'BEARISH',
    sentimentScore: -0.55,
    aiAnalysis: 'Dovish pressure increases on ECB to cut interest rates, weakening EUR demand.',
  },
  {
    id: 'news-3',
    title: 'Bank of England Governor Hints at Accelerating Rate Cuts if Inflation Cools',
    summary: 'Governor Andrew Bailey stated that the BoE could become more activist in lowering borrowing costs.',
    source: 'Reuters',
    url: 'https://reuters.com',
    publishedAt: '1 hour ago',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    currencies: ['GBP'],
    sentiment: 'BEARISH',
    sentimentScore: -0.40,
    aiAnalysis: 'Dovish rhetoric from the BoE puts downward pressure on Sterling pairs.',
  },
  {
    id: 'news-4',
    title: 'Gold Hits Fresh All-Time Highs as Central Bank Purchases and Geopolitical Hedging Surge',
    summary: 'Bullion surged past key resistance zones on sustained sovereign reserve accumulation and hedge demand.',
    source: 'Wall Street Journal',
    url: 'https://wsj.com',
    publishedAt: '2 hours ago',
    timestamp: Math.floor(Date.now() / 1000) - 7200,
    currencies: ['XAU', 'USD'],
    sentiment: 'BULLISH',
    sentimentScore: 0.85,
    aiAnalysis: 'Strong structural institutional demand keeps XAU/USD in solid multi-month uptrend.',
  },
  {
    id: 'news-5',
    title: 'Bank of Japan Discusses Gradual Normalization Path as Core Wages Rebound',
    summary: 'BoJ board members reiterated commitment to raising benchmark rates if wage-price spiral sustains.',
    source: 'Nikkei Asia',
    url: 'https://nikkei.com',
    publishedAt: '3 hours ago',
    timestamp: Math.floor(Date.now() / 1000) - 10800,
    currencies: ['JPY'],
    sentiment: 'BULLISH',
    sentimentScore: 0.45,
    aiAnalysis: 'Yield gap narrowing narrative favors Yen appreciation vs G10 peers.',
  },
  {
    id: 'news-6',
    title: 'Australia Retail Sales Outperform Projections as Consumer Spending Rebounds',
    summary: 'ABS reported a 0.7% surge in retail turnover, reducing urgency for RBA monetary easing.',
    source: 'Sydney Morning Herald',
    url: 'https://smh.com.au',
    publishedAt: '4 hours ago',
    timestamp: Math.floor(Date.now() / 1000) - 14400,
    currencies: ['AUD'],
    sentiment: 'BULLISH',
    sentimentScore: 0.50,
    aiAnalysis: 'RBA hawkish stance preserved, providing solid floor under AUD/USD.',
  },
];

export function getCurrencySentiments(): Record<string, CurrencySentiment> {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'XAU'];
  const sentiments: Record<string, CurrencySentiment> = {};

  currencies.forEach((curr) => {
    const matchingNews = LATEST_NEWS_ARTICLES.filter((n) => n.currencies.includes(curr));
    let totalScore = 0;

    matchingNews.forEach((n) => {
      totalScore += n.sentimentScore;
    });

    const avgScore = matchingNews.length > 0 ? totalScore / matchingNews.length : 0;
    const scoreNorm = Math.round(avgScore * 100);

    let sentiment: CurrencySentiment['sentiment'] = 'NEUTRAL';
    if (scoreNorm >= 50) sentiment = 'STRONG_BULLISH';
    else if (scoreNorm >= 20) sentiment = 'BULLISH';
    else if (scoreNorm <= -50) sentiment = 'STRONG_BEARISH';
    else if (scoreNorm <= -20) sentiment = 'BEARISH';

    let rationale = 'Neutral macroeconomic momentum with balanced central bank guidance.';
    if (matchingNews.length > 0 && matchingNews[0].aiAnalysis) {
      rationale = matchingNews[0].aiAnalysis;
    }

    sentiments[curr] = {
      currency: curr,
      score: scoreNorm,
      sentiment,
      rationale,
      lastUpdated: Math.floor(Date.now() / 1000),
      relevantEventsCount: matchingNews.length,
    };
  });

  return sentiments;
}
