import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'staff';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  avatarUrl?: string;
  businessArm?: 'Training' | 'Solutions';
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
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('sp_staff_profiles')
    .select('id, email, name, avatar_url, business_arm')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    console.error('Failed to fetch profile:', profileError);
    return null;
  }

  // Fetch role
  const { data: roleData, error: roleError } = await supabase
    .from('sp_user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    console.error('Failed to fetch role:', roleError);
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: (roleData?.role as AppRole) || 'staff',
    avatarUrl: profile.avatar_url || undefined,
    businessArm: profile.business_arm || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        const profile = await fetchUserProfile(data.user.id);
        if (!profile) {
          await supabase.auth.signOut();
          return { success: false, error: 'No staff profile found for this account' };
        }
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const switchRole = async (role: AppRole) => {
    // Role switching is not supported with real auth - roles come from database
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
