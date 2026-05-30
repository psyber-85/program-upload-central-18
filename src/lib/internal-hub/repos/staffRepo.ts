import type { StaffProfile } from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';
import { SEED_STAFF } from '../seed';

const KEY = 'staff';

function ensureSeed(): StaffProfile[] {
  const existing = readJSON<StaffProfile[] | null>(KEY, null);
  if (existing && existing.length) return existing;
  writeJSON(KEY, SEED_STAFF);
  return SEED_STAFF;
}

export const staffRepo = {
  list(): StaffProfile[] {
    return ensureSeed();
  },
  get(id: string): StaffProfile | undefined {
    return ensureSeed().find((s) => s.id === id);
  },
  getByEmail(email: string): StaffProfile | undefined {
    return ensureSeed().find((s) => s.email.toLowerCase() === email.toLowerCase());
  },
  create(input: Omit<StaffProfile, 'id' | 'status' | 'createdAt' | 'updatedAt'>): StaffProfile {
    const all = ensureSeed();
    const now = nowISO();
    const next: StaffProfile = {
      ...input,
      id: uid('stf'),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    writeJSON(KEY, [...all, next]);
    return next;
  },
  update(id: string, patch: Partial<StaffProfile>): StaffProfile | undefined {
    const all = ensureSeed();
    let updated: StaffProfile | undefined;
    const next = all.map((s) => {
      if (s.id !== id) return s;
      updated = { ...s, ...patch, id: s.id, updatedAt: nowISO() };
      return updated;
    });
    writeJSON(KEY, next);
    return updated;
  },
  deactivate(id: string) {
    return this.update(id, { status: 'Inactive' });
  },
  reactivate(id: string) {
    return this.update(id, { status: 'Active' });
  },
  // Hard delete only allowed by callers that verified zero activity (Doc 0.1 §26).
  hardDelete(id: string) {
    const next = ensureSeed().filter((s) => s.id !== id);
    writeJSON(KEY, next);
  },
};
