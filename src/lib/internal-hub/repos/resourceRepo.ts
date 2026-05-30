// Doc 1.2 — admin-editable resources. Local-only.
import type { Resource, ResourceCategory, StaffProfile } from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';
import { SEED_RESOURCES } from '../seedNotices';
import { audienceMatches } from './noticeRepo';

const KEY = 'resources';

function load(): Resource[] {
  const existing = readJSON<Resource[] | null>(KEY, null);
  if (existing && existing.length) return existing;
  writeJSON(KEY, SEED_RESOURCES);
  return SEED_RESOURCES;
}
const save = (r: Resource[]) => writeJSON(KEY, r);

export const resourceRepo = {
  list(): Resource[] {
    return load();
  },
  visibleFor(staff: StaffProfile): Resource[] {
    return load()
      .filter((r) => r.status === 'Active')
      .filter((r) => audienceMatches(r.audience, staff));
  },
  byCategory(cat: ResourceCategory): Resource[] {
    return load().filter((r) => r.category === cat && r.status === 'Active');
  },
  create(input: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Resource {
    const now = nowISO();
    const next: Resource = {
      ...input,
      id: uid('res'),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    save([next, ...load()]);
    return next;
  },
  update(id: string, patch: Partial<Resource>): Resource | undefined {
    let updated: Resource | undefined;
    save(
      load().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch, id: r.id, updatedAt: nowISO() };
        return updated;
      }),
    );
    return updated;
  },
  archive(id: string) {
    this.update(id, { status: 'Archived' });
  },
  unarchive(id: string) {
    this.update(id, { status: 'Active' });
  },
};
