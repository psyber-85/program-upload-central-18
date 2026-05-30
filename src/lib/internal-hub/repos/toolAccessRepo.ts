import type { ToolAccessItem, ToolAccessStatus, ToolKey } from '../types';
import { readJSON, writeJSON } from '../storage';
import { buildDefaultToolChecklist } from '../lifecycle';

const KEY = 'tool-access';
type Store = Record<string, ToolAccessItem[]>;

function load(): Store {
  return readJSON<Store>(KEY, {});
}
function save(s: Store) {
  writeJSON(KEY, s);
}

export const toolAccessRepo = {
  get(staffId: string): ToolAccessItem[] {
    const store = load();
    if (!store[staffId]) {
      store[staffId] = buildDefaultToolChecklist(staffId);
      save(store);
    }
    return store[staffId];
  },
  init(staffId: string) {
    const store = load();
    store[staffId] = buildDefaultToolChecklist(staffId);
    save(store);
    return store[staffId];
  },
  updateItem(staffId: string, tool: ToolKey, patch: Partial<Omit<ToolAccessItem, 'staffId' | 'tool'>>) {
    const store = load();
    const list = store[staffId] ?? buildDefaultToolChecklist(staffId);
    store[staffId] = list.map((i) => (i.tool === tool ? { ...i, ...patch } : i));
    save(store);
    return store[staffId];
  },
  setStatus(staffId: string, tool: ToolKey, status: ToolAccessStatus) {
    return this.updateItem(staffId, tool, { status });
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
