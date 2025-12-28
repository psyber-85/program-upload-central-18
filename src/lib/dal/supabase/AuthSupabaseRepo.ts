import { supabase } from '@/integrations/supabase/client';
import { Session, UserProfile, AppRole } from '../types';
import { AuthRepo } from '../interfaces/AuthRepo';

class AuthSupabaseRepo implements AuthRepo {
  
  async login(email: string, password: string): Promise<Session | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Login failed:', error?.message);
      return null;
    }

    // Fetch user profile and role
    const profile = await this.fetchUserProfile(data.session.user.id);
    if (!profile) {
      console.error('Profile not found for user');
      return null;
    }

    return {
      user: profile,
      token: data.session.access_token,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

    const profile = await this.fetchUserProfile(session.user.id);
    if (!profile) {
      return null;
    }

    return {
      user: profile,
      token: session.access_token,
      expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async switchRole(role: AppRole): Promise<Session | null> {
    // In real Supabase auth, role switching is only for admin testing
    // This requires the user to actually have both roles in sp_user_roles
    const session = await this.getSession();
    if (!session) return null;

    // Check if user has the requested role
    const { data: roleData } = await supabase
      .from('sp_user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', role)
      .maybeSingle();

    if (!roleData) {
      console.error('User does not have the requested role');
      return session; // Return current session unchanged
    }

    // Update the session with new role
    return {
      ...session,
      user: {
        ...session.user,
        role,
      },
    };
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return this.fetchUserProfile(user.id);
  }

  // Helper: Fetch user profile with role from database
  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('sp_staff_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return null;
    }

    // Fetch role
    const { data: roleData, error: roleError } = await supabase
      .from('sp_user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) {
      console.error('Error fetching role:', roleError?.message);
    }

    // Default to 'staff' if no role found
    const role: AppRole = (roleData?.role as AppRole) || 'staff';

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role,
      businessArm: profile.business_arm as 'Training' | 'Solutions',
      joinDate: profile.join_date,
      isActive: profile.is_active ?? true,
      salaryBase: Number(profile.salary_base) || 0,
      epfRate: Number(profile.epf_rate) || 11,
      socsoRate: Number(profile.socso_rate) || 2,
      avatarUrl: profile.avatar_url || undefined,
    };
  }
}

export const authSupabaseRepo = new AuthSupabaseRepo();
