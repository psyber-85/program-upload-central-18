# Sub-batch 4B-Email — Doc 4.2 §5–§13

Goal: lift Doc 4.2 Email score from ~25% to ~95% by unifying sender identity, wiring the 6 missing Internal Hub email events to a real sender, and giving admins a visible failure log. Calendar, Storage, and PDF stay out of scope (separate sub-batches).

## Scope

In:

- §5 Single sender identity (`system@theaihq.net`, display name "AIHQ Staff Portal")
- §6 Event coverage (8 IH event types)
- §7 Admin broadcast → email always
- §8 Approval-needed + approval-outcome emails
- §10 Payslip-ready email (link only, no PDF)
- §11 Welcome email (real send, no secrets, Notion note)
- §12 Email failure preserves underlying record
- §13 Admin-visible failure log + retry

Out (later sub-batches): §15–§21 Calendar, §22–§27 Storage caps/MIME, §29–§33 PDF generator.

## Approach

Keep the existing SendGrid integration (already in `SENDGRID_API_KEY` + `SENDGRID_TEMPLATE_ID` secrets) — Doc 4.2 doesn't mandate provider, only sender identity and behavior. One generic dispatcher edge function, one log table, thin per-event wrappers.

### 1. Single dispatcher: `ih-send-email` (new edge function)

Replace direct SendGrid calls scattered across `send-welcome-email`, `send-payslip-notification`, `send-hr-notification`. New function accepts:

```
{ eventType, to[], cc[]?, subject, html, text, relatedTable?, relatedId?, idempotencyKey }
```

Responsibilities:

- Force `from = { email: "system@theaihq.net", name: "AIHQ Staff Portal" }` — ignore caller overrides
- Validate input with zod
- Insert `ih_email_log` row with status `pending` BEFORE send (satisfies §12)
- POST to SendGrid; on success → `sent`; on failure → `failed` with error payload
- Idempotency: if `idempotencyKey` already exists with status `sent`, skip
- Return `{ logId, status }`

Existing three SendGrid functions get refactored to call `ih-send-email` (keeps their public contracts intact for any current callers).

### 2. Database: `ih_email_log` table

```
id uuid pk
event_type text  -- 'welcome' | 'admin_broadcast' | 'approval_needed' | 'approval_outcome' | 'payroll_reminder' | 'notion_readiness' | 'ack_required_notice' | 'payslip_ready'
to_addresses text[]
cc_addresses text[]
subject text
related_table text       -- e.g. 'ih_requests', 'ih_payslips'
related_id uuid
idempotency_key text unique
status text              -- 'pending' | 'sent' | 'failed' | 'retrying'
provider_message_id text
error_message text
attempt_count int default 1
created_at, updated_at, sent_at
```

RLS: admin-only SELECT via `has_ih_role(auth.uid(), 'admin')`. Service role full access. No anon. GRANTs included.

### 3. Wire the 6 missing IH event senders

Each is a thin caller from existing IH code paths (no new business logic):


| Event                 | Trigger                                                                  | Caller location                                                                                              |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `welcome`             | Admin creates staff in IH                                                | `src/lib/internal-hub/staff/welcomeEmailRepo.ts` — replace localStorage sim with real `ih-send-email` invoke |
| `admin_broadcast`     | Admin posts notice with `emailRequired=true` (Core rule: all broadcasts) | `src/lib/internal-hub/notices/*` create path                                                                 |
| `approval_needed`     | Staff submits leave/claim → notify admin queue                           | `ih_requests` insert side-effect (client invoke after insert)                                                |
| `approval_outcome`    | Admin approves/rejects → notify requester                                | request status-change handler                                                                                |
| `payroll_reminder`    | Cron-style or admin-triggered before cut-off                             | `src/lib/internal-hub/payroll/*` reminder action                                                             |
| `notion_readiness`    | `notion_unlocked_at` is set (joinDate+1mo)                               | server-side check OR client check on first-eligible login                                                    |
| `ack_required_notice` | Admin posts notice with `requiresAck=true`                               | same notice create path, different template                                                                  |
| `payslip_ready`       | `ih_payroll_runs.finalized_at` becomes non-null                          | finalize handler (already exists in payslipRepo)                                                             |


All bodies are link-to-portal templates (no PDFs, no secrets in body per §11).

### 4. Admin failure dashboard

New page `src/pages/staff/EmailLog.tsx` (admin-only via existing access helper):

- Table: timestamp, event, recipient, status pill, error preview
- Filter by status (default: `failed` + `retrying`)
- "Retry" button on failed rows → re-invokes `ih-send-email` with same idempotency key but `force=true`
- Link in `/staff` Home admin card row

### 5. Self-initiated suppression (§9 — already Pass)

Confirm no confirmation email fires when a user submits their own request. Add explicit test.

## Files

New:

- `supabase/functions/ih-send-email/index.ts`
- `supabase/migrations/<ts>_ih_email_log.sql`
- `src/pages/staff/EmailLog.tsx`
- `src/lib/internal-hub/email/dispatcher.ts` (typed client wrapper around `supabase.functions.invoke('ih-send-email', ...)`)
- 8 template builders in `src/lib/internal-hub/email/templates/`

Edited:

- `supabase/functions/send-welcome-email/index.ts` → delegate to `ih-send-email`
- `supabase/functions/send-payslip-notification/index.ts` → same
- `supabase/functions/send-hr-notification/index.ts` → same
- `src/lib/internal-hub/staff/welcomeEmailRepo.ts` → real send
- `src/lib/internal-hub/notices/*` → wire broadcast + ack-required
- `src/lib/internal-hub/payroll/payslipRepo.ts` → wire payslip_ready
- request status-change handlers → wire approval_needed/outcome
- `supabase/config.toml` → register `ih-send-email`
- `src/App.tsx` (or staff router) → `/staff/email-log` route
- `src/pages/staff/Home.tsx` admin card → "Email delivery" link

## Acceptance check (re-audit Doc 4.2 §5–§13)

Expected: 13/13 Pass. Single audit pass after merge.

## Risks

- Existing callers of `send-welcome-email` etc. (outside IH) inherit the new sender identity. Reviewed: those callers are in marketing/placement flows; per memory, marketing is untouched — verify before refactor and, if they need a different sender, keep them on their old direct-SendGrid path and only redirect IH callers.
- SendGrid template ID is currently shared; new IH events use raw HTML rendered server-side (no template ID needed) to keep sender identity uniform.