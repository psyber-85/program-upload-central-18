// Doc 3.1 — Payroll Preparation & Finalization (Patch 002).
// Backed by `ih_payroll_runs` + `ih_payroll_items` + `ih_payroll_reminders`.
// All methods async. Admin-only RLS enforced server-side.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ManualAdjustment,
  PayrollItem,
  PayrollMissingField,
  PayrollRun,
  PayrollRunStatus,
  StaffProfile,
} from '../types';
import { supabase } from '@/integrations/supabase/client';
import { staffRepo } from './staffRepo';
import { claimRepo } from './claimRepo';
import { logAudit } from '../audit';

// Patch 002 default employer rates (fall-back when staff profile has none set).
const DEFAULT_EMPLOYER_EPF_RATE = 13;
const DEFAULT_EMPLOYER_SOCSO_RATE = 1.75;
const DEFAULT_EMPLOYER_EIS_RATE = 0.2;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Patch 002 §13/§20 — Net Pay formula. */
export function computeNetPay(it: PayrollItem): number {
  const adj = it.adjustment?.amount ?? 0;
  return round2(
    it.baseSalary
      - it.epfAmount
      - it.socsoAmount
      - it.eisAmount
      + it.claimsTotal
      + it.trainingClaimsTotal
      + it.bonusTotal
      + it.otherAdditionTotal
      + adj,
  );
}

function totals(it: PayrollItem) {
  return {
    totalEmployeeDeductions: round2(it.epfAmount + it.socsoAmount + it.eisAmount),
    totalEmployerContribution: round2(it.employerEpf + it.employerSocso + it.employerEis),
  };
}

function missingFor(s: StaffProfile): PayrollMissingField[] {
  const missing: PayrollMissingField[] = [];
  if (!s.baseSalary || s.baseSalary <= 0) missing.push('baseSalary');
  if (s.epfRate === undefined || s.epfRate === null) missing.push('epfRate');
  if (s.socsoRate === undefined || s.socsoRate === null) missing.push('socsoRate');
  if (s.eisRate === undefined || s.eisRate === null) missing.push('eisRate');
  return missing;
}

function mapItem(r: any): PayrollItem {
  const it: PayrollItem = {
    staffId: r.staff_id,
    staffName: r.staff_name,
    month: r.month ?? '',
    baseSalary: Number(r.base_salary ?? 0),
    epfAmount: Number(r.epf ?? 0),
    socsoAmount: Number(r.socso ?? 0),
    eisAmount: Number(r.eis ?? 0),
    totalEmployeeDeductions: Number(r.total_employee_deductions ?? 0),
    employerEpf: Number(r.employer_epf ?? 0),
    employerSocso: Number(r.employer_socso ?? 0),
    employerEis: Number(r.employer_eis ?? 0),
    totalEmployerContribution: Number(r.total_employer_contribution ?? 0),
    claimsTotal: Number(r.claims_total ?? 0),
    trainingClaimsTotal: Number(r.training_total ?? 0),
    bonusTotal: Number(r.bonus_total ?? 0),
    otherAdditionTotal: Number(r.other_addition_total ?? 0),
    adjustment: (r.adjustment as ManualAdjustment | null) ?? null,
    netPay: Number(r.net_pay ?? 0),
    rowStatus: (r.row_status as PayrollItem['rowStatus']) ?? 'Complete',
    missingFields: (r.missing_fields as PayrollMissingField[]) ?? [],
    includedClaimIds: (r.included_claim_ids as string[]) ?? [],
    includedTrainingClaimIds: (r.included_training_claim_ids as string[]) ?? [],
    notes: r.notes ?? undefined,
  };
  // Patch 1.7 — self-heal employer contributions if older row stored zeros.
  // Uses default Malaysian rates (13 / 1.75 / 0.2) when row was finalized before
  // the employer split landed. Display only — no DB write.
  if (it.baseSalary > 0 && it.employerEpf === 0 && it.employerSocso === 0 && it.employerEis === 0) {
    it.employerEpf = round2((it.baseSalary * DEFAULT_EMPLOYER_EPF_RATE) / 100);
    it.employerSocso = round2((it.baseSalary * DEFAULT_EMPLOYER_SOCSO_RATE) / 100);
    it.employerEis = round2((it.baseSalary * DEFAULT_EMPLOYER_EIS_RATE) / 100);
  }
  // Back-fill totals if older row has zeros.
  if (!it.totalEmployeeDeductions || !it.totalEmployerContribution) {
    const t = totals(it);
    it.totalEmployeeDeductions ||= t.totalEmployeeDeductions;
    it.totalEmployerContribution ||= t.totalEmployerContribution;
  }
  return it;
}

