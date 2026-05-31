// Doc 3.1 §16-§20 — claims that feed payroll.
// Backed by `ih_requests` where kind='Claim'. Payload jsonb holds the claim-
// specific shape since the spec folds claims into the unified requests table.
/* eslint-disable @typescript-eslint/no-explicit-any */
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

function mapRow(r: any): ApprovedClaim {
  const p: ClaimPayload = (r.payload as ClaimPayload) ?? ({} as ClaimPayload);
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

export const claimRepo = {
  async list(): Promise<ApprovedClaim[]> {
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, staff_id, status, payload, decided_at, created_at')
      .eq('kind', 'Claim');
    if (error) {
      console.error('[claimRepo.list]', error);
      return [];
    }
    return (data ?? []).map(mapRow);
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
    return (data ?? [])
      .map(mapRow)
      .filter((c) => c.inclusionState !== 'IncludedInPayroll');
  },

  ofType(type: ClaimType, claims: ApprovedClaim[]): ApprovedClaim[] {
    return claims.filter((c) => c.type === type);
  },

  async markIncluded(ids: string[], runId: string, month: string): Promise<void> {
    if (ids.length === 0) return;
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, payload')
      .in('id', ids);
    if (error) throw error;
    await Promise.all(
      (data ?? []).map((row: any) =>
        supabase
          .from('ih_requests')
          .update({
            payload: {
              ...((row.payload as ClaimPayload) ?? {}),
              inclusionState: 'IncludedInPayroll' as ClaimInclusionState,
              includedInPayrollRunId: runId,
              includedInMonth: month,
            },
          } as any)
          .eq('id', row.id),
      ),
    );
  },

  async setStateForRun(runId: string, newState: ClaimInclusionState): Promise<void> {
    const { data, error } = await supabase
      .from('ih_requests')
      .select('id, payload')
      .eq('kind', 'Claim')
      .contains('payload', { includedInPayrollRunId: runId } as any);
    if (error) throw error;
    await Promise.all(
      (data ?? []).map((row: any) =>
        supabase
          .from('ih_requests')
          .update({
            payload: { ...((row.payload as ClaimPayload) ?? {}), inclusionState: newState },
          } as any)
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
    const { data, error } = await (supabase
      .from('ih_requests')
      .insert({
        staff_id: input.staffId,
        kind: 'Claim',
        status: 'Approved',
        decided_at: now,
        payload,
      } as any)
      .select('id, staff_id, status, payload, decided_at, created_at')
      .single() as any);
    if (error) throw error;
    return mapRow(data);
  },
};
