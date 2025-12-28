import { supabase } from '@/integrations/supabase/client';
import { PayrollRun, PayrollItem, Payslip, PayrollRunStatus } from '../types';
import { PayrollRepo } from '../interfaces/PayrollRepo';

class PayrollSupabaseRepo implements PayrollRepo {

  // ============================================
  // PAYROLL RUNS
  // ============================================

  async getAllPayrollRuns(): Promise<PayrollRun[]> {
    const { data, error } = await supabase
      .from('sp_payroll_runs')
      .select('*')
      .order('month', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapPayrollRun);
  }

  async getPayrollRunById(id: string): Promise<PayrollRun | null> {
    const { data, error } = await supabase
      .from('sp_payroll_runs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapPayrollRun(data);
  }

  async getPayrollRunByMonth(month: string): Promise<PayrollRun | null> {
    const { data, error } = await supabase
      .from('sp_payroll_runs')
      .select('*')
      .eq('month', month)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapPayrollRun(data);
  }

  async createPayrollRun(month: string): Promise<PayrollRun> {
    const { data, error } = await supabase
      .from('sp_payroll_runs')
      .insert({ month })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapPayrollRun(data);
  }

  async finalizePayrollRun(id: string): Promise<PayrollRun | null> {
    const { error } = await supabase
      .from('sp_payroll_runs')
      .update({ 
        status: 'Finalized',
        finalized_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return null;

    return this.getPayrollRunById(id);
  }

  async deletePayrollRun(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_payroll_runs')
      .delete()
      .eq('id', id)
      .eq('status', 'Draft');

    return !error;
  }

  // ============================================
  // PAYROLL ITEMS
  // ============================================

  async getPayrollItems(runId: string): Promise<PayrollItem[]> {
    const { data, error } = await supabase
      .from('sp_payroll_items')
      .select('*')
      .eq('run_id', runId)
      .order('user_name');

    if (error || !data) return [];

    return data.map(this.mapPayrollItem);
  }

  async addPayrollItem(item: Omit<PayrollItem, 'id'>): Promise<PayrollItem> {
    const { data, error } = await supabase
      .from('sp_payroll_items')
      .insert({
        run_id: item.runId,
        user_id: item.userId,
        user_name: item.userName,
        base_salary: item.baseSalary,
        epf: item.epf,
        socso: item.socso,
        employer_epf: item.employerEpf,
        employer_socso: item.employerSocso,
        claims_total: item.claimsTotal,
        training_claims_total: item.trainingClaimsTotal,
        net_pay: item.netPay,
        total_company_cost: item.totalCompanyCost,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapPayrollItem(data);
  }

  async updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.baseSalary !== undefined) updateData.base_salary = updates.baseSalary;
    if (updates.epf !== undefined) updateData.epf = updates.epf;
    if (updates.socso !== undefined) updateData.socso = updates.socso;
    if (updates.employerEpf !== undefined) updateData.employer_epf = updates.employerEpf;
    if (updates.employerSocso !== undefined) updateData.employer_socso = updates.employerSocso;
    if (updates.claimsTotal !== undefined) updateData.claims_total = updates.claimsTotal;
    if (updates.trainingClaimsTotal !== undefined) updateData.training_claims_total = updates.trainingClaimsTotal;
    if (updates.netPay !== undefined) updateData.net_pay = updates.netPay;
    if (updates.totalCompanyCost !== undefined) updateData.total_company_cost = updates.totalCompanyCost;

    const { data, error } = await supabase
      .from('sp_payroll_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;

    return this.mapPayrollItem(data);
  }

  async deletePayrollItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_payroll_items')
      .delete()
      .eq('id', id);

    return !error;
  }

  async clearPayrollItems(runId: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_payroll_items')
      .delete()
      .eq('run_id', runId);

    return !error;
  }

  // ============================================
  // PAYSLIPS
  // ============================================

  async getPayslipsByUser(userId: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('sp_payslips')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapPayslip);
  }

  async getPayslipById(id: string): Promise<Payslip | null> {
    const { data, error } = await supabase
      .from('sp_payslips')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapPayslip(data);
  }

  async createPayslip(payslip: Omit<Payslip, 'id' | 'createdAt'>): Promise<Payslip> {
    const { data, error } = await supabase
      .from('sp_payslips')
      .insert({
        run_id: payslip.runId,
        user_id: payslip.userId,
        month: payslip.month,
        base_salary: payslip.baseSalary,
        epf: payslip.epf,
        socso: payslip.socso,
        employer_epf: payslip.employerEpf,
        employer_socso: payslip.employerSocso,
        claims_total: payslip.claimsTotal,
        training_claims_total: payslip.trainingClaimsTotal,
        net_pay: payslip.netPay,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapPayslip(data);
  }

  async getPayslipsByRun(runId: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('sp_payslips')
      .select('*')
      .eq('run_id', runId)
      .order('created_at');

    if (error || !data) return [];

    return data.map(this.mapPayslip);
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapPayrollRun(data: Record<string, unknown>): PayrollRun {
    return {
      id: data.id as string,
      month: data.month as string,
      status: data.status as PayrollRunStatus,
      createdAt: data.created_at as string,
      finalizedAt: data.finalized_at as string | undefined,
    };
  }

  private mapPayrollItem(data: Record<string, unknown>): PayrollItem {
    return {
      id: data.id as string,
      runId: data.run_id as string,
      userId: data.user_id as string,
      userName: data.user_name as string,
      baseSalary: Number(data.base_salary) || 0,
      epf: Number(data.epf) || 0,
      socso: Number(data.socso) || 0,
      employerEpf: Number(data.employer_epf) || 0,
      employerSocso: Number(data.employer_socso) || 0,
      claimsTotal: Number(data.claims_total) || 0,
      trainingClaimsTotal: Number(data.training_claims_total) || 0,
      netPay: Number(data.net_pay) || 0,
      totalCompanyCost: Number(data.total_company_cost) || 0,
    };
  }

  private mapPayslip(data: Record<string, unknown>): Payslip {
    return {
      id: data.id as string,
      runId: data.run_id as string,
      userId: data.user_id as string,
      month: data.month as string,
      baseSalary: Number(data.base_salary) || 0,
      epf: Number(data.epf) || 0,
      socso: Number(data.socso) || 0,
      employerEpf: Number(data.employer_epf) || 0,
      employerSocso: Number(data.employer_socso) || 0,
      claimsTotal: Number(data.claims_total) || 0,
      trainingClaimsTotal: Number(data.training_claims_total) || 0,
      netPay: Number(data.net_pay) || 0,
      createdAt: data.created_at as string,
    };
  }
}

export const payrollSupabaseRepo = new PayrollSupabaseRepo();
