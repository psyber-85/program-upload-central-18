// Patch 1.6 — Supabase-backed tool access (was localStorage).
//
// Maintains a sync read API for legacy call sites by hydrating an in-memory
// cache from `ih_tool_access`. Components should call `ensureLoaded(staffId)`
// (or `ensureLoadedAll()` for admin views) once before relying on the sync
// getters; writes go through to Supabase and update the cache in-place.
//
// RLS: ih_tool_access — admin manage, staff self-read.
// Doc 0.2 §13 — never store passwords/credentials, only state.
import { supabase } from '@/integrations/supabase/client';
import type { ToolAccessItem, ToolAccessStatus, ToolKey } from '../types';
import { TOOL_LABELS } from '../types';
import { buildDefaultToolChecklist } from '../lifecycle';
import { logAudit } from '../audit';

type DbRow = {
  id: string;
  staff_id: string;
  tool: string;
  status: ToolAccessStatus;
  granted_at: string | null;
};

const _cache: Map<string, ToolAccessItem[]> = new Map();
const _loaded: Set<string> = new Set();
let _allLoaded = false;

function mergeWithDefaults(staffId: string, rows: DbRow[]): ToolAccessItem[] {
  const defaults = buildDefaultToolChecklist(staffId);
  const byTool = new Map<string, DbRow>();
  for (const r of rows) byTool.set(r.tool, r);
  return defaults.map((d) => {
    const r = byTool.get(d.tool);
    if (!r) return d;
    return {
      ...d,
      label: TOOL_LABELS[d.tool] ?? d.label,
      status: r.status,
    };
  });
}

async function fetchFor(staffId: string): Promise<ToolAccessItem[]> {
  const { data, error } = await supabase
    .from('ih_tool_access')
    .select('*')
    .eq('staff_id', staffId);
  if (error) {
    console.error('[toolAccessRepo] fetchFor', error);
    return buildDefaultToolChecklist(staffId);
  }
  const merged = mergeWithDefaults(staffId, (data ?? []) as DbRow[]);
  _cache.set(staffId, merged);
  _loaded.add(staffId);
  return merged;
}

async function upsertItem(staffId: string, tool: ToolKey, status: ToolAccessStatus) {
  const granted_at = status === 'Granted' ? new Date().toISOString() : null;
  // Try update first (no unique constraint on (staff_id,tool) is guaranteed);
  // delete-then-insert keeps things simple and idempotent.
  await supabase.from('ih_tool_access').delete().eq('staff_id', staffId).eq('tool', tool);
  const { error } = await supabase
    .from('ih_tool_access')
    .insert({ staff_id: staffId, tool, status, granted_at } as any);
  if (error) throw error;
}

export const toolAccessRepo = {
  /** Async hydrate for a single staff (idempotent). */
  async ensureLoaded(staffId: string): Promise<ToolAccessItem[]> {
    if (_loaded.has(staffId)) return _cache.get(staffId)!;
    return fetchFor(staffId);
  },

  /** Async hydrate for all staff — used by admin workbench. */
  async ensureLoadedAll(): Promise<void> {
    if (_allLoaded) return;
    const { data, error } = await supabase.from('ih_tool_access').select('*');
    if (error) return;
    const byStaff = new Map<string, DbRow[]>();
    for (const r of (data ?? []) as DbRow[]) {
      const arr = byStaff.get(r.staff_id) ?? [];
      arr.push(r);
      byStaff.set(r.staff_id, arr);
    }
    for (const [staffId, rows] of byStaff) {
      _cache.set(staffId, mergeWithDefaults(staffId, rows));
      _loaded.add(staffId);
    }
    _allLoaded = true;
  },

  /** Sync getter — returns cached value or a default checklist seed. */
  get(staffId: string): ToolAccessItem[] {
    const cached = _cache.get(staffId);
    if (cached) return cached;
    const seed = buildDefaultToolChecklist(staffId);
    _cache.set(staffId, seed);
    // Fire-and-forget hydrate from DB; consumers using `tick` patterns will
    // pick up the refreshed value on next render they trigger.
    void fetchFor(staffId);
    return seed;
  },

  /** Seed the cache locally; persists status rows on next setStatus/updateItem. */
  init(staffId: string): ToolAccessItem[] {
    const seed = buildDefaultToolChecklist(staffId);
    _cache.set(staffId, seed);
    _loaded.add(staffId);
    return seed;
  },

  updateItem(staffId: string, tool: ToolKey, patch: Partial<Omit<ToolAccessItem, 'staffId' | 'tool'>>) {
    const list = _cache.get(staffId) ?? buildDefaultToolChecklist(staffId);
    const next = list.map((i) => (i.tool === tool ? { ...i, ...patch } : i));
    _cache.set(staffId, next);
    if (patch.status !== undefined) {
      void upsertItem(staffId, tool, patch.status).catch((e) =>
        console.error('[toolAccessRepo] persist failed', e),
      );
      void logAudit({
        action: 'staff.tool_access_changed',
        targetTable: 'ih_tool_access',
        targetId: staffId,
        summary: `Tool access ${tool} → ${patch.status}`,
        metadata: { tool, status: patch.status },
      });
    }
    return next;
  },

  setStatus(staffId: string, tool: ToolKey, status: ToolAccessStatus) {
    return this.updateItem(staffId, tool, { status });
  },

  hasAny(staffId: string) {
    return _cache.has(staffId);
  },

  remove(staffId: string) {
    _cache.delete(staffId);
    _loaded.delete(staffId);
    void supabase.from('ih_tool_access').delete().eq('staff_id', staffId);
  },
};
