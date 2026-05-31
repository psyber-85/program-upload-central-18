// Doc 3.3 — Admin-only Monthly Finance Snapshot.
// Backed by `ih_finance_snapshots`. Line items stored inline in `line_items jsonb`.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FinanceLineCategory,
  FinanceLineItem,
  FinanceSnapshot,
  FinanceSnapshotStatus,
} from '../types';
import { supabase } from '@/integrations/supabase/client';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapRow(r: any): FinanceSnapshot {
  return {
    id: r.id,
    month: r.month,
    status: r.status as FinanceSnapshotStatus,
    openingBalance: r.opening_balance == null ? undefined : Number(r.opening_balance),
    closingBalance: r.closing_balance == null ? undefined : Number(r.closing_balance),
    payrollTotal: Number(r.payroll_total ?? 0),
    claimsTotal: Number(r.claims_total ?? 0),
    trainingClaimsTotal: Number(r.training_claims_total ?? 0),
    epfSocsoTotal: Number(r.epf_socso_total ?? 0),
    manualAdjustmentTotal: Number(r.manual_adjustment_total ?? 0),
    notes: r.notes ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
    reviewedBy: r.reviewed_by ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapItems(r: any): FinanceLineItem[] {
  const arr = Array.isArray(r?.line_items) ? r.line_items : [];
  return arr
    .map((i: any): FinanceLineItem => ({
      id: i.id,
      snapshotId: r.id,
      category: i.category,
      amount: Number(i.amount ?? 0),
      note: i.note ?? '',
      link: i.link ?? undefined,
      createdAt: i.createdAt,
      createdBy: i.createdBy,
      isCorrection: !!i.isCorrection,
    }))
    .sort((a: FinanceLineItem, b: FinanceLineItem) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Doc 3.3 §12-§16 — auto-fill payroll-linked totals from finalized/locked payroll.
 */
async function payrollTotalsFor(month: string) {
  const { data, error } = await supabase
    .from('ih_payroll_items')
    .select('base_salary, employer_epf, employer_socso, claims_total, training_total, adjustment, ih_payroll_runs!inner(status, month)')
    .eq('row_status', 'Complete')
    .eq('ih_payroll_runs.month', month)
    .in('ih_payroll_runs.status', ['Finalized', 'Locked']);
  if (error) throw error;
  let payroll = 0, claims = 0, training = 0, epfSocso = 0, adj = 0;
  for (const r of (data ?? []) as any[]) {
    const base = Number(r.base_salary ?? 0);
    const eEpf = Number(r.employer_epf ?? 0);
    const eSocso = Number(r.employer_socso ?? 0);
    payroll += base + eEpf + eSocso;
    claims += Number(r.claims_total ?? 0);
    training += Number(r.training_total ?? 0);
    epfSocso += eEpf + eSocso;
    const adjAmt = r.adjustment?.amount;
    if (typeof adjAmt === 'number') adj += adjAmt;
  }
  return {
    payroll_total: round2(payroll),
    claims_total: round2(claims),
    training_claims_total: round2(training),
    epf_socso_total: round2(epfSocso),
    manual_adjustment_total: round2(adj),
  };
}

async function fetchById(id: string) {
  const { data, error } = await supabase
    .from('ih_finance_snapshots')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchForMonth(month: string) {
  const { data, error } = await supabase
    .from('ih_finance_snapshots')
    .select('*')
    .eq('month', month)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function patch(id: string, patchObj: Record<string, any>): Promise<FinanceSnapshot | undefined> {
  const { data, error } = await supabase
    .from('ih_finance_snapshots')
    .update({ ...patchObj, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export const financeSnapshotRepo = {
  async listSnapshots(): Promise<FinanceSnapshot[]> {
    const { data, error } = await supabase
      .from('ih_finance_snapshots')
      .select('*')
      .order('month', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<FinanceSnapshot | undefined> {
    const row = await fetchById(id);
    return row ? mapRow(row) : undefined;
  },

  async getForMonth(month: string): Promise<FinanceSnapshot | undefined> {
    const row = await fetchForMonth(month);
    return row ? mapRow(row) : undefined;
  },

  async statusFor(month: string): Promise<FinanceSnapshotStatus | 'NotStarted'> {
    const row = await fetchForMonth(month);
    return (row?.status as FinanceSnapshotStatus) ?? 'NotStarted';
  },

  async getOrCreateForMonth(month: string): Promise<FinanceSnapshot> {
    const existing = await fetchForMonth(month);
    const totals = await payrollTotalsFor(month);
    if (existing) {
      if (existing.status === 'Draft') {
        const updated = await patch(existing.id, totals);
        return updated ?? mapRow(existing);
      }
      return mapRow(existing);
    }
    const { data, error } = await supabase
      .from('ih_finance_snapshots')
      .insert({
        month,
        status: 'Draft',
        line_items: [],
        ...totals,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async setOpeningBalance(id: string, value: number | undefined) {
    return patch(id, { opening_balance: value ?? null });
  },
  async setClosingBalance(id: string, value: number | undefined) {
    return patch(id, { closing_balance: value ?? null });
  },
  async setNotes(id: string, notes: string) {
    return patch(id, { notes });
  },

  // ---- Line items (stored inline in `line_items jsonb`) ----
  async lineItemsFor(snapshotId: string): Promise<FinanceLineItem[]> {
    const row = await fetchById(snapshotId);
    if (!row) return [];
    return mapItems(row);
  },

  async addLineItem(
    snapshotId: string,
    input: { category: FinanceLineCategory; amount: number; note: string; link?: string; createdBy: string },
  ): Promise<FinanceLineItem> {
    const row = await fetchById(snapshotId);
    if (!row) throw new Error('Snapshot not found.');
    if (row.status !== 'Draft') {
      throw new Error('Snapshot is locked — use Add Correction instead (Doc 3.3 §21).');
    }
    return this._appendItem(row, { ...input, isCorrection: false });
  },

  /** Doc 3.3 §21 — correction is always allowed, including after lock. */
  async addCorrectionLineItem(
    snapshotId: string,
    input: { category: FinanceLineCategory; amount: number; note: string; link?: string; createdBy: string },
  ): Promise<FinanceLineItem> {
    const row = await fetchById(snapshotId);
    if (!row) throw new Error('Snapshot not found.');
    return this._appendItem(row, { ...input, isCorrection: true });
  },

  async removeLineItem(snapshotId: string, itemId: string) {
    const row = await fetchById(snapshotId);
    if (!row) return;
    if (row.status !== 'Draft') return;
    const next = ((row.line_items ?? []) as any[]).filter((i: any) => i.id !== itemId);
    await patch(row.id, { line_items: next });
  },

  /** Doc 3.3 §19-§20 — Mark Month Reviewed (never "Finalize Accounts"). */
  async markReviewed(id: string, adminId: string) {
    return patch(id, {
      status: 'Reviewed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    });
  },

  /** Optional terminal lock after Reviewed grace window (mirrors payroll lockRun). */
  async lockSnapshot(id: string, adminId: string) {
    const row = await fetchById(id);
    if (!row) return;
    if (row.status === 'Locked') return mapRow(row);
    if (row.status !== 'Reviewed') {
      throw new Error('Only a reviewed snapshot can be locked.');
    }
    return patch(id, {
      status: 'Locked',
      locked_at: new Date().toISOString(),
      locked_by: adminId,
    });
  },

  async _appendItem(row: any, input: Omit<FinanceLineItem, 'id' | 'snapshotId' | 'createdAt'>): Promise<FinanceLineItem> {
    const next: FinanceLineItem = {
      id: uid('fli'),
      snapshotId: row.id,
      createdAt: new Date().toISOString(),
      ...input,
    };
    const nextItems = [
      {
        id: next.id,
        category: next.category,
        amount: next.amount,
        note: next.note,
        link: next.link,
        createdAt: next.createdAt,
        createdBy: next.createdBy,
        isCorrection: next.isCorrection,
      },
      ...((row.line_items ?? []) as any[]),
    ];
    await patch(row.id, { line_items: nextItems });
    return next;
  },
};
