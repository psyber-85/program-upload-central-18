import type { WelcomeEmailEvent, WelcomeEmailStatus } from '../types';
import { nowISO, readJSON, writeJSON } from '../storage';

const KEY = 'welcome-email';
type Store = Record<string, WelcomeEmailEvent>;

function load(): Store {
  return readJSON<Store>(KEY, {});
}
function save(s: Store) {
  writeJSON(KEY, s);
}

export const welcomeEmailRepo = {
  get(staffId: string): WelcomeEmailEvent | undefined {
    return load()[staffId];
  },
  queue(staffId: string): WelcomeEmailEvent {
    const store = load();
    const ev: WelcomeEmailEvent = { staffId, status: 'queued', queuedAt: nowISO() };
    store[staffId] = ev;
    save(store);
    // Frontend-first: simulate "sent" shortly after queuing.
    setTimeout(() => {
      const s = load();
      if (s[staffId]?.status === 'queued') {
        s[staffId] = { ...s[staffId], status: 'sent', sentAt: nowISO() };
        save(s);
      }
    }, 600);
    return ev;
  },
  setStatus(staffId: string, status: WelcomeEmailStatus) {
    const store = load();
    const ev = store[staffId] ?? { staffId, status: 'queued', queuedAt: nowISO() };
    store[staffId] = { ...ev, status, sentAt: status === 'sent' || status === 'resent' ? nowISO() : ev.sentAt };
    save(store);
    return store[staffId];
  },
  resend(staffId: string) {
    return this.setStatus(staffId, 'resent');
  },
};
