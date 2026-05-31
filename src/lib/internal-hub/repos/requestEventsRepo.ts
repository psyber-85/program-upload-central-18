// Patch 1.4 §7 — append-only request activity timeline.
import { supabase } from '@/integrations/supabase/client';

export type RequestEventType =
  | 'Submitted'
  | 'AutoApproved'
  | 'AdminReviewed'
  | 'NeedsCorrection'
  | 'Resubmitted'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'IncludedInPayroll'
  | 'AttachmentAdded'
  | 'ProofWaived'
  | 'TrainingCompleted';

export interface RequestEvent {
  id: string;
  request_id: string;
  event_type: RequestEventType;
  actor_id: string | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const requestEventsRepo = {
  async list(requestId: string): Promise<RequestEvent[]> {
    const { data, error } = await supabase
      .from('ih_request_events')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[requestEventsRepo.list]', error);
      return [];
    }
    return (data ?? []) as RequestEvent[];
  },

  async add(input: {
    requestId: string;
    eventType: RequestEventType;
    actorId?: string | null;
    note?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await supabase.from('ih_request_events').insert({
      request_id: input.requestId,
      event_type: input.eventType,
      actor_id: input.actorId ?? null,
      note: input.note ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
    if (error) {
      console.warn('[requestEventsRepo.add] failed:', error.message);
    }
  },
};
