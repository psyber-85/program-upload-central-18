// Doc 1.1 §14 — Home preview wrapper over Supabase-backed payslipRepo.
import type { PayslipSummary } from '../types';
import { payslipRepo } from './payslipRepo';

export const payslipSummaryRepo = {
  async listForStaff(staffId: string, limit?: number): Promise<PayslipSummary[]> {
    const payslips = await payslipRepo.listForStaff(staffId, limit);
    return payslips.map((p) => ({
      id: p.id,
      staffId: p.staffId,
      month: p.month,
      netPay: p.netPay,
      status: p.availability === 'Available' || p.availability === 'Generated' ? 'Ready' : 'NotAvailable',
      finalizedAt: p.finalizedAt,
    }));
  },
  async latestStatusFor(staffId: string): Promise<'Ready' | 'Not Available'> {
    const latest = (await this.listForStaff(staffId, 1))[0];
    return latest?.status === 'Ready' ? 'Ready' : 'Not Available';
  },
};
