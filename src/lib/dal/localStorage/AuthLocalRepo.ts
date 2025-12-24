import { AuthRepo } from '../interfaces/AuthRepo';
import { Session, UserProfile, AppRole } from '../types';
import { delay, generateId, now, storageGet, storageSet, storageRemove } from '../utils';
import { seedStaff } from '../seed/seedData';

const SESSION_KEY = 'session';
const STAFF_KEY = 'staff';

export class AuthLocalRepo implements AuthRepo {
  private getStaff(): UserProfile[] {
    return storageGet<UserProfile[]>(STAFF_KEY, seedStaff);
  }

  async login(email: string, password: string): Promise<Session | null> {
    await delay(300);
    
    const staff = this.getStaff();
    const user = staff.find(s => s.email.toLowerCase() === email.toLowerCase() && s.isActive);
    
    if (!user) {
      return null;
    }
    
    // Mock password check (any password works in dev)
    // In real app, this would validate against auth provider
    
    const session: Session = {
      user,
      token: generateId(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    storageSet(SESSION_KEY, session);
    return session;
  }

  async logout(): Promise<void> {
    await delay(100);
    storageRemove(SESSION_KEY);
  }

  async getSession(): Promise<Session | null> {
    await delay(50);
    const session = storageGet<Session | null>(SESSION_KEY, null);
    
    if (!session) {
      return null;
    }
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      storageRemove(SESSION_KEY);
      return null;
    }
    
    // Refresh user data from storage
    const staff = this.getStaff();
    const currentUser = staff.find(s => s.id === session.user.id);
    
    if (!currentUser || !currentUser.isActive) {
      storageRemove(SESSION_KEY);
      return null;
    }
    
    // Update session with latest user data
    session.user = currentUser;
    storageSet(SESSION_KEY, session);
    
    return session;
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  async switchRole(role: AppRole): Promise<Session | null> {
    await delay(100);
    const session = await this.getSession();
    
    if (!session) {
      return null;
    }
    
    // Update user role in storage
    const staff = this.getStaff();
    const userIndex = staff.findIndex(s => s.id === session.user.id);
    
    if (userIndex === -1) {
      return null;
    }
    
    staff[userIndex].role = role;
    storageSet(STAFF_KEY, staff);
    
    // Update session
    session.user.role = role;
    storageSet(SESSION_KEY, session);
    
    return session;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const session = await this.getSession();
    return session?.user || null;
  }
}

export const authLocalRepo = new AuthLocalRepo();