function itemToDb(item: PayrollItem, runId: string) {
  const t = totals(item);
  return {
    run_id: runId,
    staff_id: item.staffId,
    staff_name: item.staffName,
    base_salary: item.baseSalary,
    epf: item.epfAmount,
    socso: item.socsoAmount,
    eis: item.eisAmount,
    total_employee_deductions: t.totalEmployeeDeductions,
    employer_epf: item.employerEpf,
    employer_socso: item.employerSocso,
    employer_eis: item.employerEis,
    total_employer_contribution: t.totalEmployerContribution,
    claims_total: item.claimsTotal,
    training_total: item.trainingClaimsTotal,
    bonus_total: item.bonusTotal,
    other_addition_total: item.otherAdditionTotal,
    net_pay: item.netPay,
    total_company_cost: round2(item.baseSalary + t.totalEmployerContribution),
    row_status: item.rowStatus,
    missing_fields: item.missingFields,
    adjustment: item.adjustment,
    notes: item.notes ?? null,
    included_claim_ids: item.includedClaimIds,
    included_training_claim_ids: item.includedTrainingClaimIds,
  };
}

function buildItem(
  s: StaffProfile,
  month: string,
  claims: Awaited<ReturnType<typeof claimRepo.queueableForMonth>>,
): PayrollItem {
  const missing = missingFor(s);
  const base = Number(s.baseSalary) || 0;
  const epf = round2((base * (Number(s.epfRate) || 0)) / 100);
  const socso = round2((base * (Number(s.socsoRate) || 0)) / 100);
  const eis = round2((base * (Number(s.eisRate) || 0)) / 100);
  const erEpfRate = s.employerEpfRate ?? DEFAULT_EMPLOYER_EPF_RATE;
  const erSocsoRate = s.employerSocsoRate ?? DEFAULT_EMPLOYER_SOCSO_RATE;
  const erEisRate = s.employerEisRate ?? DEFAULT_EMPLOYER_EIS_RATE;
  const employerEpf = round2((base * erEpfRate) / 100);
  const employerSocso = round2((base * erSocsoRate) / 100);
  const employerEis = round2((base * erEisRate) / 100);

  const mine = claims.filter((c) => c.staffId === s.id);
  const claimRows = mine.filter((c) => c.type === 'Claim');
  const training = mine.filter((c) => c.type === 'TrainingClaim');
  const claimsTotal = round2(claimRows.reduce((sum, c) => sum + c.amount, 0));
  const trainingTotal = round2(training.reduce((sum, c) => sum + c.amount, 0));

  const item: PayrollItem = {
    staffId: s.id,
    staffName: s.fullName,
    month,
    baseSalary: base,
    epfAmount: epf,
    socsoAmount: socso,
    eisAmount: eis,
    totalEmployeeDeductions: round2(epf + socso + eis),
    employerEpf,
    employerSocso,
    employerEis,
    totalEmployerContribution: round2(employerEpf + employerSocso + employerEis),
    claimsTotal,
    trainingClaimsTotal: trainingTotal,
    bonusTotal: 0,
    otherAdditionTotal: 0,
    adjustment: null,
    netPay: 0,
    rowStatus: missing.length > 0 ? 'Incomplete' : 'Complete',
    missingFields: missing,
    includedClaimIds: claimRows.map((c) => c.id),
    includedTrainingClaimIds: training.map((c) => c.id),
  };
  item.netPay = computeNetPay(item);
  return item;
}

async function loadRun(id: string): Promise<PayrollRun | undefined> {
  const { data: run, error } = await supabase
    .from('ih_payroll_runs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[payrollRepo.loadRun]', error);
    return undefined;
  }
  if (!run) return undefined;
  const { data: items, error: itemErr } = await supabase
    .from('ih_payroll_items')
    .select('*')
    .eq('run_id', id)
    .order('staff_name', { ascending: true });
  if (itemErr) console.error('[payrollRepo.loadRun items]', itemErr);
  return {
    id: run.id,
    month: run.month,
    status: run.status as PayrollRunStatus,
    items: (items ?? []).map((r: any) => ({ ...mapItem(r), month: run.month })),
    adminNotes: (run as any).admin_notes ?? undefined,
    createdAt: run.created_at,
    preparedAt: run.created_at,
    finalizedAt: run.finalized_at ?? undefined,
    finalizedBy: run.finalized_by ?? undefined,
    lockedAt: run.locked_at ?? undefined,
  };
}

