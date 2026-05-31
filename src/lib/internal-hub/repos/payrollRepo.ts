// Doc 3.1 — Payroll Preparation & Finalization.
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Doc 3.1 §15 — Net Pay formula. */
export function computeNetPay(it: PayrollItem): number {
  const adj = it.adjustment?.amount ?? 0;
  return round2(
    it.baseSalary -
      it.epfAmount -
      it.socsoAmount +
      it.claimsTotal +
      it.trainingClaimsTotal +
      adj,
  );
}

function missingFor(s: StaffProfile): PayrollMissingField[] {
  const missing: PayrollMissingField[] = [];
  if (!s.baseSalary || s.baseSalary <= 0) missing.push('baseSalary');
  if (s.epfRate === undefined || s.epfRate === null) missing.push('epfRate');
  if (s.socsoRate === undefined || s.socsoRate === null) missing.push('socsoRate');
  return missing;
}

function mapItem(r: any): PayrollItem {
  return {
    staffId: r.staff_id,
    staffName: r.staff_name,
    month: r.month ?? '',
    baseSalary: Number(r.base_salary ?? 0),
    epfAmount: Number(r.epf ?? 0),
    socsoAmount: Number(r.socso ?? 0),
    claimsTotal: Number(r.claims_total ?? 0),
    trainingClaimsTotal: Number(r.training_total ?? 0),
    adjustment: (r.adjustment as ManualAdjustment | null) ?? null,
    netPay: Number(r.net_pay ?? 0),
    rowStatus: (r.row_status as PayrollItem['rowStatus']) ?? 'Complete',
    missingFields: (r.missing_fields as PayrollMissingField[]) ?? [],
    includedClaimIds: (r.included_claim_ids as string[]) ?? [],
    includedTrainingClaimIds: (r.included_training_claim_ids as string[]) ?? [],
    notes: r.notes ?? undefined,
  };
}

function itemToDb(item: PayrollItem, runId: string) {
  return {
    run_id: runId,
    staff_id: item.staffId,
    staff_name: item.staffName,
    base_salary: item.baseSalary,
    epf: item.epfAmount,
    socso: item.socsoAmount,
    claims_total: item.claimsTotal,
    training_total: item.trainingClaimsTotal,
    net_pay: item.netPay,
    total_company_cost: round2(item.baseSalary + item.epfAmount + item.socsoAmount),
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
  claims: ReturnType<typeof claimRepo.queueableForMonth> extends Promise<infer T> ? T : never,
): PayrollItem {
  const missing = missingFor(s);
  const base = Number(s.baseSalary) || 0;
  const epf = round2((base * (Number(s.epfRate) || 0)) / 100);
  const socso = round2((base * (Number(s.socsoRate) || 0)) / 100);

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
    claimsTotal,
    trainingClaimsTotal: trainingTotal,
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
    // Resolve items in parallel.
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

  /** Doc 3.1 §9-§10. */
  async getOrCreateDraft(month: string): Promise<PayrollRun> {
    const existing = await this.getForMonth(month);
    if (existing) return existing;
    // Refresh staff cache + load queueable claims in parallel.
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

  /** Re-pull row from current staff profile. Preserves adjustment + notes. */
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

  /** Doc 3.1 §11. */
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

  /** Doc 3.1 §23 — finalize: mark claims included, generate payslips, broadcast notices. */
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

    // Generate payslips (Doc 3.2 §5).
    const { payslipRepo } = await import('./payslipRepo');
    const payslips = await payslipRepo.generateForRun(finalized);

    // Payslip-ready notices per staff (Doc 3.2 §16).
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

    return finalized;
  },

  /** Doc 3.1 §24 — terminal lock. */
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
    return (await loadRun(runId))!;
  },

  /** Doc 3.1 §7 — idempotent admin reminder on day ≥ 25 if payroll not yet prepared. */
  async ensureReminderForMonth(month: string, adminId: string): Promise<void> {
    const today = new Date();
    if (today.getUTCDate() < 25) return;
    const status = await this.statusFor(month);
    if (status !== 'NotPrepared' && status !== 'Draft') return;
    // Use unique constraint as idempotency guard.
    const { error: insertErr } = await supabase
      .from('ih_payroll_reminders')
      .insert({ month } as any);
    if (insertErr) {
      // 23505 = unique_violation → reminder already sent for this month.
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
