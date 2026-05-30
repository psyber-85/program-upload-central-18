// Doc 1.2 — notices, broadcasts, ack tracking. Local-only.
import type {
  BroadcastLogEntry,
  Notice,
  NoticeAck,
  NoticeAudience,
  NoticeImportance,
  NoticeLink,
  NoticeReadState,
  NoticeType,
  StaffProfile,
} from '../types';
import { nowISO, readJSON, uid, writeJSON } from '../storage';
import { SEED_NOTICES } from '../seedNotices';

const KEY_NOTICES = 'notices';
const KEY_READS = 'notice-reads';
const KEY_ACKS = 'notice-acks';
const KEY_BROADCAST_LOG = 'notice-broadcast-log';

function loadNotices(): Notice[] {
  const existing = readJSON<Notice[] | null>(KEY_NOTICES, null);
  if (existing && existing.length) return existing;
  writeJSON(KEY_NOTICES, SEED_NOTICES);
  return SEED_NOTICES;
}
const saveNotices = (n: Notice[]) => writeJSON(KEY_NOTICES, n);

const loadReads = (): NoticeReadState[] => readJSON<NoticeReadState[]>(KEY_READS, []);
const saveReads = (r: NoticeReadState[]) => writeJSON(KEY_READS, r);

const loadAcks = (): NoticeAck[] => readJSON<NoticeAck[]>(KEY_ACKS, []);
const saveAcks = (a: NoticeAck[]) => writeJSON(KEY_ACKS, a);

export function audienceMatches(audience: NoticeAudience, staff: StaffProfile): boolean {
  switch (audience.kind) {
    case 'Everyone':
      return true;
    case 'Admin':
      return staff.role === 'Admin';
    case 'Arm':
      return staff.businessArm === audience.arm;
    case 'Individual':
      return staff.id === audience.staffId;
  }
}

export interface BroadcastInput {
  title: string;
  message: string;
  type?: NoticeType;
  importance: NoticeImportance;
  audience: NoticeAudience;
  links?: NoticeLink[];
  createdBy: string;
}

export const noticeRepo = {
  list(): Notice[] {
    return loadNotices();
  },
  get(id: string): Notice | undefined {
    return loadNotices().find((n) => n.id === id);
  },
  /** Notices visible to a staff member (audience match, not archived). */
  visibleFor(staff: StaffProfile, opts: { includeArchived?: boolean } = {}): Notice[] {
    return loadNotices()
      .filter((n) => (opts.includeArchived ? true : !n.archived))
      .filter((n) => audienceMatches(n.audience, staff))
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  },
  /** Doc 1.2 §12 — Admin broadcast = in-app + emailRequired + log. */
  broadcast(input: BroadcastInput): Notice {
    const all = loadNotices();
    const now = nowISO();
    const notice: Notice = {
      id: uid('ntc'),
      title: input.title,
      message: input.message,
      type: input.type ?? 'AdminBroadcast',
      importance: input.importance,
      audience: input.audience,
      links: input.links ?? [],
      createdBy: input.createdBy,
      createdAt: now,
      publishedAt: now,
      emailRequired: true, // always true for broadcasts
      archived: false,
    };
    saveNotices([notice, ...all]);
    return notice;
  },
  /** Limited edit per §21 — title/message/links only. */
  edit(id: string, patch: Pick<Partial<Notice>, 'title' | 'message' | 'links'>): Notice | undefined {
    const all = loadNotices();
    let updated: Notice | undefined;
    const next = all.map((n) => {
      if (n.id !== id) return n;
      updated = { ...n, ...patch, editedAt: nowISO() };
      return updated;
    });
    saveNotices(next);
    return updated;
  },
  archive(id: string) {
    const all = loadNotices();
    saveNotices(all.map((n) => (n.id === id ? { ...n, archived: true } : n)));
  },
  unarchive(id: string) {
    const all = loadNotices();
    saveNotices(all.map((n) => (n.id === id ? { ...n, archived: false } : n)));
  },

  // ---- read state ----
  isReadBy(noticeId: string, staffId: string): boolean {
    return loadReads().some((r) => r.noticeId === noticeId && r.staffId === staffId);
  },
  markRead(noticeId: string, staffId: string) {
    const reads = loadReads();
    if (reads.some((r) => r.noticeId === noticeId && r.staffId === staffId)) return;
    saveReads([...reads, { noticeId, staffId, readAt: nowISO() }]);
  },
  unreadCount(staff: StaffProfile): number {
    const visible = this.visibleFor(staff);
    const reads = loadReads();
    return visible.filter(
      (n) => !reads.some((r) => r.noticeId === n.id && r.staffId === staff.id),
    ).length;
  },

  // ---- acknowledgments ----
  ackBy(noticeId: string, staffId: string): NoticeAck | undefined {
    return loadAcks().find((a) => a.noticeId === noticeId && a.staffId === staffId);
  },
  acknowledge(noticeId: string, staffId: string) {
    const acks = loadAcks();
    if (acks.some((a) => a.noticeId === noticeId && a.staffId === staffId)) return;
    saveAcks([...acks, { noticeId, staffId, acknowledgedAt: nowISO() }]);
  },
  ackRequiredPendingFor(staff: StaffProfile): Notice[] {
    return this.visibleFor(staff).filter(
      (n) =>
        n.importance === 'AcknowledgmentRequired' && !this.ackBy(n.id, staff.id),
    );
  },
  /** Admin report — who has and hasn't acknowledged. */
  ackReport(noticeId: string, allStaff: StaffProfile[]) {
    const n = this.get(noticeId);
    if (!n) return { acknowledged: [], pending: [] };
    const recipients = allStaff.filter((s) => s.status === 'Active' && audienceMatches(n.audience, s));
    const acks = loadAcks().filter((a) => a.noticeId === noticeId);
    const ackedIds = new Set(acks.map((a) => a.staffId));
    return {
      acknowledged: recipients
        .filter((s) => ackedIds.has(s.id))
        .map((s) => ({ staff: s, at: acks.find((a) => a.staffId === s.id)?.acknowledgedAt })),
      pending: recipients.filter((s) => !ackedIds.has(s.id)),
    };
  },
};
