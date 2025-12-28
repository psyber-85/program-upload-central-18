import { supabase } from '@/integrations/supabase/client';
import { UserProfile, LeaveBalance, TrainingEntitlement, AppRole } from '../types';
import { StaffRepo } from '../interfaces/StaffRepo';
import { addYears } from 'date-fns';

class StaffSupabaseRepo implements StaffRepo {

  async getAllStaff(): Promise<UserProfile[]> {
    const { data: profiles, error } = await supabase
      .from('sp_staff_profiles')
      .select('*')
      .order('name');

    if (error || !profiles) {
      console.error('Error fetching staff:', error?.message);
      return [];
    }

    // Fetch all roles
    const { data: roles } = await supabase
      .from('sp_user_roles')
      .select('user_id, role');

    const roleMap = new Map<string, AppRole>();
    roles?.forEach(r => roleMap.set(r.user_id, r.role as AppRole));

    return profiles.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: roleMap.get(p.id) || 'staff',
      businessArm: p.business_arm as 'Training' | 'Solutions',
      joinDate: p.join_date,
      isActive: p.is_active ?? true,
      salaryBase: Number(p.salary_base) || 0,
      epfRate: Number(p.epf_rate) || 11,
      socsoRate: Number(p.socso_rate) || 2,
      avatarUrl: p.avatar_url || undefined,
    }));
  }

  async getActiveStaff(): Promise<UserProfile[]> {
    const all = await this.getAllStaff();
    return all.filter(s => s.isActive);
  }

  async getStaffById(id: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from('sp_staff_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !profile) return null;

    const { data: roleData } = await supabase
      .from('sp_user_roles')
      .select('role')
      .eq('user_id', id)
      .maybeSingle();

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: (roleData?.role as AppRole) || 'staff',
      businessArm: profile.business_arm as 'Training' | 'Solutions',
      joinDate: profile.join_date,
      isActive: profile.is_active ?? true,
      salaryBase: Number(profile.salary_base) || 0,
      epfRate: Number(profile.epf_rate) || 11,
      socsoRate: Number(profile.socso_rate) || 2,
      avatarUrl: profile.avatar_url || undefined,
    };
  }

  async getStaffByEmail(email: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from('sp_staff_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !profile) return null;

    return this.getStaffById(profile.id);
  }

  async addStaff(staff: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    // Generate a new UUID for the staff member
    const newId = crypto.randomUUID();
    
    // Insert into sp_staff_profiles
    const { error: profileError } = await supabase
      .from('sp_staff_profiles')
      .insert({
        id: newId,
        name: staff.name,
        email: staff.email,
        business_arm: staff.businessArm,
        join_date: staff.joinDate,
        is_active: staff.isActive ?? true,
        salary_base: staff.salaryBase,
        epf_rate: staff.epfRate ?? 11,
        socso_rate: staff.socsoRate ?? 2,
        avatar_url: staff.avatarUrl || null,
      });

    if (profileError) {
      console.error('Error adding staff profile:', profileError.message);
      throw new Error(profileError.message);
    }

    // Insert role into sp_user_roles
    const { error: roleError } = await supabase
      .from('sp_user_roles')
      .insert({
        user_id: newId,
        role: staff.role,
      });

    if (roleError) {
      console.error('Error adding staff role:', roleError.message);
      // Don't throw here, profile was created successfully
    }

    // Initialize leave balance for current year
    const currentYear = new Date().getFullYear();
    await this.initializeLeaveBalance(newId, currentYear);

    // Initialize training entitlement
    await this.initializeTrainingEntitlement(newId, staff.joinDate);

    return {
      id: newId,
      ...staff,
    };
  }

  async updateStaff(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.businessArm !== undefined) updateData.business_arm = updates.businessArm;
    if (updates.joinDate !== undefined) updateData.join_date = updates.joinDate;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.salaryBase !== undefined) updateData.salary_base = updates.salaryBase;
    if (updates.epfRate !== undefined) updateData.epf_rate = updates.epfRate;
    if (updates.socsoRate !== undefined) updateData.socso_rate = updates.socsoRate;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from('sp_staff_profiles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating staff:', error.message);
      return null;
    }

    // Update role if provided
    if (updates.role !== undefined) {
      await supabase
        .from('sp_user_roles')
        .upsert({ user_id: id, role: updates.role }, { onConflict: 'user_id,role' });
    }

    return this.getStaffById(id);
  }

  async deactivateStaff(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_staff_profiles')
      .update({ is_active: false })
      .eq('id', id);

    return !error;
  }

  async reactivateStaff(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_staff_profiles')
      .update({ is_active: true })
      .eq('id', id);

    return !error;
  }

  // Leave Balance
  async getLeaveBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    const { data, error } = await supabase
      .from('sp_leave_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      year: data.year,
      alTotal: data.al_total ?? 14,
      alUsed: data.al_used ?? 0,
      alCarryForward: data.al_carry_forward ?? 0,
      slTotal: data.sl_total ?? 10,
      slUsed: data.sl_used ?? 0,
    };
  }

  async updateLeaveBalance(userId: string, year: number, updates: Partial<LeaveBalance>): Promise<LeaveBalance | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.alTotal !== undefined) updateData.al_total = updates.alTotal;
    if (updates.alUsed !== undefined) updateData.al_used = updates.alUsed;
    if (updates.alCarryForward !== undefined) updateData.al_carry_forward = updates.alCarryForward;
    if (updates.slTotal !== undefined) updateData.sl_total = updates.slTotal;
    if (updates.slUsed !== undefined) updateData.sl_used = updates.slUsed;

    const { error } = await supabase
      .from('sp_leave_balances')
      .update(updateData)
      .eq('user_id', userId)
      .eq('year', year);

    if (error) return null;

    return this.getLeaveBalance(userId, year);
  }

  async initializeLeaveBalance(userId: string, year: number, carryForward?: number): Promise<LeaveBalance> {
    const balance: LeaveBalance = {
      userId,
      year,
      alTotal: 14,
      alUsed: 0,
      alCarryForward: Math.min(carryForward || 0, 7),
      slTotal: 10,
      slUsed: 0,
    };

    await supabase
      .from('sp_leave_balances')
      .upsert({
        user_id: userId,
        year,
        al_total: balance.alTotal,
        al_used: balance.alUsed,
        al_carry_forward: balance.alCarryForward,
        sl_total: balance.slTotal,
        sl_used: balance.slUsed,
      }, { onConflict: 'user_id,year' });

    return balance;
  }

  // Training Entitlement
  async getTrainingEntitlement(userId: string): Promise<TrainingEntitlement | null> {
    const { data, error } = await supabase
      .from('sp_training_entitlements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      eligibleFrom: data.eligible_from,
      annualAmount: Number(data.annual_amount) || 1500,
      usedAmount: Number(data.used_amount) || 0,
      overrideEligible: data.override_eligible ?? false,
      overrideBalance: data.override_balance ? Number(data.override_balance) : undefined,
    };
  }

  async updateTrainingEntitlement(userId: string, updates: Partial<TrainingEntitlement>): Promise<TrainingEntitlement | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.eligibleFrom !== undefined) updateData.eligible_from = updates.eligibleFrom;
    if (updates.annualAmount !== undefined) updateData.annual_amount = updates.annualAmount;
    if (updates.usedAmount !== undefined) updateData.used_amount = updates.usedAmount;
    if (updates.overrideEligible !== undefined) updateData.override_eligible = updates.overrideEligible;
    if (updates.overrideBalance !== undefined) updateData.override_balance = updates.overrideBalance;

    const { error } = await supabase
      .from('sp_training_entitlements')
      .update(updateData)
      .eq('user_id', userId);

    if (error) return null;

    return this.getTrainingEntitlement(userId);
  }

  async initializeTrainingEntitlement(userId: string, joinDate: string): Promise<TrainingEntitlement> {
    const eligibleFrom = addYears(new Date(joinDate), 1).toISOString().split('T')[0];
    
    const entitlement: TrainingEntitlement = {
      userId,
      eligibleFrom,
      annualAmount: 1500,
      usedAmount: 0,
    };

    await supabase
      .from('sp_training_entitlements')
      .upsert({
        user_id: userId,
        eligible_from: eligibleFrom,
        annual_amount: 1500,
        used_amount: 0,
      }, { onConflict: 'user_id' });

    return entitlement;
  }
}

export const staffSupabaseRepo = new StaffSupabaseRepo();
