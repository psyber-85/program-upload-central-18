// Doc 4.1 — Supabase-backed staffRepo.
// Async API. RLS enforces admin-only writes; staff can only read own row.
// Create flow uses the ih-create-staff edge function (sends invite email).
// Deactivation uses ih-deactivate-staff (also revokes sessions).
import { supabase } from '@/integrations/supabase/client';
import type { StaffProfile } from '../types';

type DbRow = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'Pending' | 'Active' | 'Inactive';
  job_title: string | null;
  business_arm: 'Training' | 'Solutions' | 'Both' | null;
  join_date: string;
  salary_base: number | null;
  epf_rate: number | null;
  socso_rate: number | null;
  admin_notes: string | null;
  insurance_notes: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(r: DbRow): StaffProfile {
  return {
    id: r.id,
    fullName: r.name,
    email: r.email,
    role: r.role === 'admin' ? 'Admin' : 'Staff',
    jobTitle: r.job_title ?? '',
    businessArm:
      r.business_arm === 'Solutions' ? 'Solutions'
      : r.business_arm === 'Both' ? 'Admin/General'
      : 'Training',
    joinDate: r.join_date,
    status: r.status === 'Active' ? 'Active' : 'Inactive',
    baseSalary: Number(r.salary_base ?? 0),
    epfRate: Number(r.epf_rate ?? 11),
    socsoRate: Number(r.socso_rate ?? 2),
    insuranceCovered: false,
    adminNotes: r.admin_notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toBusinessArmDb(arm: StaffProfile['businessArm']) {
  return arm === 'Solutions' ? 'Solutions' : arm === 'Admin/General' ? 'Both' : 'Training';
}

export const staffRepo = {
  async list(): Promise<StaffProfile[]> {
    const { data, error } = await supabase
      .from('ih_staff_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as DbRow[] | null)?.map(mapRow) ?? [];
  },

  async get(id: string): Promise<StaffProfile | undefined> {
    const { data, error } = await supabase
      .from('ih_staff_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as DbRow) : undefined;
  },

  async getByEmail(email: string): Promise<StaffProfile | undefined> {
    const { data, error } = await supabase
      .from('ih_staff_profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as DbRow) : undefined;
  },

  /** Create via edge function — sends invite email, creates auth user + profile. */
  async create(input: Omit<StaffProfile, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<StaffProfile> {
    const { data, error } = await supabase.functions.invoke('ih-create-staff', {
      body: {
        name: input.fullName,
        email: input.email,
        jobTitle: input.jobTitle,
        businessArm: toBusinessArmDb(input.businessArm),
        joinDate: input.joinDate,
        role: input.role === 'Admin' ? 'admin' : 'staff',
      },
    });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error ?? 'create_failed');

    // Apply payroll/insurance fields the edge function doesn't take.
    if (input.baseSalary || input.epfRate || input.socsoRate || input.adminNotes) {
      await supabase
        .from('ih_staff_profiles')
        .update({
          salary_base: input.baseSalary,
          epf_rate: input.epfRate,
          socso_rate: input.socsoRate,
          admin_notes: input.adminNotes ?? null,
        })
        .eq('id', data.user_id);
    }

    const created = await this.get(data.user_id);
    if (!created) throw new Error('create_post_lookup_failed');
    return created;
  },

  async update(id: string, patch: Partial<StaffProfile>): Promise<StaffProfile | undefined> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.fullName !== undefined) dbPatch.name = patch.fullName;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.role !== undefined) dbPatch.role = patch.role === 'Admin' ? 'admin' : 'staff';
    if (patch.jobTitle !== undefined) dbPatch.job_title = patch.jobTitle;
    if (patch.businessArm !== undefined) dbPatch.business_arm = toBusinessArmDb(patch.businessArm);
    if (patch.joinDate !== undefined) dbPatch.join_date = patch.joinDate;
    if (patch.baseSalary !== undefined) dbPatch.salary_base = patch.baseSalary;
    if (patch.epfRate !== undefined) dbPatch.epf_rate = patch.epfRate;
    if (patch.socsoRate !== undefined) dbPatch.socso_rate = patch.socsoRate;
    if (patch.adminNotes !== undefined) dbPatch.admin_notes = patch.adminNotes;
    if (patch.status !== undefined) dbPatch.status = patch.status;

    const { error } = await supabase
      .from('ih_staff_profiles')
      .update(dbPatch)
      .eq('id', id);
    if (error) throw error;
    return this.get(id);
  },

  async deactivate(id: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('ih-deactivate-staff', {
      body: { user_id: id },
    });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error ?? 'deactivate_failed');
  },

  async reactivate(id: string): Promise<StaffProfile | undefined> {
    const { error } = await supabase
      .from('ih_staff_profiles')
      .update({ status: 'Active', deactivated_at: null })
      .eq('id', id);
    if (error) throw error;
    return this.get(id);
  },

  /** Hard delete is admin-only and intended for mistake records with no activity. */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase.from('ih_staff_profiles').delete().eq('id', id);
    if (error) throw error;
  },
};
