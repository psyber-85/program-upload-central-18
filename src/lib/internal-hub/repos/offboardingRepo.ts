import type { ChecklistStatus, OffboardingChecklist } from '../types';
import { nowISO, readJSON, writeJSON } from '../storage';
import { buildDefaultOffboarding } from '../lifecycle';

const KEY = 'offboarding';
type Store = Record<string, OffboardingChecklist>;

function load(): Store {
  return readJSON<Store>(KEY, {});
}
function save(s: Store) {
  writeJSON(KEY, s);
}

export const offboardingRepo = {
  get(staffId: string): OffboardingChecklist | undefined {
    return load()[staffId];
  },
  start(staffId: string): OffboardingChecklist {
    const store = load();
    if (!store[staffId]) store[staffId] = buildDefaultOffboarding(staffId);
    save(store);
    return store[staffId];
  },
  setItemStatus(staffId: string, key: string, status: ChecklistStatus, verifiedBy?: string) {
    const store = load();
    const c = store[staffId];
    if (!c) return undefined;
    c.items = c.items.map((i) =>
      i.key === key
        ? {
            ...i,
            status,
            completedAt:
              status === 'complete' || status === 'admin-verified'
                ? nowISO()
                : i.completedAt,
            verifiedBy: status === 'admin-verified' ? verifiedBy : i.verifiedBy,
          }
        : i,
    );
    store[staffId] = c;
    save(store);
    return c;
  },
  remove(staffId: string) {
    const s = load();
    delete s[staffId];
    save(s);
  },
};
