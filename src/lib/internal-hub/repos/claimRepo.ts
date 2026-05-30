// Doc 3.1 §16-§20 — claims that feed payroll. Card 2 owns approval workflow;
// here we just consume Approved state and track payroll inclusion.
import type { ApprovedClaim, ClaimInclusionState, ClaimType } from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';

const KEY = 'approved-claims';

function ensureSeed(): ApprovedClaim[] {
  const existing = readJSON<ApprovedClaim[] | null>(KEY, null);
  if (existing) return existing;
  // Default seed — a couple of approved items so payroll preview has inputs.
  const seed: ApprovedClaim[] = [
    {
      id: uid('clm'),
      staffId: 'stf_train01',
      type: 'Claim',
      amount: 120,
      description: 'Client lunch',
      approvedAt: '2026-04-18T00:00:00.000Z',
      inclusionState: 'QueuedForPayroll',
    },
    {
      id: uid('clm'),
      staffId: 'stf_sol01',
      type: 'TrainingClaim',
      amount: 350,
      description: 'AI workshop fee',
      approvedAt: '2026-04-22T00:00:00.000Z',
      inclusionState: 'QueuedForPayroll',
    },
  ];
  writeJSON(KEY, seed);
  return seed;
}

export const claimRepo = {
  list(): ApprovedClaim[] {
    return ensureSeed();
  },
  /**
   * Approved claims that are not yet included in any finalized payroll and
   * whose approvedAt date is on/before the cut-off (Doc 3.1 §16-§18).
   * The "next payroll" rule means: a claim approved in May goes into June.
   */
  queueableForMonth(targetMonth: string): ApprovedClaim[] {
    const cutoff = `${targetMonth}-01`; // first day of target month
    return ensureSeed().filter(
      (c) =>
        c.inclusionState !== 'IncludedInPayroll' &&
        c.approvedAt.slice(0, 10) < cutoff,
    );
  },
  ofType(type: ClaimType, claims: ApprovedClaim[]): ApprovedClaim[] {
    return claims.filter((c) => c.type === type);
  },
  markIncluded(ids: string[], runId: string, month: string) {
    const all = ensureSeed();
    writeJSON(
      KEY,
      all.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              inclusionState: 'IncludedInPayroll' as ClaimInclusionState,
              includedInPayrollRunId: runId,
              includedInMonth: month,
            }
          : c,
      ),
    );
  },
  setStateForRun(runId: string, newState: ClaimInclusionState) {
    const all = ensureSeed();
    writeJSON(
      KEY,
      all.map((c) =>
        c.includedInPayrollRunId === runId ? { ...c, inclusionState: newState } : c,
      ),
    );
  },
  addManual(input: Omit<ApprovedClaim, 'id' | 'inclusionState' | 'approvedAt'> & { approvedAt?: string }): ApprovedClaim {
    const all = ensureSeed();
    const next: ApprovedClaim = {
      ...input,
      id: uid('clm'),
      approvedAt: input.approvedAt ?? nowISO(),
      inclusionState: 'QueuedForPayroll',
    };
    writeJSON(KEY, [...all, next]);
    return next;
  },
};
