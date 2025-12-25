// Placement Auth Context - Completely isolated from Staff AuthContext
// Provides authentication state for placement system (employer & ops portals)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PlacementSession, PlacementUserRole } from '@/lib/placement/types';
import { initializeMockData } from '@/lib/placement/mockDb';
import { companyRepo, placementUserRepo } from '@/lib/placement/client';

interface PlacementAuthContextType {
  session: PlacementSession | null;
  isLoading: boolean;
  login: (email: string, role: PlacementUserRole, companyId?: string) => Promise<boolean>;
  logout: () => void;
  isEmployer: () => boolean;
  isOps: () => boolean;
  isCompanyAdmin: () => boolean;
  isAdmin: () => boolean;
}

const PlacementAuthContext = createContext<PlacementAuthContextType | undefined>(undefined);

const SESSION_KEY = 'placement_session';

export function PlacementAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlacementSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
    
    // Restore session from localStorage
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: PlacementUserRole, companyId?: string): Promise<boolean> => {
    try {
      const user = await placementUserRepo.getByEmail(email);
      
      let newSession: PlacementSession;
      
      if (user) {
        // Existing user
        let companyName: string | undefined;
        if (user.companyId) {
          const company = await companyRepo.getById(user.companyId);
          companyName = company?.name;
        }
        
        newSession = {
          userId: user.id,
          role: user.role,
          companyId: user.companyId,
          companyName,
          userName: user.name,
          email: user.email,
        };
      } else {
        // Demo login - create session directly
        let companyName: string | undefined;
        if (companyId) {
          const company = await companyRepo.getById(companyId);
          companyName = company?.name;
        }
        
        newSession = {
          userId: `demo-${Date.now()}`,
          role,
          companyId,
          companyName,
          userName: role === 'AIHQ_OPS' ? 'Demo Ops User' : role === 'AIHQ_ADMIN' ? 'Demo Admin' : 'Demo Employer',
          email,
        };
      }
      
      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const isEmployer = () => session?.role === 'COMPANY_ADMIN' || session?.role === 'HIRING_MANAGER';
  const isOps = () => session?.role === 'AIHQ_OPS' || session?.role === 'AIHQ_ADMIN';
  const isCompanyAdmin = () => session?.role === 'COMPANY_ADMIN';
  const isAdmin = () => session?.role === 'AIHQ_ADMIN';

  return (
    <PlacementAuthContext.Provider value={{
      session,
      isLoading,
      login,
      logout,
      isEmployer,
      isOps,
      isCompanyAdmin,
      isAdmin,
    }}>
      {children}
    </PlacementAuthContext.Provider>
  );
}

export function usePlacementAuth() {
  const context = useContext(PlacementAuthContext);
  if (context === undefined) {
    throw new Error('usePlacementAuth must be used within a PlacementAuthProvider');
  }
  return context;
}
