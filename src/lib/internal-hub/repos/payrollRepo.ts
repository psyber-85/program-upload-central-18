// Doc 3.1 — Payroll Preparation & Finalization.
// Frontend-first localStorage. Real persistence is Card 4.
import type {
  ManualAdjustment,
  PayrollItem,
  PayrollMissingField,
  PayrollRun,
  PayrollRunStatus,
  StaffProfile,
} from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';
import { staffRepo } from './staffRepo';
import { claimRepo } from './claimRepo';

const KEY = 'payroll-runs';
const KEY_REMINDER_LOG = 'payroll-reminder-log';

function loadRuns(): PayrollRun[] {
  return readJSON<PayrollRun[]>(KEY, []);
}
const saveRuns = (rs: PayrollRun[]) => writeJSON(KEY, rs);

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

function buildItem(s: StaffProfile, month: string): PayrollItem {
  const missing = missingFor(s);
  const base = Number(s.baseSalary) || 0;
  const epf = round2(base * (Number(s.epfRate) || 0) / 100);
  const socso = round2(base * (Number(s.socsoRate) || 0) / 100);

  // Pull queueable claims for this target month (Doc 3.1 §16-§17).
  const queueable = claimRepo.queueableForMonth(month).filter((c) => c.staffId === s.id);
  const claims = queueable.filter((c) => c.type === 'Claim');
  const training = queueable.filter((c) => c.type === 'TrainingClaim');
  const claimsTotal = round2(claims.reduce((sum, c) => sum + c.amount, 0));
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
    includedClaimIds: claims.map((c) => c.id),
    includedTrainingClaimIds: training.map((c) => c.id),
  };
  item.netPay = computeNetPay(item);
  return item;
}

