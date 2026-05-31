import { supabase } from '@/integrations/supabase/client';

export type IssueType = 'email' | 'calendar' | 'pdf' | 'welcome_email';
export type IssueStatus = 'open' | 'resolved';

export interface SystemIssue {
  id: string;
  type: IssueType;
  status: IssueStatus;
  relatedTable: string | null;
  relatedId: string | null;
  summary: string;
  errorMessage: string | null;
  createdAt: string;
  lastAttemptAt: string | null;
  raw: Record<string, unknown>;
}

export interface ListFilters {
  type?: IssueType | 'all';
  status?: IssueStatus | 'all';
  sinceDays?: number;
}

function safeError(msg: string | null): string {
  if (!msg) return 'Unknown error';
  // Strip stack traces / tokens; keep first line, cap length
  const first = msg.split('\n')[0].trim();
  return first.length > 240 ? first.slice(0, 240) + '…' : first;
}

export async function listSystemIssues(filters: ListFilters = {}): Promise<SystemIssue[]> {
  const sinceDays = filters.sinceDays ?? 30;
  const sinceIso = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const typeFilter = filters.type ?? 'all';
  const statusFilter = filters.status ?? 'open';

  const issues: SystemIssue[] = [];

  // Emails
  if (typeFilter === 'all' || typeFilter === 'email') {
    const { data } = await supabase
      .from('ih_email_log')
      .select('id, event_type, status, subject, to_addresses, related_table, related_id, error_message, sent_at, created_at, updated_at')
      .in('status', statusFilter === 'resolved' ? ['sent'] : ['failed', 'retrying'])
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(200);
    (data ?? []).forEach((r) => {
      issues.push({
        id: `email:${r.id}`,
        type: 'email',
        status: r.status === 'sent' ? 'resolved' : 'open',
        relatedTable: r.related_table,
        relatedId: r.related_id,
        summary: `Email "${r.subject}" → ${(r.to_addresses ?? []).join(', ')}`,
        errorMessage: safeError(r.error_message),
        createdAt: r.created_at,
        lastAttemptAt: r.updated_at ?? r.sent_at ?? null,
        raw: r as Record<string, unknown>,
      });
    });
  }

  // Calendar
  if (typeFilter === 'all' || typeFilter === 'calendar') {
    const { data } = await supabase
      .from('ih_calendar_sync_log')
      .select('id, action, status, request_id, error_message, gcal_event_id, created_at')
      .eq('status', statusFilter === 'resolved' ? 'success' : 'failed')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(200);
    (data ?? []).forEach((r) => {
      issues.push({
        id: `calendar:${r.id}`,
        type: 'calendar',
        status: r.status === 'success' ? 'resolved' : 'open',
        relatedTable: 'ih_requests',
        relatedId: r.request_id,
        summary: `Calendar ${r.action} failed`,
        errorMessage: safeError(r.error_message),
        createdAt: r.created_at,
        lastAttemptAt: r.created_at,
        raw: r as Record<string, unknown>,
      });
    });
  }

  // PDF generation
  if (typeFilter === 'all' || typeFilter === 'pdf') {
    const query = supabase
      .from('ih_payslips')
      .select('id, staff_name, month, pdf_error, pdf_generated_at, created_at')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(200);
    const { data } = statusFilter === 'resolved'
      ? await query.not('pdf_generated_at', 'is', null).is('pdf_error', null)
      : await query.not('pdf_error', 'is', null);
    (data ?? []).forEach((r) => {
      issues.push({
        id: `pdf:${r.id}`,
        type: 'pdf',
        status: r.pdf_error ? 'open' : 'resolved',
        relatedTable: 'ih_payslips',
        relatedId: r.id,
        summary: `Payslip PDF — ${r.staff_name ?? '—'} (${r.month})`,
        errorMessage: r.pdf_error ? safeError(r.pdf_error) : null,
        createdAt: r.created_at,
        lastAttemptAt: r.pdf_generated_at ?? r.created_at,
        raw: r as Record<string, unknown>,
      });
    });
  }

  // Welcome emails
  if (typeFilter === 'all' || typeFilter === 'welcome_email') {
    const { data } = await supabase
      .from('ih_welcome_emails')
      .select('id, staff_id, status, failure_reason, sent_at, created_at')
      .eq('status', statusFilter === 'resolved' ? 'Sent' : 'Failed')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(200);
    (data ?? []).forEach((r) => {
      issues.push({
        id: `welcome_email:${r.id}`,
        type: 'welcome_email',
        status: r.status === 'Sent' ? 'resolved' : 'open',
        relatedTable: 'ih_staff_profiles',
        relatedId: r.staff_id,
        summary: 'Welcome email delivery',
        errorMessage: safeError(r.failure_reason),
        createdAt: r.created_at,
        lastAttemptAt: r.sent_at ?? r.created_at,
        raw: r as Record<string, unknown>,
      });
    });
  }

  return issues.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Best-effort retry. Returns a human-readable message.
 * Server-side dedupe/idempotency is enforced by the underlying edge functions.
 */
export async function retryIssue(issue: SystemIssue): Promise<{ ok: boolean; message: string }> {
  try {
    if (issue.type === 'calendar' && issue.relatedId) {
      const { error } = await supabase.functions.invoke('ih-calendar-sync', {
        body: { action: 'upsert', request_id: issue.relatedId },
      });
      if (error) throw error;
      return { ok: true, message: 'Calendar sync re-queued.' };
    }
    if (issue.type === 'email') {
      const log = issue.raw as { event_type?: string; to_addresses?: string[]; idempotency_key?: string };
      const { error } = await supabase.functions.invoke('ih-send-email', {
        body: {
          event_type: log.event_type,
          to: log.to_addresses,
          force_retry: true,
          original_log_id: (issue.raw as { id?: string }).id,
        },
      });
      if (error) throw error;
      return { ok: true, message: 'Email re-queued.' };
    }
    if (issue.type === 'pdf' && issue.relatedId) {
      const { error } = await supabase.functions.invoke('ih-generate-payslip-pdf', {
        body: { payslip_id: issue.relatedId },
      });
      if (error) throw error;
      return { ok: true, message: 'PDF regeneration requested.' };
    }
    if (issue.type === 'welcome_email' && issue.relatedId) {
      const { error } = await supabase.functions.invoke('ih-send-email', {
        body: { event_type: 'staff.welcome', staff_id: issue.relatedId, force_retry: true },
      });
      if (error) throw error;
      return { ok: true, message: 'Welcome email re-queued.' };
    }
    return { ok: false, message: 'No retry action available for this issue type.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `Retry failed: ${msg}` };
  }
}
