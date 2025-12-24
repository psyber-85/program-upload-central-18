import { StaffRepo } from '../interfaces/StaffRepo';
import { UserProfile, LeaveBalance, TrainingEntitlement } from '../types';
import { delay, generateId, now, storageGet, storageSet, addYears } from '../utils';
import { seedStaff, seedLeaveBalances, seedTrainingEntitlements } from '../seed/seedData';

const STAFF_KEY = 'staff';
const LEAVE_BALANCES_KEY = 'leave_balances';
const TRAINING_ENTITLEMENTS_KEY = 'training_entitlements';

export class StaffLocalRepo implements StaffRepo {
  private getStaff(): UserProfile[] {
    return storageGet<UserProfile[]>(STAFF_KEY, seedStaff);
  }

  private saveStaff(staff: UserProfile[]): void {
    storageSet(STAFF_KEY, staff);
  }

  private getLeaveBalances(): LeaveBalance[] {
    return storageGet<LeaveBalance[]>(LEAVE_BALANCES_KEY, seedLeaveBalances);
  }

  private saveLeaveBalances(balances: LeaveBalance[]): void {
    storageSet(LEAVE_BALANCES_KEY, balances);
  }

  private getTrainingEntitlements(): TrainingEntitlement[] {
    return storageGet<TrainingEntitlement[]>(TRAINING_ENTITLEMENTS_KEY, seedTrainingEntitlements);
  }

  private saveTrainingEntitlements(entitlements: TrainingEntitlement[]): void {
    storageSet(TRAINING_ENTITLEMENTS_KEY, entitlements);
  }

  async getAllStaff(): Promise<UserProfile[]> {
    await delay();
    return this.getStaff();
  }

  async getActiveStaff(): Promise<UserProfile[]> {
    await delay();
    return this.getStaff().filter(s => s.isActive);
  }

  async getStaffById(id: string): Promise<UserProfile | null> {
    await delay();
    return this.getStaff().find(s => s.id === id) || null;
  }

  async getStaffByEmail(email: string): Promise<UserProfile | null> {
    await delay();
    return this.getStaff().find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async addStaff(staffData: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    await delay();
    const staff = this.getStaff();
    
    const newStaff: UserProfile = {
      ...staffData,
      id: generateId(),
    };
    
    staff.push(newStaff);
    this.saveStaff(staff);
    
    // Initialize leave balance for current year
    const currentYear = new Date().getFullYear();
    await this.initializeLeaveBalance(newStaff.id, currentYear);
    
    // Initialize training entitlement
    await this.initializeTrainingEntitlement(newStaff.id, newStaff.joinDate);
    
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    await delay();
    const staff = this.getStaff();
    const index = staff.findIndex(s => s.id === id);
    
    if (index === -1) {
      return null;
    }
    
    staff[index] = { ...staff[index], ...updates };
    this.saveStaff(staff);
    
    return staff[index];
  }

  async deactivateStaff(id: string): Promise<boolean> {
    await delay();
    const result = await this.updateStaff(id, { isActive: false });
    return result !== null;
  }

  async reactivateStaff(id: string): Promise<boolean> {
    await delay();
    const result = await this.updateStaff(id, { isActive: true });
    return result !== null;
  }

  async getLeaveBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    await delay();
    const balances = this.getLeaveBalances();
    return balances.find(b => b.userId === userId && b.year === year) || null;
  }

  async updateLeaveBalance(userId: string, year: number, updates: Partial<LeaveBalance>): Promise<LeaveBalance | null> {
    await delay();
    const balances = this.getLeaveBalances();
    const index = balances.findIndex(b => b.userId === userId && b.year === year);
    
    if (index === -1) {
      return null;
    }
    
    balances[index] = { ...balances[index], ...updates };
    this.saveLeaveBalances(balances);
    
    return balances[index];
  }

  async initializeLeaveBalance(userId: string, year: number, carryForward: number = 0): Promise<LeaveBalance> {
    await delay();
    const balances = this.getLeaveBalances();
    
    // Check if already exists
    const existing = balances.find(b => b.userId === userId && b.year === year);
    if (existing) {
      return existing;
    }
    
    const newBalance: LeaveBalance = {
      userId,
      year,
      alTotal: 14,
      alUsed: 0,
      alCarryForward: Math.min(carryForward, 7), // max 7 carry forward
      slTotal: 10,
      slUsed: 0,
    };
    
    balances.push(newBalance);
    this.saveLeaveBalances(balances);
    
    return newBalance;
  }

  async getTrainingEntitlement(userId: string): Promise<TrainingEntitlement | null> {
    await delay();
    const entitlements = this.getTrainingEntitlements();
    return entitlements.find(e => e.userId === userId) || null;
  }

  async updateTrainingEntitlement(userId: string, updates: Partial<TrainingEntitlement>): Promise<TrainingEntitlement | null> {
    await delay();
    const entitlements = this.getTrainingEntitlements();
    const index = entitlements.findIndex(e => e.userId === userId);
    
    if (index === -1) {
      return null;
    }
    
    entitlements[index] = { ...entitlements[index], ...updates };
    this.saveTrainingEntitlements(entitlements);
    
    return entitlements[index];
  }

  async initializeTrainingEntitlement(userId: string, joinDate: string): Promise<TrainingEntitlement> {
    await delay();
    const entitlements = this.getTrainingEntitlements();
    
    // Check if already exists
    const existing = entitlements.find(e => e.userId === userId);
    if (existing) {
      return existing;
    }
    
    const newEntitlement: TrainingEntitlement = {
      userId,
      eligibleFrom: addYears(joinDate, 1),
      annualAmount: 1500,
      usedAmount: 0,
    };
    
    entitlements.push(newEntitlement);
    this.saveTrainingEntitlements(entitlements);
    
    return newEntitlement;
  }
}

export const staffLocalRepo = new StaffLocalRepo();
