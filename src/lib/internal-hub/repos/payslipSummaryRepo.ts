// Doc 1.1 §14 — preview-only. Engine owned by Card 3.
import type { PayslipSummary } from '../types';
import { readJSON, writeJSON } from '../storage';

const KEY = 'payslip-summaries';

export const payslipSummaryRepo = {
  listForStaff(staffId: string, limit?: number): PayslipSummary[] {
    const all = readJSON<PayslipSummary[]>(KEY, []);
    const filtered = all
      .filter((p) => p.staffId === staffId)
      .sort((a, b) => (a.month < b.month ? 1 : -1));
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
  },
  latestStatusFor(staffId: string): 'Ready' | 'Not Available' {
    const latest = this.listForStaff(staffId, 1)[0];
    return latest?.status === 'Ready' ? 'Ready' : 'Not Available';
  },
  _seed(data: PayslipSummary[]) {
    writeJSON(KEY, data);
  },
};
