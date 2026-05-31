// Doc 4.1 — Supabase-backed noticeRepo.
// Async API. RLS enforces visibility (audience match + active staff + not archived).
// Notes vs. legacy local model:
//  - DB has no `links`, `type`, `editedAt`, or `broadcast log` columns — those
//    return [] / 'AdminBroadcast' / undefined and broadcastLog methods are no-ops.
//  - DB importance enum is Normal | Important | Critical. App's
//    'AcknowledgmentRequired' is stored as importance='Critical' + ack_required=true.
//  - App audience 'Admin' and 'Arm: Admin/General' fall back to 'Everyone' in DB.
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '../audit';
import type {
  BroadcastLogEntry,
  Notice,
  NoticeAck,
  NoticeAudience,
  NoticeImportance,
  NoticeLink,
  NoticeType,
  StaffProfile,
} from '../types';

type DbNotice = {
  id: string;
  title: string;
  body: string;
  audience: string;
  audience_staff_id: string | null;
  importance: 'Normal' | 'Important' | 'Critical';
  ack_required: boolean;
  email_required: boolean;
  archived_at: string | null;
  created_at: string;
  created_by: string | null;
};

function audienceToDb(a: NoticeAudience): { audience: string; audience_staff_id: string | null } {
  if (a.kind === 'Individual') return { audience: 'Individual', audience_staff_id: a.staffId };
  if (a.kind === 'Arm' && (a.arm === 'Training' || a.arm === 'Solutions')) {
    return { audience: a.arm, audience_staff_id: null };
  }
  // 'Everyone', 'Admin', 'Arm: Admin/General' → Everyone (RLS doesn't model Admin-only audience)
  return { audience: 'Everyone', audience_staff_id: null };
}

function audienceFromDb(audience: string, staffId: string | null): NoticeAudience {
  if (audience === 'Individual') return { kind: 'Individual', staffId: staffId ?? '' };
  if (audience === 'Training') return { kind: 'Arm', arm: 'Training' };
  if (audience === 'Solutions') return { kind: 'Arm', arm: 'Solutions' };
  return { kind: 'Everyone' };
}

function importanceToDb(imp: NoticeImportance): { importance: DbNotice['importance']; ack_required: boolean } {
  if (imp === 'AcknowledgmentRequired') return { importance: 'Critical', ack_required: true };
  if (imp === 'Important') return { importance: 'Important', ack_required: false };
  return { importance: 'Normal', ack_required: false };
}

function importanceFromDb(imp: DbNotice['importance'], ack: boolean): NoticeImportance {
  if (ack) return 'AcknowledgmentRequired';
  if (imp === 'Important' || imp === 'Critical') return 'Important';
  return 'Normal';
}

function mapRow(r: DbNotice): Notice {
  return {
    id: r.id,
    title: r.title,
    message: r.body,
    type: 'AdminBroadcast' as NoticeType,
    importance: importanceFromDb(r.importance, r.ack_required),
    audience: audienceFromDb(r.audience, r.audience_staff_id),
    links: [] as NoticeLink[],
    createdBy: r.created_by ?? '',
    createdAt: r.created_at,
    publishedAt: r.created_at,
    emailRequired: r.email_required,
    archived: !!r.archived_at,
  };
}

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
async function resolveBroadcastRecipients(notice: Notice): Promise<string[]> {
  // Active staff filtered by audience. Mirrors `audienceMatches` logic.
  const { data, error } = await supabase
    .from('ih_staff_profiles')
    .select('email, role, business_arm, id')
    .eq('status', 'Active');
  if (error || !data) return [];
  const arm = notice.audience.kind === 'Arm' ? notice.audience.arm : null;
  const staffId = notice.audience.kind === 'Individual' ? notice.audience.staffId : null;
  return data
    .filter((s) => {
      if (notice.audience.kind === 'Everyone') return true;
      if (notice.audience.kind === 'Admin') return s.role === 'admin';
      if (notice.audience.kind === 'Arm') return s.business_arm === arm;
      if (notice.audience.kind === 'Individual') return s.id === staffId;
      return false;
    })
    .map((s) => s.email)
    .filter((e): e is string => !!e);
}


