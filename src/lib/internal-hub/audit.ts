import { supabase } from '@/integrations/supabase/client';

export interface AuditEntry {
  action: string;
  targetTable?: string | null;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * Doc 4.3 — Write an audit log entry via the SECURITY DEFINER RPC.
 * Failures are swallowed (logged to console) to avoid breaking primary workflows.
 * Audit log is admin-only readable and immutable at the DB level.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { error } = await supabase.rpc('ih_log_audit', {
      _action: entry.action,
      _target_table: entry.targetTable ?? null,
      _target_id: entry.targetId ?? null,
      _summary: entry.summary,
      _metadata: (entry.metadata ?? {}) as never,
    });
    if (error) {
      // Audit failure must never break the underlying workflow.
      // eslint-disable-next-line no-console
      console.warn('[audit] failed to log:', entry.action, error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[audit] exception:', e);
  }
}
