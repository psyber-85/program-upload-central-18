// Doc 3.2 — Payslips backed by Supabase (`ih_payslips` + `ih_payslip_downloads`).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import type {
  HubRole,
  ManualAdjustment,
  Payslip,
  PayslipAvailability,
  PayslipDownloadLogEntry,
  PayrollRun,
} from '../types';
import { CONFIDENTIAL_PAYSLIP_LABEL } from '../types';

function mapRow(r: any): Payslip {
  return {
    id: r.id,
    payrollRunId: r.run_id,
    staffId: r.staff_id,
    staffName: r.staff_name ?? '',
    month: r.month,
    baseSalary: Number(r.base_salary ?? 0),
    epf: Number(r.epf ?? 0),
    socso: Number(r.socso ?? 0),
    claimsTotal: Number(r.claims_total ?? 0),
    trainingClaimsTotal: Number(r.training_total ?? 0),
    adjustment: (r.adjustment as ManualAdjustment | null) ?? null,
    netPay: Number(r.net_pay ?? 0),
    finalizedAt: r.finalized_at ?? r.created_at,
    availability: (r.availability as PayslipAvailability) ?? 'Available',
    pdfRef: r.pdf_path ?? undefined,
    correctionRef: r.correction_ref ?? undefined,
  };
}

async function fetchAll(): Promise<Payslip[]> {
  const { data, error } = await supabase
    .from('ih_payslips')
    .select('*')
    .order('month', { ascending: false });
  if (error) {
    console.error('[payslipRepo.fetchAll]', error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export const payslipRepo = {
  async list(): Promise<Payslip[]> {
    return fetchAll();
  },

  async listAll(): Promise<Payslip[]> {
    return fetchAll();
  },

  async listForStaff(staffId: string, limit?: number): Promise<Payslip[]> {
    let q = supabase
      .from('ih_payslips')
      .select('*')
      .eq('staff_id', staffId)
      .order('month', { ascending: false });
    if (typeof limit === 'number') q = q.limit(limit);
    const { data, error } = await q;
    if (error) {
      console.error('[payslipRepo.listForStaff]', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<Payslip | undefined> {
    const { data, error } = await supabase
      .from('ih_payslips')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[payslipRepo.getById]', error);
      return undefined;
    }
    return data ? mapRow(data) : undefined;
  },

  async forRun(runId: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('ih_payslips')
      .select('*')
      .eq('run_id', runId);
    if (error) {
      console.error('[payslipRepo.forRun]', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  /** Doc 3.2 §5/§8 — one payslip per included staff after finalization. */
  async generateForRun(run: PayrollRun): Promise<Payslip[]> {
    if (run.status !== 'Finalized' && run.status !== 'Locked') return [];
    const existing = await this.forRun(run.id);
    if (existing.length > 0) return existing;
    const now = run.finalizedAt ?? new Date().toISOString();
    const rows = run.items
      .filter((i) => i.rowStatus === 'Complete')
      .map((i) => ({
        run_id: run.id,
        staff_id: i.staffId,
        staff_name: i.staffName,
        month: run.month,
        base_salary: i.baseSalary,
        epf: i.epfAmount,
        socso: i.socsoAmount,
        claims_total: i.claimsTotal,
        training_total: i.trainingClaimsTotal,
        net_pay: i.netPay,
        adjustment: i.adjustment,
        finalized_at: now,
        availability: 'Available' as PayslipAvailability,
      }));
    if (rows.length === 0) return [];
    const { data, error } = await supabase
      .from('ih_payslips')
      .insert(rows as any)
      .select('*');
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  /** Doc 3.2 §19/§20 — log + client-side placeholder PDF. */
  async downloadPdf(id: string, actorId: string, _actorRole: HubRole): Promise<void> {
    const ps = await this.getById(id);
    if (!ps) throw new Error('Payslip not found.');
    if (ps.availability !== 'Available' && ps.availability !== 'Generated') {
      throw new Error('Payslip not available.');
    }
    // Best-effort log (RLS will reject if actorId !== auth.uid()).
    await supabase
      .from('ih_payslip_downloads')
      .insert({ payslip_id: id, staff_id: actorId } as any);

    if (typeof window === 'undefined') return;
    const lines = [
      `AIHQ — Payslip`,
      `${CONFIDENTIAL_PAYSLIP_LABEL}`,
      ``,
      `Staff:            ${ps.staffName}`,
      `Payroll Month:    ${ps.month}`,
      `Finalized:        ${new Date(ps.finalizedAt).toLocaleDateString()}`,
      ``,
      `Base Salary:      ${ps.baseSalary.toFixed(2)}`,
      `EPF:             -${ps.epf.toFixed(2)}`,
      `SOCSO:           -${ps.socso.toFixed(2)}`,
      `Claims:           ${ps.claimsTotal.toFixed(2)}`,
      `Training Claims:  ${ps.trainingClaimsTotal.toFixed(2)}`,
      `Manual Adj.:      ${(ps.adjustment?.amount ?? 0).toFixed(2)}${ps.adjustment ? `  (${ps.adjustment.reason})` : ''}`,
      `------------------------------------`,
      `Net Pay:          ${ps.netPay.toFixed(2)}`,
      ``,
      ps.correctionRef ? `Correction reference: ${ps.correctionRef}` : '',
      ``,
      `Internal document — placeholder format. Real PDF rendering is owned by Card 4.`,
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${ps.month}-${ps.staffName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  async setCorrectionRef(id: string, ref: string): Promise<void> {
    const { error } = await supabase
      .from('ih_payslips')
      .update({ correction_ref: ref } as any)
      .eq('id', id);
    if (error) throw error;
  },

  async downloadLog(): Promise<PayslipDownloadLogEntry[]> {
    const { data, error } = await supabase
      .from('ih_payslip_downloads')
      .select('*')
      .order('downloaded_at', { ascending: false });
    if (error) {
      console.error('[payslipRepo.downloadLog]', error);
      return [];
    }
    return (data ?? []).map((r: any) => ({
      id: r.id,
      payslipId: r.payslip_id,
      actorId: r.staff_id,
      actorRole: 'Staff' as HubRole,
      downloadedAt: r.downloaded_at,
    }));
  },
};
