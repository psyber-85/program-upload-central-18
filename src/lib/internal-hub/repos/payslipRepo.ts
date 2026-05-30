// Doc 3.2 — Payslips. Source-of-truth: finalized payroll.
import type {
  HubRole,
  Payslip,
  PayslipDownloadLogEntry,
  PayrollRun,
} from '../types';
import { CONFIDENTIAL_PAYSLIP_LABEL } from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';

const KEY = 'payslips';
const KEY_DOWNLOAD_LOG = 'payslip-download-log';

const load = (): Payslip[] => readJSON<Payslip[]>(KEY, []);
const save = (p: Payslip[]) => writeJSON(KEY, p);

export const payslipRepo = {
  list(): Payslip[] {
    return load();
  },
  listAll(): Payslip[] {
    return load().sort((a, b) => (a.month < b.month ? 1 : -1));
  },
  listForStaff(staffId: string, limit?: number): Payslip[] {
    const filtered = load()
      .filter((p) => p.staffId === staffId)
      .sort((a, b) => (a.month < b.month ? 1 : -1));
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
  },
  getById(id: string): Payslip | undefined {
    return load().find((p) => p.id === id);
  },
  forRun(runId: string): Payslip[] {
    return load().filter((p) => p.payrollRunId === runId);
  },

  /** Doc 3.2 §5/§8 — one payslip per included staff after finalization. */
  generateForRun(run: PayrollRun): Payslip[] {
    if (run.status !== 'Finalized' && run.status !== 'Locked') return [];
    const existing = this.forRun(run.id);
    if (existing.length > 0) return existing;
    const now = run.finalizedAt ?? nowISO();
    const payslips: Payslip[] = run.items
      .filter((i) => i.rowStatus === 'Complete')
      .map((i) => {
        const id = uid('pslp');
        return {
          id,
          payrollRunId: run.id,
          staffId: i.staffId,
          staffName: i.staffName,
          month: run.month,
          baseSalary: i.baseSalary,
          epf: i.epfAmount,
          socso: i.socsoAmount,
          claimsTotal: i.claimsTotal,
          trainingClaimsTotal: i.trainingClaimsTotal,
          adjustment: i.adjustment,
          netPay: i.netPay,
          finalizedAt: now,
          availability: 'Available',
          pdfRef: `payslip://${id}.pdf`, // placeholder — real storage is Card 4
        };
      });
    save([...load(), ...payslips]);
    return payslips;
  },

  /** Doc 3.2 §19/§20 — generate a downloadable file + log the download intent. */
  downloadPdf(id: string, actorId: string, actorRole: HubRole): void {
    const ps = this.getById(id);
    if (!ps) throw new Error('Payslip not found.');
    if (ps.availability !== 'Available' && ps.availability !== 'Generated') {
      throw new Error('Payslip not available.');
    }
    this._logDownload(id, actorId, actorRole);
    if (typeof window === 'undefined') return;

    // Day-1 placeholder "PDF" = plaintext file matching portal view (Doc 3.2 §7).
    const lines = [
      `AIHQ — Payslip`,
      `${CONFIDENTIAL_PAYSLIP_LABEL}`,
      ``,
      `Staff:            ${ps.staffName}`,
      `Payroll Month:    ${ps.month}`,
      `Finalized:        ${new Date(ps.finalizedAt).toLocaleDateString()}`,
      ``,
      `Base Salary:      ${ps.baseSalary.toFixed(2)}`,
      `EPF:             -${ps.epf.toFixed(2)}`,
      `SOCSO:           -${ps.socso.toFixed(2)}`,
      `Claims:           ${ps.claimsTotal.toFixed(2)}`,
      `Training Claims:  ${ps.trainingClaimsTotal.toFixed(2)}`,
      `Manual Adj.:      ${(ps.adjustment?.amount ?? 0).toFixed(2)}${ps.adjustment ? `  (${ps.adjustment.reason})` : ''}`,
      `------------------------------------`,
      `Net Pay:          ${ps.netPay.toFixed(2)}`,
      ``,
      ps.correctionRef ? `Correction reference: ${ps.correctionRef}` : '',
      ``,
      `Internal document — placeholder format. Real PDF rendering is owned by Card 4.`,
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${ps.month}-${ps.staffName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  /** Doc 3.2 §18 — correction reference attached to historical payslip. */
  setCorrectionRef(id: string, ref: string) {
    save(load().map((p) => (p.id === id ? { ...p, correctionRef: ref } : p)));
  },

  _logDownload(payslipId: string, actorId: string, actorRole: HubRole) {
    const log = readJSON<PayslipDownloadLogEntry[]>(KEY_DOWNLOAD_LOG, []);
    const entry: PayslipDownloadLogEntry = {
      id: uid('pdl'),
      payslipId,
      actorId,
      actorRole,
      downloadedAt: nowISO(),
    };
    writeJSON(KEY_DOWNLOAD_LOG, [entry, ...log]);
  },
  downloadLog(): PayslipDownloadLogEntry[] {
    return readJSON<PayslipDownloadLogEntry[]>(KEY_DOWNLOAD_LOG, []);
  },
};
