// Doc 1.1 §12 — preview-only. Workflows owned by Card 2.
import type { RequestSummary } from '../types';
import { readJSON, writeJSON } from '../storage';

const KEY = 'request-summaries';

export const requestSummaryRepo = {
  listForStaff(staffId: string, limit?: number): RequestSummary[] {
    const all = readJSON<RequestSummary[]>(KEY, []);
    const filtered = all
      .filter((r) => r.staffId === staffId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
  },
  pendingCountForStaff(staffId: string): number {
    return readJSON<RequestSummary[]>(KEY, []).filter(
      (r) => r.staffId === staffId && r.status === 'Pending',
    ).length;
  },
  pendingApprovalCount(): number {
    return readJSON<RequestSummary[]>(KEY, []).filter((r) => r.status === 'Pending').length;
  },
  _seed(data: RequestSummary[]) {
    writeJSON(KEY, data);
  },
};
