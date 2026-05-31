// Doc 4.2 §11 — Welcome email status tracker.
// Real send is dispatched via ih-send-email; localStorage still records UI status
// for admin "resent at" indicators (history of admin actions, not delivery truth).
// Delivery truth lives in ih_email_log.
import type { WelcomeEmailEvent, WelcomeEmailStatus } from '../types';
import { nowISO, readJSON, writeJSON } from '../storage';
import { supabase } from '@/integrations/supabase/client';
import { welcomeEmail } from '../email/dispatcher';

const KEY = 'welcome-email';
type Store = Record<string, WelcomeEmailEvent>;

function load(): Store {
  return readJSON<Store>(KEY, {});
}
function save(s: Store) {
  writeJSON(KEY, s);
}

async function dispatchWelcome(staffId: string, opts: { force?: boolean } = {}) {
  try {
    const { data: row, error } = await supabase
      .from('ih_staff_profiles')
      .select('id, email, name, join_date')
      .eq('id', staffId)
      .maybeSingle();
    if (error || !row?.email) {
      const store = load();
      store[staffId] = { ...(store[staffId] ?? { staffId, queuedAt: nowISO() }), status: 'failed' };
      save(store);
      return;
    }
    const result = await welcomeEmail({
      id: row.id,
      email: row.email as string,
      fullName: (row.name as string) ?? '',
      joinDate: row.join_date as string | undefined,
    });
    const store = load();
    const next: WelcomeEmailStatus =
      result.status === 'sent' ? (opts.force ? 'resent' : 'sent') : 'failed';
    store[staffId] = {
      ...(store[staffId] ?? { staffId, queuedAt: nowISO() }),
      status: next,
      sentAt: next === 'sent' || next === 'resent' ? nowISO() : store[staffId]?.sentAt,
    };
    save(store);
  } catch (e) {
    console.error('[welcomeEmailRepo.dispatch]', e);
    const store = load();
    store[staffId] = { ...(store[staffId] ?? { staffId, queuedAt: nowISO() }), status: 'failed' };
    save(store);
  }
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
    void dispatchWelcome(staffId);
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
    const store = load();
    store[staffId] = { ...(store[staffId] ?? { staffId, status: 'queued', queuedAt: nowISO() }), status: 'queued' };
    save(store);
    void dispatchWelcome(staffId, { force: true });
    return store[staffId];
  },
};
