// Resolves the current hub staff profile.
// Strategy: if AuthContext user email matches a seeded staff record, use that.
// Otherwise default to the seeded Admin so the new portal is browsable in dev.
import React, { createContext, useContext, useMemo, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { staffRepo } from './repos/staffRepo';
import type { StaffProfile } from './types';

interface HubContextValue {
  currentStaff: StaffProfile | null;
  refresh: () => void;
  // Dev-only convenience: pretend to be another staff (Doc 0.1 §19 mock switcher).
  impersonate: (staffId: string) => void;
  impersonatedId: string | null;
}

const HubContext = createContext<HubContextValue | undefined>(undefined);

const IMPERSONATE_KEY = 'aihq-hub:impersonate';

export function HubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [impersonatedId, setImpersonatedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(IMPERSONATE_KEY);
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const impersonate = useCallback((staffId: string) => {
    setImpersonatedId(staffId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(IMPERSONATE_KEY, staffId);
    }
  }, []);

  useEffect(() => {
    // Ensure seed exists on mount.
    staffRepo.list();
  }, []);

  const currentStaff = useMemo<StaffProfile | null>(() => {
    void tick;
    const all = staffRepo.list();
    if (impersonatedId) {
      const match = all.find((s) => s.id === impersonatedId);
      if (match) return match;
    }
    if (user?.email) {
      const byEmail = staffRepo.getByEmail(user.email);
      if (byEmail) return byEmail;
    }
    // Dev fallback: first Admin.
    return all.find((s) => s.role === 'Admin') ?? all[0] ?? null;
  }, [user?.email, tick, impersonatedId]);

  const value: HubContextValue = { currentStaff, refresh, impersonate, impersonatedId };
  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHub() {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error('useHub must be used within HubProvider');
  return ctx;
}