export const payrollRepo = {
  listRuns(): PayrollRun[] {
    return loadRuns().sort((a, b) => (a.month < b.month ? 1 : -1));
  },
  getRun(id: string): PayrollRun | undefined {
    return loadRuns().find((r) => r.id === id);
  },
  getForMonth(month: string): PayrollRun | undefined {
    return loadRuns().find((r) => r.month === month);
  },
  statusFor(month: string): PayrollRunStatus {
    return this.getForMonth(month)?.status ?? 'NotPrepared';
  },

  /** Doc 3.1 §9-§10 — include Active staff; missing fields flagged not silenced. */
  getOrCreateDraft(month: string): PayrollRun {
    const existing = this.getForMonth(month);
    if (existing) return existing;
    const active = staffRepo.listCached().filter((s) => s.status === 'Active');
    const run: PayrollRun = {
      id: uid('pr'),
      month,
      status: 'Draft',
      items: active.map((s) => buildItem(s, month)),
      createdAt: nowISO(),
      preparedAt: nowISO(),
    };
    saveRuns([...loadRuns(), run]);
    return run;
  },

  /** Re-pull row data from current staff profile (used when admin fixes a profile). */
  refreshRow(runId: string, staffId: string): PayrollRun | undefined {
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.status === 'Finalized' || run.status === 'Locked') return run;
    const s = staffRepo.getCached(staffId);
    if (!s) return run;
    const fresh = buildItem(s, run.month);
    // Preserve any existing manual adjustment + notes.
    const old = run.items.find((i) => i.staffId === staffId);
    if (old) {
      fresh.adjustment = old.adjustment;
      fresh.notes = old.notes;
      fresh.netPay = computeNetPay(fresh);
    }
    const nextItems = run.items.map((i) => (i.staffId === staffId ? fresh : i));
    const next = { ...run, items: nextItems };
    saveRuns(runs.map((r) => (r.id === runId ? next : r)));
    return next;
  },

  setAdjustment(runId: string, staffId: string, adjustment: ManualAdjustment | null): PayrollRun | undefined {
    if (adjustment && !adjustment.reason.trim()) {
      throw new Error('Manual adjustment requires a reason (Doc 3.1 §21).');
    }
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.status === 'Finalized' || run.status === 'Locked') {
      throw new Error('Payroll is finalized and locked.');
    }
    const items = run.items.map((i) => {
      if (i.staffId !== staffId) return i;
      const updated: PayrollItem = { ...i, adjustment };
      updated.netPay = computeNetPay(updated);
      return updated;
    });
    const next = { ...run, items };
    saveRuns(runs.map((r) => (r.id === runId ? next : r)));
    return next;
  },

  setRunNotes(runId: string, notes: string): PayrollRun | undefined {
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.status === 'Finalized' || run.status === 'Locked') return run;
    const next = { ...run, adminNotes: notes };
    saveRuns(runs.map((r) => (r.id === runId ? next : r)));
    return next;
  },

  setRowNotes(runId: string, staffId: string, notes: string): PayrollRun | undefined {
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.status === 'Finalized' || run.status === 'Locked') return run;
    const items = run.items.map((i) => (i.staffId === staffId ? { ...i, notes } : i));
    const next = { ...run, items };
    saveRuns(runs.map((r) => (r.id === runId ? next : r)));
    return next;
  },

  markReadyForReview(runId: string): PayrollRun | undefined {
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.status === 'Finalized' || run.status === 'Locked') return run;
    const next = { ...run, status: 'ReadyForReview' as PayrollRunStatus };
    saveRuns(runs.map((r) => (r.id === runId ? next : r)));
    return next;
  },

  /** Doc 3.1 §11 — blocked when any included row Incomplete. */
  canFinalize(runId: string): { ok: boolean; reason?: string } {
    const run = this.getRun(runId);
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

  /** Doc 3.1 §23 — finalize: generate payslips + notices. Status enters Finalized (grace window). */
  finalize(runId: string, adminId: string): PayrollRun {
    const check = this.canFinalize(runId);
    if (!check.ok) throw new Error(check.reason ?? 'Cannot finalize.');
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId)!;
    const now = nowISO();
    const finalized: PayrollRun = {
      ...run,
      status: 'Finalized',
      finalizedAt: now,
      finalizedBy: adminId,
    };
    saveRuns(runs.map((r) => (r.id === runId ? finalized : r)));

    // Mark included claims (Doc 3.1 §19).
    const allClaimIds = finalized.items.flatMap((i) => [
      ...i.includedClaimIds,
      ...i.includedTrainingClaimIds,
    ]);
    if (allClaimIds.length > 0) {
      claimRepo.markIncluded(allClaimIds, finalized.id, finalized.month);
    }

    // Generate payslips (Doc 3.2 §5) — lazy import to avoid circulars.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { payslipRepo } = require('./payslipRepo') as typeof import('./payslipRepo');
    const payslips = payslipRepo.generateForRun(finalized);

    // Payslip-ready notices per staff (Doc 3.2 §16) — emailRequired, link to portal.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { noticeRepo } = require('./noticeRepo') as typeof import('./noticeRepo');
    payslips.forEach((ps) => {
      noticeRepo.broadcast({
        title: `Payslip ready — ${ps.month}`,
        message:
          'Your payslip for this month is ready. Open the portal to view or download.',
        type: 'PayrollNotice',
        importance: 'Important',
        audience: { kind: 'Individual', staffId: ps.staffId },
        links: [{ label: 'View payslip', url: `/staff/payslips/${ps.id}` }],
        createdBy: adminId,
      });
    });

    return finalized;
  },

  /** Doc 3.1 §24 — explicit terminal lock after Finalized grace window. */
  lockRun(runId: string, _adminId: string): PayrollRun {
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) throw new Error('Run not found.');
    if (run.status === 'Locked') return run;
    if (run.status !== 'Finalized') {
      throw new Error('Only a finalized run can be locked.');
    }
    const locked: PayrollRun = { ...run, status: 'Locked', lockedAt: nowISO() };
    saveRuns(runs.map((r) => (r.id === runId ? locked : r)));
    return locked;
  },

  // ---- Reminder (Doc 3.1 §7) ----
  /**
   * Idempotent admin reminder on day-of-month >= 25 if payroll not yet prepared.
   * Runs in-browser when an admin opens the hub.
   */
  async ensureReminderForMonth(month: string, adminId: string) {
    const today = new Date();
    if (today.getUTCDate() < 25) return;
    if (this.statusFor(month) !== 'NotPrepared' && this.statusFor(month) !== 'Draft') return;
    const log = readJSON<string[]>(KEY_REMINDER_LOG, []);
    if (log.includes(month)) return;
    const { noticeRepo } = await import('./noticeRepo');
    noticeRepo.broadcast({
      title: `Payroll reminder — prepare ${month}`,
      message:
        'Monthly payroll preparation is due. Review staff rows, resolve incomplete data, and finalize before payday.',
      type: 'PayrollNotice',
      importance: 'Important',
      audience: { kind: 'Admin' },
      links: [{ label: 'Open payroll', url: '/staff/admin/payroll' }],
      createdBy: adminId,
    });
    writeJSON(KEY_REMINDER_LOG, [...log, month]);
  },

  _seed(runs: PayrollRun[]) {
    saveRuns(runs);
  },
};
