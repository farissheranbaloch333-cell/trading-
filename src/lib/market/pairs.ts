import { PairConfig, CurrencyPair } from '@/types/market';

export const FOREX_PAIRS: Record<CurrencyPair, PairConfig> = {
  'EUR/USD': {
    id: 'EURUSD',
    symbol: 'EUR/USD',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 0.8,
    minPrice: 1.0200,
    maxPrice: 1.1500,
    description: 'Euro / US Dollar',
    isPopular: true,
  },
  'GBP/USD': {
    id: 'GBPUSD',
    symbol: 'GBP/USD',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 1.2,
    minPrice: 1.2200,
    maxPrice: 1.3600,
    description: 'British Pound / US Dollar',
    isPopular: true,
  },
  'USD/JPY': {
    id: 'USDJPY',
    symbol: 'USD/JPY',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    pipSize: 0.01,
    pipDecimalPlaces: 2,
    defaultSpreadPips: 1.0,
    minPrice: 140.00,
    maxPrice: 162.00,
    description: 'US Dollar / Japanese Yen',
    isPopular: true,
  },
  'AUD/USD': {
    id: 'AUDUSD',
    symbol: 'AUD/USD',
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 1.1,
    minPrice: 0.6200,
    maxPrice: 0.7200,
    description: 'Australian Dollar / US Dollar',
    isPopular: false,
  },
  'USD/CAD': {
    id: 'USDCAD',
    symbol: 'USD/CAD',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 1.3,
    minPrice: 1.3000,
    maxPrice: 1.4200,
    description: 'US Dollar / Canadian Dollar',
    isPopular: false,
  },
  'USD/CHF': {
    id: 'USDCHF',
    symbol: 'USD/CHF',
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 1.4,
    minPrice: 0.8400,
    maxPrice: 0.9400,
    description: 'US Dollar / Swiss Franc',
    isPopular: false,
  },
  'NZD/USD': {
    id: 'NZDUSD',
    symbol: 'NZD/USD',
    baseCurrency: 'NZD',
    quoteCurrency: 'USD',
    pipSize: 0.0001,
    pipDecimalPlaces: 4,
    defaultSpreadPips: 1.5,
    minPrice: 0.5700,
    maxPrice: 0.6500,
    description: 'New Zealand Dollar / US Dollar',
    isPopular: false,
  },
  'XAU/USD': {
    id: 'XAUUSD',
    symbol: 'XAU/USD',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    pipSize: 0.1,
    pipDecimalPlaces: 2,
    defaultSpreadPips: 2.5,
    minPrice: 2400.00,
    maxPrice: 3200.00,
    description: 'Gold (Ounce) / US Dollar',
    isPopular: true,
  },
};

export const ALL_PAIRS = Object.keys(FOREX_PAIRS) as CurrencyPair[];

export function formatPrice(pair: CurrencyPair, price: number): string {
  const config = FOREX_PAIRS[pair];
  const decimals = config ? config.pipDecimalPlaces + 1 : 5;
  return price.toFixed(decimals);
}

export function formatPips(pair: CurrencyPair, pips: number): string {
  return `${pips >= 0 ? '+' : ''}${pips.toFixed(1)} pips`;
}

export function calculatePipsDiff(pair: CurrencyPair, priceA: number, priceB: number): number {
  const config = FOREX_PAIRS[pair] || FOREX_PAIRS['EUR/USD'];
  return (priceA - priceB) / config.pipSize;
}