export const noticeRepo = {
  async list(includeArchived = false): Promise<Notice[]> {
    let q = supabase.from('ih_notices').select('*').order('created_at', { ascending: false });
    if (!includeArchived) q = q.is('archived_at', null);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as DbNotice[]).map(mapRow);
  },

  async get(id: string): Promise<Notice | undefined> {
    const { data, error } = await supabase
      .from('ih_notices')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as DbNotice) : undefined;
  },

  /** RLS already filters by audience + active staff. */
  async visibleFor(_staff: StaffProfile, opts: { includeArchived?: boolean } = {}): Promise<Notice[]> {
    return this.list(opts.includeArchived);
  },

  /** Doc 1.2 §12 + Doc 4.2 §7 — Admin broadcast = in-app + email always. */
  async broadcast(input: BroadcastInput): Promise<Notice> {
    const aud = audienceToDb(input.audience);
    const imp = importanceToDb(input.importance);
    const { data, error } = await supabase
      .from('ih_notices')
      .insert({
        title: input.title,
        body: input.message,
        audience: aud.audience,
        audience_staff_id: aud.audience_staff_id,
        importance: imp.importance,
        ack_required: imp.ack_required,
        email_required: true,
        created_by: input.createdBy,
      })
      .select('*')
      .single();
    if (error) throw error;
    const notice = mapRow(data as DbNotice);

    // Doc 4.2 §7 — send broadcast email (fire-and-forget; failures are
    // surfaced via the admin email log and do not block notice creation).
    void this._sendBroadcastEmail(notice).catch((e) => {
      console.error('[noticeRepo.broadcast] email dispatch failed', e);
    });

    return notice;
  },

  async _sendBroadcastEmail(notice: Notice): Promise<void> {
    const { broadcastEmail } = await import('../email/dispatcher');
    const recipients = await resolveBroadcastRecipients(notice);
    if (recipients.length === 0) return;
    await broadcastEmail({
      id: notice.id,
      title: notice.title,
      message: notice.message,
      recipients,
      ackRequired: notice.importance === 'AcknowledgmentRequired',
    });
  },

  // Broadcast log table not implemented in Phase 2 — return empty.
  async listBroadcastLog(): Promise<BroadcastLogEntry[]> {
    return [];
  },
  async broadcastLogFor(_noticeId: string): Promise<BroadcastLogEntry | undefined> {
    return undefined;
  },

  /** Limited edit per §21 — title/message only (links not stored in DB). */
  async edit(id: string, patch: Pick<Partial<Notice>, 'title' | 'message' | 'links'>): Promise<Notice | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbPatch: any = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.message !== undefined) dbPatch.body = patch.message;
    if (Object.keys(dbPatch).length === 0) return this.get(id);
    const { error } = await supabase.from('ih_notices').update(dbPatch).eq('id', id);
    if (error) throw error;
    return this.get(id);
  },

  async archive(id: string): Promise<void> {
    const { error } = await supabase
      .from('ih_notices')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async unarchive(id: string): Promise<void> {
    const { error } = await supabase
      .from('ih_notices')
      .update({ archived_at: null })
      .eq('id', id);
    if (error) throw error;
  },

  // ---- read state ----
  async listReadsForStaff(staffId: string): Promise<Set<string>> {
    const { data, error } = await supabase
      .from('ih_notice_reads')
      .select('notice_id')
      .eq('staff_id', staffId);
    if (error) throw error;
    return new Set(((data ?? []) as { notice_id: string }[]).map((r) => r.notice_id));
  },

  async markRead(noticeId: string, staffId: string): Promise<void> {
    const { error } = await supabase
      .from('ih_notice_reads')
      .insert({ notice_id: noticeId, staff_id: staffId });
    // Ignore duplicate-key errors (composite PK collisions)
    if (error && !/duplicate|conflict|unique/i.test(error.message)) throw error;
  },

  async unreadCount(staff: StaffProfile): Promise<number> {
    const [notices, reads] = await Promise.all([
      this.visibleFor(staff),
      this.listReadsForStaff(staff.id),
    ]);
    return notices.filter((n) => !reads.has(n.id)).length;
  },

  // ---- acknowledgments ----
  async listAcksForStaff(staffId: string): Promise<Map<string, NoticeAck>> {
    const { data, error } = await supabase
      .from('ih_notice_acks')
      .select('*')
      .eq('staff_id', staffId);
    if (error) throw error;
    const m = new Map<string, NoticeAck>();
    for (const a of (data ?? []) as { notice_id: string; staff_id: string; acked_at: string }[]) {
      m.set(a.notice_id, { noticeId: a.notice_id, staffId: a.staff_id, acknowledgedAt: a.acked_at });
    }
    return m;
  },

  async ackBy(noticeId: string, staffId: string): Promise<NoticeAck | undefined> {
    const { data, error } = await supabase
      .from('ih_notice_acks')
      .select('*')
      .eq('notice_id', noticeId)
      .eq('staff_id', staffId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return { noticeId: data.notice_id, staffId: data.staff_id, acknowledgedAt: data.acked_at };
  },

  async acknowledge(noticeId: string, staffId: string): Promise<void> {
    const { error } = await supabase
      .from('ih_notice_acks')
      .insert({ notice_id: noticeId, staff_id: staffId });
    if (error && !/duplicate|conflict|unique/i.test(error.message)) throw error;
  },

  async ackRequiredPendingFor(staff: StaffProfile): Promise<Notice[]> {
    const [notices, acks] = await Promise.all([
      this.visibleFor(staff),
      this.listAcksForStaff(staff.id),
    ]);
    return notices.filter((n) => n.importance === 'AcknowledgmentRequired' && !acks.has(n.id));
  },

  /** Admin report — who has and hasn't acknowledged. */
  async ackReport(noticeId: string, allStaff: StaffProfile[]) {
    const n = await this.get(noticeId);
    if (!n) return { acknowledged: [] as { staff: StaffProfile; at?: string }[], pending: [] as StaffProfile[] };
    const recipients = allStaff.filter((s) => s.status === 'Active' && audienceMatches(n.audience, s));
    const { data, error } = await supabase
      .from('ih_notice_acks')
      .select('*')
      .eq('notice_id', noticeId);
    if (error) throw error;
    const acks = (data ?? []) as { staff_id: string; acked_at: string }[];
    const ackMap = new Map(acks.map((a) => [a.staff_id, a.acked_at]));
    return {
      acknowledged: recipients
        .filter((s) => ackMap.has(s.id))
        .map((s) => ({ staff: s, at: ackMap.get(s.id) })),
      pending: recipients.filter((s) => !ackMap.has(s.id)),
    };
  },
};
