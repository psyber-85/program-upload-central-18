// Doc 3.1 §16-§20 — claims that feed payroll.
// Backed by `ih_requests` where kind='Claim'. Payload jsonb holds the claim-
// specific shape since the spec folds claims into the unified requests table.
import { supabase } from '@/integrations/supabase/client';
import type { ApprovedClaim, ClaimInclusionState, ClaimType } from '../types';

interface ClaimPayload {
  type: ClaimType;
  amount: number;
  description?: string;
  inclusionState: ClaimInclusionState;
  includedInPayrollRunId?: string;
  includedInMonth?: string;
}

interface DbRow {
  id: string;
  staff_id: string;
  status: string;
  payload: ClaimPayload;
  decided_at: string | null;
  created_at: string;
}

function mapRow(r: DbRow): ApprovedClaim {
  const p = r.payload ?? ({} as ClaimPayload);
  return {
    id: r.id,
    staffId: r.staff_id,
    type: p.type ?? 'Claim',
    amount: Number(p.amount ?? 0),
    description: p.description,
    approvedAt: r.decided_at ?? r.created_at,
    inclusionState: p.inclusionState ?? 'QueuedForPayroll',
    includedInPayrollRunId: p.includedInPayrollRunId,
    includedInMonth: p.includedInMonth,
  };
}

async function fetchAllClaims(): Promise<ApprovedClaim[]> {
  const { data, error } = await supabase
    .from('ih_requests')
    .select('id, staff_id, status, payload, decided_at, created_at')
    .eq('kind', 'Claim');
  if (error) {
    console.error('[claimRepo]', error);
    return [];
  }
  return (data as DbRow[] | null)?.map(mapRow) ?? [];
}

export const claimRepo = {
  async list(): Promise<ApprovedClaim[]> {
    return fetchAllClaims();
  },

  /**
   * Approved claims not yet included in any finalized payroll and approved
   * before the target month's first day (Doc 3.1 §16-§18).
   */
  async queueableForMonth(targetMonth: string): Promise<ApprovedClaim[]> {
    const cutoff = `${targetMonth}-01`;
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, staff_id, status, payload, decided_at, created_at')
      .eq('kind', 'Claim')
      .eq('status', 'Approved')
      .lt('decided_at', cutoff);
    if (error) {
      console.error('[claimRepo.queueableForMonth]', error);
      return [];
    }
    return (data as DbRow[] | null)?.map(mapRow).filter(
      (c) => c.inclusionState !== 'IncludedInPayroll',
    ) ?? [];
  },

  ofType(type: ClaimType, claims: ApprovedClaim[]): ApprovedClaim[] {
    return claims.filter((c) => c.type === type);
  },

  async markIncluded(ids: string[], runId: string, month: string): Promise<void> {
    if (ids.length === 0) return;
    // Fetch existing payloads so we can merge without losing other keys.
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, payload')
      .in('id', ids);
    if (error) throw error;
    const updates = (data as { id: string; payload: ClaimPayload }[] | null) ?? [];
    await Promise.all(
      updates.map((row) =>
        supabase
          .from('ih_requests')
          .update({
            payload: {
              ...row.payload,
              inclusionState: 'IncludedInPayroll' as ClaimInclusionState,
              includedInPayrollRunId: runId,
              includedInMonth: month,
            },
          })
          .eq('id', row.id),
      ),
    );
  },

  async setStateForRun(runId: string, newState: ClaimInclusionState): Promise<void> {
    // Filter via JSON containment.
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, payload')
      .eq('kind', 'Claim')
      .contains('payload', { includedInPayrollRunId: runId });
    if (error) throw error;
    const rows = (data as { id: string; payload: ClaimPayload }[] | null) ?? [];
    await Promise.all(
      rows.map((row) =>
        supabase
          .from('ih_requests')
          .update({ payload: { ...row.payload, inclusionState: newState } })
          .eq('id', row.id),
      ),
    );
  },

  async addManual(
    input: Omit<ApprovedClaim, 'id' | 'inclusionState' | 'approvedAt'> & { approvedAt?: string },
  ): Promise<ApprovedClaim> {
    const now = input.approvedAt ?? new Date().toISOString();
    const payload: ClaimPayload = {
      type: input.type,
      amount: input.amount,
      description: input.description,
      inclusionState: 'QueuedForPayroll',
    };
    const { data, error } = await supabase
      .from('ih_requests')
      .insert({
        staff_id: input.staffId,
        kind: 'Claim',
        status: 'Approved',
        decided_at: now,
        payload,
      })
      .select('id, staff_id, status, payload, decided_at, created_at')
      .single();
    if (error) throw error;
    return mapRow(data as DbRow);
  },
};
