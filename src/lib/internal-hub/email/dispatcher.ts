// Doc 4.2 §5–§13 — Client wrapper for the ih-send-email dispatcher.
// All IH email events go through here. Never call the edge function directly
// from UI/repo code — use these typed senders so the event_type stays consistent.
import { supabase } from '@/integrations/supabase/client';

export type IhEmailEvent =
  | 'welcome'
  | 'admin_broadcast'
  | 'ack_required_notice'
  | 'approval_needed'
  | 'approval_outcome'
  | 'payroll_reminder'
  | 'notion_readiness'
  | 'payslip_ready';

export interface IhEmailSendInput {
  eventType: IhEmailEvent;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
  relatedTable?: string;
  relatedId?: string;
  /** Stable per logical send event — e.g. `welcome-${staffId}`. */
  idempotencyKey: string;
}

export interface IhEmailSendResult {
  logId?: string;
  status?: 'sent' | 'failed' | 'pending' | 'retrying';
  deduped?: boolean;
  error?: string;
}

const PORTAL_URL = typeof window !== 'undefined' ? window.location.origin : 'https://tryhire.theaihq.net';

/** Send an IH email. Never throws — caller decides what to do with failures. */
export async function sendIhEmail(input: IhEmailSendInput): Promise<IhEmailSendResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ih-send-email', {
      body: input,
    });
    if (error) return { status: 'failed', error: error.message };
    return data as IhEmailSendResult;
  } catch (e) {
    return { status: 'failed', error: e instanceof Error ? e.message : String(e) };
  }
}

/** §11 Welcome email — link to portal, Notion 1-month note, no secrets. */
export function welcomeEmail(staff: { id: string; email: string; fullName: string; joinDate?: string }) {
  const subject = `Welcome to AIHQ, ${staff.fullName}`;
  const html = `
    <p>Hi ${escapeHtml(staff.fullName)},</p>
    <p>Welcome to AIHQ Staff Portal. Sign in here:</p>
    <p><a href="${PORTAL_URL}/staff">${PORTAL_URL}/staff</a></p>
    <p>Your Notion workspace will unlock automatically one month after your join date${
      staff.joinDate ? ` (${staff.joinDate})` : ''
    }. Until then, you'll see a "Locked" badge — that's expected.</p>
    <p>If you have any issues, email <a href="mailto:wani@theaihq.net">wani@theaihq.net</a>.</p>
    <p>— AIHQ Staff Portal</p>
  `;
  return sendIhEmail({
    eventType: 'welcome',
    to: [staff.email],
    subject,
    html,
    relatedTable: 'ih_staff_profiles',
    relatedId: staff.id,
    idempotencyKey: `welcome-${staff.id}`,
  });
}

/** §7 Admin broadcast — always emailed. */
export function broadcastEmail(notice: {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  ackRequired: boolean;
}) {
  const eventType: IhEmailEvent = notice.ackRequired ? 'ack_required_notice' : 'admin_broadcast';
  const subject = notice.ackRequired
    ? `[Action required] ${notice.title}`
    : notice.title;
  const html = `
    <h2 style="margin:0 0 12px;font-family:Arial,sans-serif">${escapeHtml(notice.title)}</h2>
    <div style="font-family:Arial,sans-serif;line-height:1.5">${escapeHtml(notice.message).replace(/\n/g, '<br/>')}</div>
    ${
      notice.ackRequired
        ? `<p style="margin-top:24px"><strong>Acknowledgement required.</strong> Open the Staff Portal to confirm: <a href="${PORTAL_URL}/staff/notices">${PORTAL_URL}/staff/notices</a></p>`
        : `<p style="margin-top:24px">View in portal: <a href="${PORTAL_URL}/staff/notices">${PORTAL_URL}/staff/notices</a></p>`
    }
    <p style="color:#777;font-size:12px;margin-top:32px">— AIHQ Staff Portal</p>
  `;
  return sendIhEmail({
    eventType,
    to: notice.recipients,
    subject,
    html,
    relatedTable: 'ih_notices',
    relatedId: notice.id,
    idempotencyKey: `notice-${notice.id}`,
  });
}

/** §8 Approval needed — admin notified. */
export function approvalNeededEmail(req: {
  id: string;
  requesterName: string;
  type: string;
  adminEmails: string[];
}) {
  return sendIhEmail({
    eventType: 'approval_needed',
    to: req.adminEmails,
    subject: `New ${req.type} request awaiting approval`,
    html: `
      <p>${escapeHtml(req.requesterName)} submitted a new <strong>${escapeHtml(req.type)}</strong> request.</p>
      <p>Review in portal: <a href="${PORTAL_URL}/staff/requests">${PORTAL_URL}/staff/requests</a></p>
    `,
    relatedTable: 'ih_requests',
    relatedId: req.id,
    idempotencyKey: `approval-needed-${req.id}`,
  });
}

/** §8 Approval outcome — requester notified. */
export function approvalOutcomeEmail(req: {
  id: string;
  requesterEmail: string;
  requesterName: string;
  type: string;
  outcome: 'approved' | 'rejected';
  reason?: string;
}) {
  return sendIhEmail({
    eventType: 'approval_outcome',
    to: [req.requesterEmail],
    subject: `Your ${req.type} request was ${req.outcome}`,
    html: `
      <p>Hi ${escapeHtml(req.requesterName)},</p>
      <p>Your <strong>${escapeHtml(req.type)}</strong> request has been <strong>${req.outcome}</strong>.</p>
      ${req.reason ? `<p>Note from admin: ${escapeHtml(req.reason)}</p>` : ''}
      <p>View details: <a href="${PORTAL_URL}/staff/requests">${PORTAL_URL}/staff/requests</a></p>
    `,
    relatedTable: 'ih_requests',
    relatedId: req.id,
    idempotencyKey: `approval-outcome-${req.id}-${req.outcome}`,
  });
}

/** §10 Payslip ready — link to portal, NEVER attach PDF. */
export function payslipReadyEmail(p: {
  payslipId: string;
  recipientEmail: string;
  recipientName: string;
  month: string;
}) {
  return sendIhEmail({
    eventType: 'payslip_ready',
    to: [p.recipientEmail],
    subject: `Your payslip for ${p.month} is ready`,
    html: `
      <p>Hi ${escapeHtml(p.recipientName)},</p>
      <p>Your payslip for <strong>${escapeHtml(p.month)}</strong> is now available.</p>
      <p><a href="${PORTAL_URL}/staff/payslips">Open Staff Portal → Payslips</a></p>
      <p style="color:#777;font-size:12px">This is confidential. The payslip is not attached — please view it in the portal.</p>
    `,
    relatedTable: 'ih_payslips',
    relatedId: p.payslipId,
    idempotencyKey: `payslip-ready-${p.payslipId}`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
