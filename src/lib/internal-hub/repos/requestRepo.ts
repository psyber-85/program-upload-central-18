// Doc 4.2 — Requests CRUD + approval flow.
// Submit (staff) → Approve/Reject (admin) → calendar sync + outcome email.
// Patch 1.4 — Extended for Benefit/Other, NeedsCorrection loop, Training Application→Completion→Claim,
//             proof waiver, and per-event activity timeline entries.
import { supabase } from '@/integrations/supabase/client';
import { approvalNeededEmail, approvalOutcomeEmail } from '../email/dispatcher';
import { logAudit } from '../audit';
import { requestEventsRepo } from './requestEventsRepo';

// 'Other' is mapped onto the existing 'Benefit' DB enum but flagged via payload.kind_label.
export type RequestKind = 'Leave' | 'MC' | 'Claim' | 'Training' | 'Benefit';
export type RequestStatusDb = 'Submitted' | 'Approved' | 'Rejected' | 'NeedsCorrection' | 'Cancelled';
export type HalfDaySlot = 'morning' | 'afternoon' | null;

export type RequestSubState =
  | 'ApplicationApproved'   // Training application approved, waiting for completion
  | 'TrainingCompleted'     // Training marked completed, waiting for claim
  | 'ClaimSubmitted'        // Training claim record submitted
  | null;

export interface RequestPayload {
  start_date?: string;       // YYYY-MM-DD (Leave/MC)
  end_date?: string;         // YYYY-MM-DD (Leave/MC)
  reason?: string;           // optional staff note
  amount?: number;           // Claim / Training Claim
  category?: string;         // Claim only
  // Training application fields
  course_name?: string;
  provider?: string;
  course_link?: string;
  expected_completion?: string;
  justification?: string;
  cost?: number;
  // Training completion fields
  completion_date?: string;
  completion_note?: string;
  // Benefit / Other
  topic?: string;
  description?: string;
  kind_label?: string;       // 'Other' marker for Benefit-typed records used as Other
  // Proof waiver
  proof_waived?: boolean;
  proof_waived_reason?: string;
  proof_waived_by?: string;
  [k: string]: unknown;
}

