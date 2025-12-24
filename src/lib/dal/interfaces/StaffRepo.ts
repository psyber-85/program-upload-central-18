import { UserProfile, LeaveBalance, TrainingEntitlement } from '../types';

export interface StaffRepo {
  // Get all staff (admin only)
  getAllStaff(): Promise<UserProfile[]>;
  
  // Get active staff only
  getActiveStaff(): Promise<UserProfile[]>;
  
  // Get staff by ID
  getStaffById(id: string): Promise<UserProfile | null>;
  
  // Get staff by email
  getStaffByEmail(email: string): Promise<UserProfile | null>;
  
  // Add new staff member
  addStaff(staff: Omit<UserProfile, 'id'>): Promise<UserProfile>;
  
  // Update staff member
  updateStaff(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null>;
  
  // Deactivate staff member
  deactivateStaff(id: string): Promise<boolean>;
  
  // Reactivate staff member
  reactivateStaff(id: string): Promise<boolean>;
  
  // Get leave balance for user
  getLeaveBalance(userId: string, year: number): Promise<LeaveBalance | null>;
  
  // Update leave balance
  updateLeaveBalance(userId: string, year: number, updates: Partial<LeaveBalance>): Promise<LeaveBalance | null>;
  
  // Initialize leave balance for new year
  initializeLeaveBalance(userId: string, year: number, carryForward?: number): Promise<LeaveBalance>;
  
  // Get training entitlement
  getTrainingEntitlement(userId: string): Promise<TrainingEntitlement | null>;
  
  // Update training entitlement
  updateTrainingEntitlement(userId: string, updates: Partial<TrainingEntitlement>): Promise<TrainingEntitlement | null>;
  
  // Initialize training entitlement (on staff creation)
  initializeTrainingEntitlement(userId: string, joinDate: string): Promise<TrainingEntitlement>;
}