export const payrollRepo = {
  async listRuns(): Promise<PayrollRun[]> {
    const { data, error } = await supabase
      .from('ih_payroll_runs')
      .select('*')
      .order('month', { ascending: false });
    if (error) {
      console.error('[payrollRepo.listRuns]', error);
      return [];
    }
    const runs = await Promise.all(((data ?? []) as any[]).map((r) => loadRun(r.id)));
    return runs.filter((r): r is PayrollRun => !!r);
  },

  async getRun(id: string): Promise<PayrollRun | undefined> {
    return loadRun(id);
  },

  async getForMonth(month: string): Promise<PayrollRun | undefined> {
    const { data, error } = await supabase
      .from('ih_payroll_runs')
      .select('id')
      .eq('month', month)
      .maybeSingle();
    if (error || !data) return undefined;
    return loadRun(data.id);
  },

  async statusFor(month: string): Promise<PayrollRunStatus> {
    const r = await this.getForMonth(month);
    return r?.status ?? 'NotPrepared';
  },

  async getOrCreateDraft(month: string): Promise<PayrollRun> {
    const existing = await this.getForMonth(month);
    if (existing) return existing;
    const [allStaff, claims] = await Promise.all([
      staffRepo.list(),
      claimRepo.queueableForMonth(month),
    ]);
    const active = allStaff.filter((s) => s.status === 'Active');
    const { data: run, error } = await (supabase
      .from('ih_payroll_runs')
      .insert({ month, status: 'Draft' } as any)
      .select('*')
      .single() as any);
    if (error) throw error;
    const items = active.map((s) => buildItem(s, month, claims));
    if (items.length > 0) {
      const { error: itemErr } = await supabase
        .from('ih_payroll_items')
        .insert(items.map((i) => itemToDb(i, run.id)) as any);
      if (itemErr) throw itemErr;
    }
    return (await loadRun(run.id))!;
  },

  async refreshRow(runId: string, staffId: string): Promise<PayrollRun | undefined> {
    const run = await loadRun(runId);
    if (!run) return undefined;
    if (run.status === 'Finalized' || run.status === 'Locked') return run;
    const [s, claims] = await Promise.all([
      staffRepo.get(staffId),
      claimRepo.queueableForMonth(run.month),
    ]);
    if (!s) return run;
    const fresh = buildItem(s, run.month, claims);
    const old = run.items.find((i) => i.staffId === staffId);
    if (old) {
      fresh.adjustment = old.adjustment;
      fresh.notes = old.notes;
      fresh.bonusTotal = old.bonusTotal;
      fresh.otherAdditionTotal = old.otherAdditionTotal;
      fresh.netPay = computeNetPay(fresh);
    }
    const { error } = await supabase
      .from('ih_payroll_items')
      .update(itemToDb(fresh, runId) as any)
      .eq('run_id', runId)
      .eq('staff_id', staffId);
    if (error) throw error;
    return loadRun(runId);
  },

  async setAdjustment(
    runId: string,
    staffId: string,
    adjustment: ManualAdjustment | null,
  ): Promise<PayrollRun | undefined> {
    if (adjustment && !adjustment.reason.trim()) {
      throw new Error('Manual adjustment requires a reason (Doc 3.1 §21).');
    }
    const run = await loadRun(runId);
    if (!run) return undefined;
    if (run.status === 'Finalized' || run.status === 'Locked') {
      throw new Error('Payroll is finalized and locked.');
    }
    const item = run.items.find((i) => i.staffId === staffId);
    if (!item) return run;
    const next: PayrollItem = { ...item, adjustment };
    next.netPay = computeNetPay(next);
    const { error } = await supabase
      .from('ih_payroll_items')
      .update({ adjustment, net_pay: next.netPay } as any)
      .eq('run_id', runId)
      .eq('staff_id', staffId);
    if (error) throw error;
    return loadRun(runId);
  },

  /** Patch 002 §11 — bonus is an addition outside Total Income. */
  async setBonus(runId: string, staffId: string, amount: number): Promise<PayrollRun | undefined> {
    return this._setAddition(runId, staffId, { bonusTotal: round2(amount) });
  },

  async setOtherAddition(runId: string, staffId: string, amount: number): Promise<PayrollRun | undefined> {
    return this._setAddition(runId, staffId, { otherAdditionTotal: round2(amount) });
  },

  async _setAddition(
    runId: string,
    staffId: string,
    patch: Partial<Pick<PayrollItem, 'bonusTotal' | 'otherAdditionTotal'>>,
  ): Promise<PayrollRun | undefined> {
    const run = await loadRun(runId);
    if (!run) return undefined;
    if (run.status === 'Finalized' || run.status === 'Locked') {
      throw new Error('Payroll is finalized and locked.');
    }
    const item = run.items.find((i) => i.staffId === staffId);
    if (!item) return run;
    const next: PayrollItem = { ...item, ...patch };
    next.netPay = computeNetPay(next);
    const { error } = await supabase
      .from('ih_payroll_items')
      .update({
        bonus_total: next.bonusTotal,
        other_addition_total: next.otherAdditionTotal,
        net_pay: next.netPay,
      } as any)
      .eq('run_id', runId)
      .eq('staff_id', staffId);
    if (error) throw error;
    return loadRun(runId);
  },

  async setRunNotes(runId: string, notes: string): Promise<PayrollRun | undefined> {
    const { error } = await supabase
      .from('ih_payroll_runs')
      .update({ admin_notes: notes } as any)
      .eq('id', runId);
    if (error) throw error;
    return loadRun(runId);
  },

  async setRowNotes(runId: string, staffId: string, notes: string): Promise<PayrollRun | undefined> {
    const { error } = await supabase
      .from('ih_payroll_items')
      .update({ notes } as any)
      .eq('run_id', runId)
      .eq('staff_id', staffId);
    if (error) throw error;
    return loadRun(runId);
  },

  async markReadyForReview(runId: string): Promise<PayrollRun | undefined> {
    const { error } = await supabase
      .from('ih_payroll_runs')
      .update({ status: 'ReadyForReview' } as any)
      .eq('id', runId)
      .in('status', ['Draft', 'ReadyForReview']);
    if (error) throw error;
    return loadRun(runId);
  },

  async canFinalize(runId: string): Promise<{ ok: boolean; reason?: string }> {
    const run = await loadRun(runId);
    if (!run) return { ok: false, reason: 'Run not found.' };
    if (run.status === 'Finalized' || run.status === 'Locked') {
      return { ok: false, reason: 'Already finalized.' };
    }
    const incomplete = run.items.filter((i) => i.rowStatus === 'Incomplete');
    if (incomplete.length > 0) {
      return { ok: false, reason: `${incomplete.length} staff row(s) are incomplete.` };
    }
    return { ok: true };
  },

  async finalize(runId: string, adminId: string): Promise<PayrollRun> {
    const check = await this.canFinalize(runId);
    if (!check.ok) throw new Error(check.reason ?? 'Cannot finalize.');
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('ih_payroll_runs')
      .update({ status: 'Finalized', finalized_at: now, finalized_by: adminId } as any)
      .eq('id', runId);
    if (error) throw error;
    const finalized = (await loadRun(runId))!;

    const allClaimIds = finalized.items.flatMap((i) => [
      ...i.includedClaimIds,
      ...i.includedTrainingClaimIds,
    ]);
    if (allClaimIds.length > 0) {
      await claimRepo.markIncluded(allClaimIds, finalized.id, finalized.month);
    }

    const { payslipRepo } = await import('./payslipRepo');
    const payslips = await payslipRepo.generateForRun(finalized);

    const { noticeRepo } = await import('./noticeRepo');
    await Promise.all(
      payslips.map((ps) =>
        noticeRepo.broadcast({
          title: `Payslip ready — ${ps.month}`,
          message:
            'Your payslip for this month is ready. Open the portal to view or download.',
          type: 'PayrollNotice',
          importance: 'Important',
          audience: { kind: 'Individual', staffId: ps.staffId },
          links: [{ label: 'View payslip', url: `/staff/payslips/${ps.id}` }],
          createdBy: adminId,
        }),
      ),
    );

    void logAudit({
      action: 'payroll.finalized',
      targetTable: 'ih_payroll_runs',
      targetId: finalized.id,
      summary: `Payroll finalized for ${finalized.month}`,
      metadata: { item_count: finalized.items.length, payslip_count: payslips.length },
    });

    return finalized;
  },

  async lockRun(runId: string, _adminId: string): Promise<PayrollRun> {
    const run = await loadRun(runId);
    if (!run) throw new Error('Run not found.');
    if (run.status === 'Locked') return run;
    if (run.status !== 'Finalized') {
      throw new Error('Only a finalized run can be locked.');
    }
    const { error } = await supabase
      .from('ih_payroll_runs')
      .update({ status: 'Locked', locked_at: new Date().toISOString(), locked_by: _adminId } as any)
      .eq('id', runId);
    if (error) throw error;
    void logAudit({
      action: 'payroll.locked',
      targetTable: 'ih_payroll_runs',
      targetId: runId,
      summary: `Payroll locked for ${run.month}`,
    });
    return (await loadRun(runId))!;
  },

  async ensureReminderForMonth(month: string, adminId: string): Promise<void> {
    const today = new Date();
    if (today.getUTCDate() < 25) return;
    const status = await this.statusFor(month);
    if (status !== 'NotPrepared' && status !== 'Draft') return;
    const { error: insertErr } = await supabase
      .from('ih_payroll_reminders')
      .insert({ month } as any);
    if (insertErr) {
      return;
    }
    const { noticeRepo } = await import('./noticeRepo');
    await noticeRepo.broadcast({
      title: `Payroll reminder — prepare ${month}`,
      message:
        'Monthly payroll preparation is due. Review staff rows, resolve incomplete data, and finalize before payday.',
      type: 'PayrollNotice',
      importance: 'Important',
      audience: { kind: 'Admin' },
      links: [{ label: 'Open payroll', url: '/staff/admin/payroll' }],
      createdBy: adminId,
    });
  },
};