export interface RequestRow {
  id: string;
  staff_id: string;
  kind: RequestKind;
  status: RequestStatusDb;
  payload: RequestPayload;
  half_day_slot: HalfDaySlot;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  gcal_event_id: string | null;
  gcal_sync_error: string | null;
  training_application_id: string | null;
  sub_state: RequestSubState;
  created_at: string;
  updated_at: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  staff_id: string;
  path: string;
  size: number;
  mime: string;
  kind: string;
  uploaded_at: string;
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

export const requestRepo = {
  async create(input: {
    staffId: string;
    kind: RequestKind;
    payload: RequestPayload;
    halfDaySlot?: HalfDaySlot;
    trainingApplicationId?: string | null;
    subState?: RequestSubState;
  }): Promise<RequestRow> {
    const { data, error } = await supabase
      .from('ih_requests')
      .insert({
        staff_id: input.staffId,
        kind: input.kind,
        status: 'Submitted',
        payload: input.payload as never,
        half_day_slot: input.halfDaySlot ?? null,
        training_application_id: input.trainingApplicationId ?? null,
        sub_state: input.subState ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    const row = data as RequestRow;
    void requestEventsRepo.add({
      requestId: row.id,
      eventType: 'Submitted',
      actorId: input.staffId,
      note: typeof input.payload?.reason === 'string' ? input.payload.reason : null,
    });
    return row;
  },

  async get(id: string): Promise<RequestRow | null> {
    const { data, error } = await supabase
      .from('ih_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[requestRepo.get]', error);
      return null;
    }
    return (data as RequestRow | null) ?? null;
  },

  async uploadAttachment(input: {
    requestId: string;
    staffId: string;
    file: File;
    kind?: string;
  }): Promise<RequestAttachment> {
    if (input.file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`File too large (max 10MB). This file is ${(input.file.size / 1024 / 1024).toFixed(1)}MB.`);
    }
    if (!ALLOWED_MIMES.has(input.file.type)) {
      throw new Error(`Unsupported file type "${input.file.type}". Allowed: PNG, JPEG, WebP, PDF.`);
    }
    const ext = input.file.name.split('.').pop() ?? 'bin';
    const path = `${input.staffId}/${input.requestId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage
      .from('request-attachments')
      .upload(path, input.file, { contentType: input.file.type, upsert: false });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);

    const { data, error } = await supabase
      .from('ih_request_attachments')
      .insert({
        request_id: input.requestId,
        staff_id: input.staffId,
        path,
        size: input.file.size,
        mime: input.file.type,
        kind: input.kind ?? 'general',
      })
      .select('*')
      .single();
    if (error) {
      // Roll back the storage object so we don't leak orphans.
      await supabase.storage.from('request-attachments').remove([path]);
      throw error;
    }
    void requestEventsRepo.add({
      requestId: input.requestId,
      eventType: 'AttachmentAdded',
      actorId: input.staffId,
      note: input.file.name,
      metadata: { size: input.file.size, mime: input.file.type },
    });
    return data as RequestAttachment;
  },

  async listForStaff(staffId: string): Promise<RequestRow[]> {
    const { data, error } = await supabase
      .from('ih_requests')
      .select('*')
      .eq('staff_id', staffId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as RequestRow[];
  },

  async listPending(): Promise<RequestRow[]> {
    const { data, error } = await supabase
      .from('ih_requests')
      .select('*')
      .eq('status', 'Submitted')
      .is('archived_at', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as RequestRow[];
  },

  async listAttachments(requestId: string): Promise<RequestAttachment[]> {
    const { data, error } = await supabase
      .from('ih_request_attachments')
      .select('*')
      .eq('request_id', requestId)
      .order('uploaded_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as RequestAttachment[];
  },

  async signedUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('request-attachments')
      .createSignedUrl(path, 300);
    if (error) return null;
    return data.signedUrl;
  },

  /**
   * Admin: approve or reject. Side effects on Approve:
   *   - Leave/MC → invoke ih-calendar-sync (action=upsert)
   *   - All kinds → send approval_outcome email
   * Side effects on Reject:
   *   - If previously synced (gcal_event_id present) → invoke ih-calendar-sync (cancel)
   *   - Send approval_outcome email
   */
  async decide(input: {
    requestId: string;
    decision: 'Approved' | 'Rejected';
    note?: string;
    adminId: string;
  }): Promise<RequestRow> {
    const { data: updated, error } = await supabase
      .from('ih_requests')
      .update({
        status: input.decision,
        decided_by: input.adminId,
        decided_at: new Date().toISOString(),
        decision_note: input.note ?? null,
      })
      .eq('id', input.requestId)
      .select('*')
      .single();
    if (error) throw error;
    const row = updated as RequestRow;

    // Calendar sync (Leave/MC). Fire-and-forget; logged server-side.
    const isLeaveOrMc = row.kind === 'Leave' || row.kind === 'MC';
    if (isLeaveOrMc) {
      const action = input.decision === 'Approved' ? 'upsert' : 'cancel';
      void supabase.functions.invoke('ih-calendar-sync', {
        body: { action, request_id: row.id },
      });
    }

    // Outcome email — fire-and-forget; logged server-side.
    void (async () => {
      const { data: staff } = await supabase
        .from('ih_staff_profiles')
        .select('email, name')
        .eq('id', row.staff_id)
        .maybeSingle();
      if (staff?.email) {
        approvalOutcomeEmail({
          id: row.id,
          requesterEmail: staff.email,
          requesterName: staff.name ?? 'there',
          type: row.kind,
          outcome: input.decision === 'Approved' ? 'approved' : 'rejected',
          reason: input.note,
        });
      }
    })();

    // Doc 4.3 §6 — audit request decisions.
    void logAudit({
      action: input.decision === 'Approved' ? 'request.approved' : 'request.rejected',
      targetTable: 'ih_requests',
      targetId: row.id,
      summary: `${row.kind} request ${input.decision.toLowerCase()}`,
      metadata: { note: input.note ?? null, kind: row.kind },
    });

    return row;
  },

  async notifyAdmins(input: { request: RequestRow; requesterName: string }) {
    const { data: admins } = await supabase
      .from('ih_user_roles')
      .select('user_id')
      .eq('role', 'admin');
    if (!admins?.length) return;
    const ids = admins.map((a: any) => a.user_id);
    const { data: profiles } = await supabase
      .from('ih_staff_profiles')
      .select('email')
      .in('id', ids);
    const emails = (profiles ?? []).map((p: any) => p.email).filter(Boolean);
    if (!emails.length) return;
    approvalNeededEmail({
      id: input.request.id,
      requesterName: input.requesterName,
      type: input.request.kind,
      adminEmails: emails,
    });
  },
};
