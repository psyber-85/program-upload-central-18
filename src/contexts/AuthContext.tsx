import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, UserProfile, AppRole } from '@/lib/dal/types';
import { authLocalRepo } from '@/lib/dal/localStorage/AuthLocalRepo';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const existingSession = await authLocalRepo.getSession();
        setSession(existingSession);
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const newSession = await authLocalRepo.login(email, password);
      if (newSession) {
        setSession(newSession);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    await authLocalRepo.logout();
    setSession(null);
  };

  const switchRole = async (role: AppRole) => {
    const updatedSession = await authLocalRepo.switchRole(role);
    if (updatedSession) {
      setSession(updatedSession);
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
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
