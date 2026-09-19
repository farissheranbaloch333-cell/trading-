import { EconomicEvent, NewsImpact } from '@/types/news';

export function getUpcomingEconomicEvents(): EconomicEvent[] {
  const now = Math.floor(Date.now() / 1000);
  const hour = 3600;

  const mockEvents: EconomicEvent[] = [
    {
      id: 'event-us-cpi',
      title: 'US Core CPI (YoY)',
      currency: 'USD',
      date: new Date((now + 1800) * 1000).toISOString(),
      timestamp: now + 1800, // in 30 minutes
      impact: 'HIGH',
      forecast: '3.2%',
      previous: '3.3%',
      unit: '%',
      country: 'US',
    },
    {
      id: 'event-ecb-rate',
      title: 'ECB Interest Rate Decision',
      currency: 'EUR',
      date: new Date((now + 3 * hour) * 1000).toISOString(),
      timestamp: now + 3 * hour,
      impact: 'HIGH',
      forecast: '3.25%',
      previous: '3.50%',
      unit: '%',
      country: 'EU',
    },
    {
      id: 'event-uk-gdp',
      title: 'UK Monthly GDP (MoM)',
      currency: 'GBP',
      date: new Date((now + 5 * hour) * 1000).toISOString(),
      timestamp: now + 5 * hour,
      impact: 'HIGH',
      forecast: '0.2%',
      previous: '0.0%',
      unit: '%',
      country: 'GB',
    },
    {
      id: 'event-us-retail',
      title: 'US Retail Sales (MoM)',
      currency: 'USD',
      date: new Date((now + 7 * hour) * 1000).toISOString(),
      timestamp: now + 7 * hour,
      impact: 'MEDIUM',
      forecast: '0.4%',
      previous: '0.1%',
      unit: '%',
      country: 'US',
    },
    {
      id: 'event-jp-trade',
      title: 'Japan Trade Balance',
      currency: 'JPY',
      date: new Date((now + 12 * hour) * 1000).toISOString(),
      timestamp: now + 12 * hour,
      impact: 'MEDIUM',
      forecast: '-¥250B',
      previous: '-¥695B',
      unit: 'JPY',
      country: 'JP',
    },
    {
      id: 'event-au-unemployment',
      title: 'Australia Employment Change',
      currency: 'AUD',
      date: new Date((now + 16 * hour) * 1000).toISOString(),
      timestamp: now + 16 * hour,
      impact: 'HIGH',
      forecast: '25.0K',
      previous: '47.5K',
      unit: 'K',
      country: 'AU',
    },
    {
      id: 'event-ca-boc',
      title: 'Bank of Canada Rate Statement',
      currency: 'CAD',
      date: new Date((now + 24 * hour) * 1000).toISOString(),
      timestamp: now + 24 * hour,
      impact: 'HIGH',
      forecast: '3.75%',
      previous: '4.25%',
      unit: '%',
      country: 'CA',
    },
    {
      id: 'event-ch-kof',
      title: 'Switzerland KOF Leading Indicator',
      currency: 'CHF',
      date: new Date((now + 28 * hour) * 1000).toISOString(),
      timestamp: now + 28 * hour,
      impact: 'LOW',
      forecast: '100.5',
      previous: '99.8',
      unit: 'pts',
      country: 'CH',
    },
  ];

  return mockEvents.sort((a, b) => a.timestamp - b.timestamp);
}

// 15-Minute News Blackout Detector: Returns true if within 15 min before or 15 min after a HIGH-impact event
export function checkNewsBlackout(
  currencyA: string,
  currencyB: string,
  events: EconomicEvent[] = getUpcomingEconomicEvents()
): {
  isBlackout: boolean;
  upcomingEvent?: EconomicEvent;
  minutesRemaining?: number;
} {
  const now = Math.floor(Date.now() / 1000);
  const blackoutWindowSeconds = 15 * 60; // 15 minutes

  for (const event of events) {
    if (event.impact === 'HIGH' && (event.currency === currencyA || event.currency === currencyB)) {
      const diffSeconds = event.timestamp - now;

      // Event is coming within 15 minutes OR happened less than 15 minutes ago
      if (diffSeconds > -blackoutWindowSeconds && diffSeconds <= blackoutWindowSeconds) {
        const minutesRemaining = Math.max(0, Math.round(diffSeconds / 60));
        return {
          isBlackout: true,
          upcomingEvent: event,
          minutesRemaining,
        };
      }
    }
  }

  return { isBlackout: false };
}
