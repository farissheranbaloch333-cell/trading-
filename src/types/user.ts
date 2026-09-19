import { CurrencyPair, Timeframe } from './market';

export type SubscriptionTier = 'FREE' | 'PRO' | 'VIP';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoritePairs: CurrencyPair[];
  defaultTimeframe: Timeframe;
  soundAlerts: boolean;
  browserNotifications: boolean;
  theme: 'dark' | 'light';
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  emailAlerts: boolean;
  showFloatingWidget: boolean;
}
