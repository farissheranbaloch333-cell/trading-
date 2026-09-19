import { SessionInfo } from '@/types/market';

export const SESSIONS_CONFIG: { name: SessionInfo['name']; label: string; openUtc: number; closeUtc: number }[] = [
  { name: 'SYDNEY', label: 'Sydney', openUtc: 22, closeUtc: 7 },
  { name: 'TOKYO', label: 'Tokyo (Asia)', openUtc: 0, closeUtc: 9 },
  { name: 'LONDON', label: 'London (Europe)', openUtc: 8, closeUtc: 17 },
  { name: 'NEW_YORK', label: 'New York (US)', openUtc: 13, closeUtc: 22 },
];

export function getMarketSessions(): { sessions: SessionInfo[]; activeCount: number; isHighVolatilityOverlap: boolean } {
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;

  let activeCount = 0;
  let londonActive = false;
  let nyActive = false;

  const sessions: SessionInfo[] = SESSIONS_CONFIG.map((cfg) => {
    let isActive = false;
    if (cfg.openUtc < cfg.closeUtc) {
      isActive = utcHours >= cfg.openUtc && utcHours < cfg.closeUtc;
    } else {
      // Crosses midnight UTC
      isActive = utcHours >= cfg.openUtc || utcHours < cfg.closeUtc;
    }

    if (isActive) {
      activeCount++;
      if (cfg.name === 'LONDON') londonActive = true;
      if (cfg.name === 'NEW_YORK') nyActive = true;
    }

    // Determine volatility
    let volatility: SessionInfo['volatility'] = 'MEDIUM';
    if (cfg.name === 'LONDON' || cfg.name === 'NEW_YORK') {
      volatility = 'HIGH';
    } else if (cfg.name === 'SYDNEY') {
      volatility = 'LOW';
    }

    return {
      name: cfg.name,
      label: cfg.label,
      openUtcHour: cfg.openUtc,
      closeUtcHour: cfg.closeUtc,
      isActive,
      volatility,
    };
  });

  const isHighVolatilityOverlap = londonActive && nyActive;

  return { sessions, activeCount, isHighVolatilityOverlap };
}
