
## Doc 4.2 Gap Fixes

The root cause for most 4.2 fails is that the **Requests module is a stub** (`RequestsIndex.tsx` = `ComingSoonStub`). Without it, there's no caller for calendar sync, approval emails, or upload UX. Plan focuses on building the minimum Requests pipeline needed to satisfy 4.2, not the full Requests spec.

### 1. Requests submission + approval pipeline (unblocks everything)

Build a minimal `/staff/requests` page:
- Staff: submit Leave / MC / Claim with type, dates, half-day flag, attachment upload
- Admin: list pending → Approve / Reject with reason
- Persist to existing `ih_requests` table; status transitions: `pending → approved | rejected`

This is the caller every 4.2 surface needs.

### 2. Calendar sync trigger (Critical)

On Leave approved or MC accepted, call existing `ih-calendar-sync` edge function with:
- Full-day → all-day event
- Half-day AM/PM → timed event (09:00–13:00 / 14:00–18:00 MYT)
- Title format per spec; sync result written to `ih_calendar_sync_log`

Trigger from approval handler (server-side via edge function, not client) so failures are logged even if browser closes.

### 3. Approval outcome emails (Critical)

Wire `ih-send-email` for the 3 missing event types:
- `request.approved` — to requester, with type/dates
- `request.rejected` — to requester, with reason
- `claim.approved` — to requester, mentions next payroll inclusion

Single sender `system@theaihq.net`; failures persisted in `ih_email_log` and surfaced in System Issues (deferred to 4.3 plan).

### 4. Upload UX + failure surface (High / Medium)

- Attachment upload component on Request form: 10MB cap client-side + server re-check, private `request-attachments` bucket (already exists)
- On upload failure: inline error + row in `ih_email_log`-style `ih_upload_errors` (or reuse existing log table — to confirm during implementation)
- Admin sees attachment via signed URL (short TTL)

### 5. Verify payslip-ready email has no PDF attachment (Medium)

Read `ih-send-email` payslip-ready branch; confirm body links to in-app payslip page and does NOT attach the PDF. Fix if it does. (Per Doc 3.2 confidentiality rule.)

### Out of scope (handled separately)

- Doc 4.3 gaps (audit log, System Issues page, extended hard-delete, AI extraction) — separate plan
- Full Requests module polish (filters, bulk actions, history view) beyond what 4.2 needs

### Technical notes

- New edge function calls: extend `ih-send-email` with 3 new templates; reuse existing `ih-calendar-sync`
- New migration: none required if `ih_requests` schema already supports status + attachment_path; otherwise add columns
- All approval/sync/email calls go through edge functions (server-side) to ensure logging survives client disconnects
- Honors invariants: GRANTs on any new tables, RLS scoped via `has_ih_role`, no service_role to client

### Expected compliance after fixes

Doc 4.2: 73% → ~97% (only RLS automated test suite remains, which is a 4.3 concern)

### Suggested implementation order

1. Requests UI + approval state machine (foundation)
2. Calendar sync trigger on approval
3. Approval/rejection/claim emails
4. Upload UX + failure logging
5. Payslip email audit
