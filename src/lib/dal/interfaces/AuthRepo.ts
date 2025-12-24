import { Session, UserProfile, AppRole } from '../types';

export interface AuthRepo {
  // Login with email/password (mock)
  login(email: string, password: string): Promise<Session | null>;
  
  // Logout
  logout(): Promise<void>;
  
  // Get current session
  getSession(): Promise<Session | null>;
  
  // Check if session is valid
  isAuthenticated(): Promise<boolean>;
  
  // Dev mode: switch role for testing
  switchRole(role: AppRole): Promise<Session | null>;
  
  // Get current user profile
  getCurrentUser(): Promise<UserProfile | null>;
}
