// Doc 3.3 — Admin-only Monthly Finance Snapshot.
import type {
  FinanceLineCategory,
  FinanceLineItem,
  FinanceSnapshot,
  FinanceSnapshotStatus,
} from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';
import { payrollRepo } from './payrollRepo';

const KEY = 'finance-snapshots';
const KEY_ITEMS = 'finance-line-items';

const loadSnaps = (): FinanceSnapshot[] => readJSON<FinanceSnapshot[]>(KEY, []);
const saveSnaps = (s: FinanceSnapshot[]) => writeJSON(KEY, s);
const loadItems = (): FinanceLineItem[] => readJSON<FinanceLineItem[]>(KEY_ITEMS, []);
const saveItems = (i: FinanceLineItem[]) => writeJSON(KEY_ITEMS, i);

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Auto-fill payroll-linked totals from finalized payroll (Doc 3.3 §12-§16).
 * TODO(Sub-batch 2E): now that payrollRepo is async, re-derive these totals
 * via a Supabase aggregate after the finance snapshot repo itself migrates.
 * Until then we return zeros so the admin can fill the snapshot manually.
 */
function payrollTotalsFor(_month: string) {
  return {
    payrollTotal: 0,
    claimsTotal: 0,
    trainingClaimsTotal: 0,
    epfSocsoTotal: 0,
    manualAdjustmentTotal: 0,
  };
}

export const financeSnapshotRepo = {
  listSnapshots(): FinanceSnapshot[] {
    return loadSnaps().sort((a, b) => (a.month < b.month ? 1 : -1));
  },
  getById(id: string): FinanceSnapshot | undefined {
    return loadSnaps().find((s) => s.id === id);
  },
  getForMonth(month: string): FinanceSnapshot | undefined {
    return loadSnaps().find((s) => s.month === month);
  },
  statusFor(month: string): FinanceSnapshotStatus | 'NotStarted' {
    return this.getForMonth(month)?.status ?? 'NotStarted';
  },

  getOrCreateForMonth(month: string): FinanceSnapshot {
    const existing = this.getForMonth(month);
    if (existing) {
      // Refresh auto-fill if still editable.
      if (existing.status === 'Draft') {
        const totals = payrollTotalsFor(month);
        const next = { ...existing, ...totals, updatedAt: nowISO() };
        saveSnaps(loadSnaps().map((s) => (s.id === existing.id ? next : s)));
        return next;
      }
      return existing;
    }
    const totals = payrollTotalsFor(month);
    const now = nowISO();
    const snap: FinanceSnapshot = {
      id: uid('fs'),
      month,
      status: 'Draft',
      ...totals,
      createdAt: now,
      updatedAt: now,
    };
    saveSnaps([...loadSnaps(), snap]);
    return snap;
  },

  setOpeningBalance(id: string, value: number | undefined): FinanceSnapshot | undefined {
    return this._patch(id, { openingBalance: value });
  },
  setClosingBalance(id: string, value: number | undefined): FinanceSnapshot | undefined {
    return this._patch(id, { closingBalance: value });
  },
  setNotes(id: string, notes: string): FinanceSnapshot | undefined {
    return this._patch(id, { notes });
  },

  // ---- Line items ----
  lineItemsFor(snapshotId: string): FinanceLineItem[] {
    return loadItems()
      .filter((i) => i.snapshotId === snapshotId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  addLineItem(
    snapshotId: string,
    input: { category: FinanceLineCategory; amount: number; note: string; link?: string; createdBy: string },
  ): FinanceLineItem {
    const snap = this.getById(snapshotId);
    if (!snap) throw new Error('Snapshot not found.');
    if (snap.status !== 'Draft') {
      throw new Error('Snapshot is locked — use Add Correction instead (Doc 3.3 §21).');
    }
    return this._appendItem(snapshotId, { ...input, isCorrection: false });
  },
  /** Doc 3.3 §21 — correction is always allowed, including after lock. */
  addCorrectionLineItem(
    snapshotId: string,
    input: { category: FinanceLineCategory; amount: number; note: string; link?: string; createdBy: string },
  ): FinanceLineItem {
    const snap = this.getById(snapshotId);
    if (!snap) throw new Error('Snapshot not found.');
    return this._appendItem(snapshotId, { ...input, isCorrection: true });
  },
  removeLineItem(itemId: string) {
    const items = loadItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const snap = this.getById(item.snapshotId);
    if (!snap) return;
    if (snap.status !== 'Draft') return; // never remove after lock
    saveItems(items.filter((i) => i.id !== itemId));
    this._touch(snap.id);
  },

  /** Doc 3.3 §19-§20 — Mark Month Reviewed (never "Finalize Accounts"). */
  markReviewed(id: string, adminId: string): FinanceSnapshot | undefined {
    return this._patch(id, {
      status: 'Reviewed',
      reviewedAt: nowISO(),
      reviewedBy: adminId,
    });
  },

  /** Optional terminal lock after Reviewed grace window (mirrors payroll lockRun). */
  lockSnapshot(id: string): FinanceSnapshot | undefined {
    const snap = this.getById(id);
    if (!snap) return;
    if (snap.status === 'Locked') return snap;
    if (snap.status !== 'Reviewed') {
      throw new Error('Only a reviewed snapshot can be locked.');
    }
    return this._patch(id, { status: 'Locked' });
  },

  _appendItem(snapshotId: string, input: Omit<FinanceLineItem, 'id' | 'snapshotId' | 'createdAt'>): FinanceLineItem {
    const next: FinanceLineItem = {
      id: uid('fli'),
      snapshotId,
      createdAt: nowISO(),
      ...input,
    };
    saveItems([next, ...loadItems()]);
    this._touch(snapshotId);
    return next;
  },
  _patch(id: string, patch: Partial<FinanceSnapshot>): FinanceSnapshot | undefined {
    const all = loadSnaps();
    let updated: FinanceSnapshot | undefined;
    const next = all.map((s) => {
      if (s.id !== id) return s;
      updated = { ...s, ...patch, updatedAt: nowISO() };
      return updated;
    });
    saveSnaps(next);
    return updated;
  },
  _touch(id: string) {
    const all = loadSnaps();
    saveSnaps(all.map((s) => (s.id === id ? { ...s, updatedAt: nowISO() } : s)));
  },
};
