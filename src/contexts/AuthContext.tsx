// Doc 4.1 — Auth context is the source of truth for "is the current user
// signed in and what role do they have in the Internal Hub". It reads from
// ih_staff_profiles + ih_user_roles. The legacy sp_* tables are NOT used by
// the Internal Hub anymore. /staff/marketing keeps using its own session
// surface, but its ProtectedRoute also reads from here.
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'staff';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  avatarUrl?: string;
  businessArm?: 'Training' | 'Solutions' | 'Both';
  status: 'Pending' | 'Active' | 'Inactive';
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: AppRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  // Profile from ih_staff_profiles (RLS lets the caller read their own row).
  const { data: profile, error: profileError } = await supabase
    .from('ih_staff_profiles')
    .select('id, email, name, role, status, business_arm')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to fetch ih_staff_profile:', profileError);
    return null;
  }
  if (!profile) return null;

  // Role: ih_user_roles is the authoritative role table. Profile.role is
  // a denormalised mirror — prefer the roles table when present.
  const { data: roleRows } = await supabase
    .from('ih_user_roles')
    .select('role')
    .eq('user_id', userId);

  const isAdmin = (roleRows ?? []).some((r) => r.role === 'admin');
  const role: AppRole = isAdmin ? 'admin' : (profile.role === 'admin' ? 'admin' : 'staff');

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role,
    status: (profile.status as UserProfile['status']) ?? 'Pending',
    businessArm: (profile.business_arm as UserProfile['businessArm']) ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.session) return { success: false, error: 'Login failed' };

      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return { success: false, error: 'No Internal Hub profile found for this account.' };
      }
      if (profile.status === 'Inactive') {
        await supabase.auth.signOut();
        return { success: false, error: 'This account is inactive. Contact an admin.' };
      }
      setUser(profile);
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const switchRole = async (_role: AppRole) => {
    // Roles come from ih_user_roles; client cannot switch them.
    console.warn('Role switching is not available with real authentication');
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticated: !!session && !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
