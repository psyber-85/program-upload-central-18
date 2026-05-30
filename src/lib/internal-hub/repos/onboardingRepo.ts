import type { ChecklistStatus, OnboardingChecklist } from '../types';
import { nowISO, readJSON, writeJSON } from '../storage';
import { buildDefaultOnboarding } from '../lifecycle';

const KEY = 'onboarding';

type Store = Record<string, OnboardingChecklist>;

function load(): Store {
  return readJSON<Store>(KEY, {});
}
function save(s: Store) {
  writeJSON(KEY, s);
}

export const onboardingRepo = {
  get(staffId: string): OnboardingChecklist {
    const store = load();
    if (!store[staffId]) {
      store[staffId] = buildDefaultOnboarding(staffId);
      save(store);
    }
    return store[staffId];
  },
  init(staffId: string) {
    const store = load();
    store[staffId] = buildDefaultOnboarding(staffId);
    save(store);
    return store[staffId];
  },
  setItemStatus(staffId: string, key: string, status: ChecklistStatus, verifiedBy?: string) {
    const store = load();
    const c = store[staffId] ?? buildDefaultOnboarding(staffId);
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
  setItemLink(staffId: string, key: string, link: string | null) {
    const store = load();
    const c = store[staffId] ?? buildDefaultOnboarding(staffId);
    c.items = c.items.map((i) =>
      i.key === key ? { ...i, link: link ?? undefined } : i,
    );
    store[staffId] = c;
    save(store);
    return c;
  },
  hasAny(staffId: string) {
    return !!load()[staffId];
  },
  remove(staffId: string) {
    const s = load();
    delete s[staffId];
    save(s);
  },
};
