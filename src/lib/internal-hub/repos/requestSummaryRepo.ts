// Doc 1.1 §12 — preview-only. Workflows owned by Card 2.
// Sub-batch 2C: backed by Supabase `ih_requests`. RLS scopes self vs admin reads.
import { supabase } from '@/integrations/supabase/client';
import type { RequestSummary, RequestStatus } from '../types';

type DbKind = 'Leave' | 'MC' | 'Claim' | 'Training' | 'Benefit';
type DbStatus = 'Submitted' | 'Approved' | 'Rejected' | 'NeedsCorrection' | 'Cancelled';

interface DbRow {
  id: string;
  staff_id: string;
  kind: DbKind;
  status: DbStatus;
  created_at: string;
}

function mapKind(k: DbKind): RequestSummary['type'] {
  if (k === 'Training') return 'TrainingFund';
  if (k === 'Benefit') return 'Insurance';
  return k; // Leave | MC | Claim
}

function mapStatus(s: DbStatus): RequestStatus {
  if (s === 'Approved') return 'Approved';
  if (s === 'Rejected' || s === 'Cancelled') return 'Rejected';
  // Submitted, NeedsCorrection → Pending in UI
  return 'Pending';
}

function mapRow(r: DbRow): RequestSummary {
  return {
    id: r.id,
    staffId: r.staff_id,
    type: mapKind(r.kind),
    status: mapStatus(r.status),
    date: r.created_at,
  };
}

export const requestSummaryRepo = {
  async listForStaff(staffId: string, limit?: number): Promise<RequestSummary[]> {
    let q = supabase
      .from('ih_requests')
      .select('id, staff_id, kind, status, created_at')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });
    if (typeof limit === 'number') q = q.limit(limit);
    const { data, error } = await q;
    if (error) {
      console.error('[requestSummaryRepo.listForStaff]', error);
      return [];
    }
    return (data as DbRow[] | null)?.map(mapRow) ?? [];
  },

  async pendingCountForStaff(staffId: string): Promise<number> {
    const { count, error } = await supabase
      .from('ih_requests')
      .select('id', { count: 'exact', head: true })
      .eq('staff_id', staffId)
      .eq('status', 'Submitted');
    if (error) {
      console.error('[requestSummaryRepo.pendingCountForStaff]', error);
      return 0;
    }
    return count ?? 0;
  },

  async pendingApprovalCount(): Promise<number> {
    // Admin-only meaningful — RLS returns 0 for non-admins.
    const { count, error } = await supabase
      .from('ih_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Submitted');
    if (error) {
      console.error('[requestSummaryRepo.pendingApprovalCount]', error);
      return 0;
    }
    return count ?? 0;
  },
};
