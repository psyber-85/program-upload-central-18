// Doc 4.1 — Internal Hub identity now comes from Supabase Auth + the
// ih_staff_profiles table. localStorage seed/impersonation has been removed.
// If the authenticated user has no Internal Hub profile, currentStaff is null
// and InternalHubLayout will redirect to /login.
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StaffProfile } from './types';

interface HubContextValue {
  currentStaff: StaffProfile | null;
  isLoading: boolean;
  refresh: () => void;
}

const HubContext = createContext<HubContextValue | undefined>(undefined);

async function loadHubProfile(): Promise<StaffProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Read admin-or-self full row. Sensitive columns are returned only when
  // policy allows (admin sees own + others' full row; staff sees own row).
  const { data, error } = await supabase
    .from('ih_staff_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.name,
    email: data.email,
    role: data.role === 'admin' ? 'Admin' : 'Staff',
    jobTitle: data.job_title ?? '',
    businessArm:
      data.business_arm === 'Solutions' ? 'Solutions'
      : data.business_arm === 'Both' ? 'Admin/General'
      : 'Training',
    joinDate: data.join_date,
    status: data.status === 'Active' ? 'Active' : 'Inactive',
    baseSalary: Number(data.salary_base ?? 0),
    epfRate: Number(data.epf_rate ?? 11),
    socsoRate: Number(data.socso_rate ?? 2),
    eisRate: Number((data as any).eis_rate ?? 0.2),
    employerEpfRate: (data as any).employer_epf_rate == null ? undefined : Number((data as any).employer_epf_rate),
    employerSocsoRate: (data as any).employer_socso_rate == null ? undefined : Number((data as any).employer_socso_rate),
    employerEisRate: (data as any).employer_eis_rate == null ? undefined : Number((data as any).employer_eis_rate),
    insuranceCovered: false,
    adminNotes: data.admin_notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function HubProvider({ children }: { children: ReactNode }) {
  const [currentStaff, setCurrentStaff] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    loadHubProfile().then((profile) => {
      if (!active) return;
      setCurrentStaff(profile);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Reload profile whenever auth state changes.
      loadHubProfile().then((profile) => {
        if (!active) return;
        setCurrentStaff(profile);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [tick]);

  return (
    <HubContext.Provider value={{ currentStaff, isLoading, refresh }}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error('useHub must be used within HubProvider');
  return ctx;
}
