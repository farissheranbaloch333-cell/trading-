// Pakistan Standard Time (PKT / UTC+5 / Asia/Karachi) Time Utility

export const PAKISTAN_TIMEZONE = 'Asia/Karachi';
export const PAKISTAN_OFFSET_HOURS = 5;

/**
 * Format any timestamp or date into Pakistan Standard Time (PKT)
 */
export function formatPakistanTime(
  dateOrTimestamp?: Date | number | string,
  includeSeconds: boolean = true
): string {
  const date = dateOrTimestamp
    ? typeof dateOrTimestamp === 'number'
      ? dateOrTimestamp < 10000000000
        ? new Date(dateOrTimestamp * 1000)
        : new Date(dateOrTimestamp)
      : new Date(dateOrTimestamp)
    : new Date();

  return (
    date.toLocaleTimeString('en-US', {
      timeZone: PAKISTAN_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: false,
    }) + ' PKT'
  );
}

/**
 * Format full date and time in Pakistan Standard Time
 * e.g. "19 Sep 2026, 17:30:45 PKT"
 */
export function formatPakistanDateTime(
  dateOrTimestamp?: Date | number | string
): string {
  const date = dateOrTimestamp
    ? typeof dateOrTimestamp === 'number'
      ? dateOrTimestamp < 10000000000
        ? new Date(dateOrTimestamp * 1000)
        : new Date(dateOrTimestamp)
      : new Date(dateOrTimestamp)
    : new Date();

  return (
    date.toLocaleDateString('en-GB', {
      timeZone: PAKISTAN_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    date.toLocaleTimeString('en-US', {
      timeZone: PAKISTAN_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) +
    ' PKT'
  );
}

/**
 * Format date in Pakistan Standard Time
 * e.g. "19 Sep 2026"
 */
export function formatPakistanDate(
  dateOrTimestamp?: Date | number | string
): string {
  const date = dateOrTimestamp
    ? typeof dateOrTimestamp === 'number'
      ? dateOrTimestamp < 10000000000
        ? new Date(dateOrTimestamp * 1000)
        : new Date(dateOrTimestamp)
      : new Date(dateOrTimestamp)
    : new Date();

  return date.toLocaleDateString('en-GB', {
    timeZone: PAKISTAN_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get current time details in Pakistan Time
 */
export function getPakistanTimeNow(): {
  timeStr: string;
  dateTimeStr: string;
  dateStr: string;
  hoursPkt: number;
  minutesPkt: number;
  secondsPkt: number;
} {
  const now = new Date();
  const timeStr = formatPakistanTime(now, true);
  const dateTimeStr = formatPakistanDateTime(now);
  const dateStr = formatPakistanDate(now);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PAKISTAN_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hoursPkt = Number(parts.find((p) => p.type === 'hour')?.value || 0);
  const minutesPkt = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  const secondsPkt = Number(parts.find((p) => p.type === 'second')?.value || 0);

  return {
    timeStr,
    dateTimeStr,
    dateStr,
    hoursPkt,
    minutesPkt,
    secondsPkt,
  };
}

export interface PakistanSessionConfig {
  name: 'SYDNEY' | 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'QUOTEX_OTC';
  label: string;
  openPkt: string; // e.g. "05:00 AM PKT"
  closePkt: string; // e.g. "02:00 PM PKT"
  openHourPkt: number;
  closeHourPkt: number;
  isActive: boolean;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

/**
 * Get Market Sessions calculated in Pakistan Standard Time (PKT)
 */
export function getMarketSessionsInPakistanTime(): {
  sessions: PakistanSessionConfig[];
  activeCount: number;
  isHighVolatilityOverlap: boolean;
  currentPktTime: string;
} {
  const { hoursPkt, minutesPkt, timeStr } = getPakistanTimeNow();
  const currentPktDecimal = hoursPkt + minutesPkt / 60;

  const sessionConfigs: Omit<PakistanSessionConfig, 'isActive'>[] = [
    {
      name: 'QUOTEX_OTC',
      label: 'Quotex 24/7 OTC',
      openPkt: '24 Hours',
      closePkt: '24 Hours',
      openHourPkt: 0,
      closeHourPkt: 24,
      volatility: 'HIGH',
    },
    {
      name: 'TOKYO',
      label: 'Tokyo / Asian',
      openPkt: '05:00 PKT',
      closePkt: '14:00 PKT',
      openHourPkt: 5,
      closeHourPkt: 14,
      volatility: 'MEDIUM',
    },
    {
      name: 'LONDON',
      label: 'London / European',
      openPkt: '13:00 PKT',
      closePkt: '22:00 PKT',
      openHourPkt: 13,
      closeHourPkt: 22,
      volatility: 'HIGH',
    },
    {
      name: 'NEW_YORK',
      label: 'New York / US',
      openPkt: '18:00 PKT',
      closePkt: '03:00 PKT',
      openHourPkt: 18,
      closeHourPkt: 3, // crosses midnight in PKT
      volatility: 'EXTREME',
    },
    {
      name: 'SYDNEY',
      label: 'Sydney / Pacific',
      openPkt: '03:00 PKT',
      closePkt: '12:00 PKT',
      openHourPkt: 3,
      closeHourPkt: 12,
      volatility: 'LOW',
    },
  ];

  let londonActive = false;
  let nyActive = false;
  let activeCount = 0;

  const sessions: PakistanSessionConfig[] = sessionConfigs.map((cfg) => {
    let isActive = false;
    if (cfg.name === 'QUOTEX_OTC') {
      isActive = true;
    } else if (cfg.openHourPkt < cfg.closeHourPkt) {
      isActive = currentPktDecimal >= cfg.openHourPkt && currentPktDecimal < cfg.closeHourPkt;
    } else {
      // Crosses midnight in PKT
      isActive = currentPktDecimal >= cfg.openHourPkt || currentPktDecimal < cfg.closeHourPkt;
    }

    if (isActive) {
      activeCount++;
      if (cfg.name === 'LONDON') londonActive = true;
      if (cfg.name === 'NEW_YORK') nyActive = true;
    }

    return {
      ...cfg,
      isActive,
    };
  });

  const isHighVolatilityOverlap = londonActive && nyActive;

  return {
    sessions,
    activeCount,
    isHighVolatilityOverlap,
    currentPktTime: timeStr,
  };
}
