'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionTier, UserPreferences } from '@/types/user';
import confetti from 'canvas-confetti';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSubscribed: boolean;
  isVIP: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  upgradeTier: (tier: SubscriptionTier) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoritePairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'],
  defaultTimeframe: '15m',
  soundAlerts: true,
  browserNotifications: true,
  theme: 'dark',
  riskTolerance: 'MODERATE',
  emailAlerts: true,
  showFloatingWidget: true,
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-pro-trader',
  email: 'trader@signalpro.io',
  name: 'Alex Vance',
  tier: 'PRO',
  subscriptionStatus: 'active',
  currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
  preferences: DEFAULT_PREFERENCES,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted user or default to Active Pro
    const saved = localStorage.getItem('signalpro_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_USER);
      }
    } else {
      setUser(DEFAULT_USER);
      localStorage.setItem('signalpro_user', JSON.stringify(DEFAULT_USER));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const updated: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      tier: 'PRO',
      subscriptionStatus: 'active',
      preferences: DEFAULT_PREFERENCES,
    };
    setUser(updated);
    localStorage.setItem('signalpro_user', JSON.stringify(updated));
    return true;
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      tier: 'PRO',
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      preferences: DEFAULT_PREFERENCES,
    };
    setUser(newUser);
    localStorage.setItem('signalpro_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    const guestUser: UserProfile = {
      id: 'guest',
      email: 'guest@signalpro.io',
      name: 'Guest Trader',
      tier: 'FREE',
      subscriptionStatus: 'none',
      preferences: DEFAULT_PREFERENCES,
    };
    setUser(guestUser);
    localStorage.setItem('signalpro_user', JSON.stringify(guestUser));
  };

  const upgradeTier = async (tier: SubscriptionTier) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      tier,
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(Date.now() + (tier === 'VIP' ? 365 : 30) * 86400000).toISOString(),
    };
    setUser(updated);
    localStorage.setItem('signalpro_user', JSON.stringify(updated));

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
      });
    } catch {}
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updated);
    localStorage.setItem('signalpro_user', JSON.stringify(updated));
  };

  const isSubscribed = user?.tier === 'PRO' || user?.tier === 'VIP';
  const isVIP = user?.tier === 'VIP';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSubscribed,
        isVIP,
        login,
        signup,
        logout,
        upgradeTier,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
