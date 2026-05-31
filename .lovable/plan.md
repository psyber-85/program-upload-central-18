
# Doc 4.2 — Sub-batch 4B-PDF + 4B-Calendar

Two sequential sub-batches to lift Doc 4.2 from ~52% to ~95%. PDF first (Critical gaps), Calendar second (High gaps, requires Google OAuth).

Out of scope (blocked on Requests module not yet built): wiring approval-needed / approval-outcome emails and IH upload UI. 10 MB enforcement is included here as a shared upload constraint.

---

## Part A — Sub-batch 4B-PDF (payslip PDFs + upload limits + reminders)

### A1. Payslip PDF generation

**Schema** (migration):
- `ALTER TABLE public.ih_payslips ADD COLUMN pdf_path text, ADD COLUMN pdf_generated_at timestamptz, ADD COLUMN pdf_error text`.

**Edge function** `ih-generate-payslip-pdf`:
- Input: `{ payslip_id }`. Auth: service role (called from `payslipRepo.generateForRun` and retry endpoint).
- Uses `pdf-lib` (npm:) to render a single-page A4 payslip: header (AIHQ logo text, "CONFIDENTIAL"), staff name + period, earnings table (base, allowances, claims), deductions (EPF, SOCSO), net pay, generated-at footer. Pulls data via service-role Supabase client from `ih_payslips` + `ih_staff_profiles` + `ih_payslip_items` (existing).
- Uploads to `payslips` bucket at path `<user_id>/<payslip_id>.pdf`.
- Writes `pdf_path` + `pdf_generated_at` on success, `pdf_error` on failure. Never throws (failure is logged, not propagated, so payroll finalization is preserved per §32).

**Repo wiring** (`payslipRepo.generateForRun`):
- After each payslip insert, invoke `ih-generate-payslip-pdf` (fire-and-forget). Only call `payslipReadyEmail` after the PDF call returns OK; if PDF fails, still send the email but log the failure (email already correctly says "view in portal").

**UI**:
- `PayslipDetail.tsx`: add "Download PDF" button — calls `supabase.storage.from('payslips').createSignedUrl(pdf_path, 60)`. Disabled with tooltip "Generating…" when `pdf_path` is null.
- `AdminPayslips.tsx`: add column showing PDF status (✓ / ⚠ failed / … pending) + per-row "Regenerate PDF" button (admin-only).

**Bucket policies**: already correct (`20260530192359` migration). No change.

### A2. 10 MB upload limit (§24)

- `ALTER` the `request-attachments` storage bucket via management API to set `file_size_limit = 10485760` and `allowed_mime_types = {image/*, application/pdf}`.
- Same for `payslips` bucket (10 MB cap, `application/pdf` only).
- Document the limit in a single shared constant `MAX_UPLOAD_BYTES = 10 * 1024 * 1024` in `src/lib/internal-hub/constants.ts` for client-side pre-check when upload UI lands.

### A3. Payroll & Notion reminder emails (§6 items 7 & 8)

**Edge function** `ih-scheduled-reminders` (single function, runs daily via pg_cron at 09:00 MYT):
- **Payroll reminder**: if today is day 25 of month and no payroll run for current month is finalized → send `payroll_reminder` email to all `ih_user_roles.role='admin'`.
- **Notion readiness**: query `ih_staff_profiles` where `status='Active'`, `notion_unlocked_at IS NULL`, and `join_date + interval '1 month' <= today` → for each, send `notion_readiness` email to admins listing the staff name.
- Both use `ih-send-email` with link-to-portal templates. Idempotency key includes date so each reminder fires at most once per day.

**Dispatcher helpers** added to `email/dispatcher.ts`: `payrollReminderEmail(adminEmails, runMonth)`, `notionReadinessEmail(adminEmails, staffName, staffId)`.

**Cron schedule** (insert via SQL insert tool, not migration, since URL+anon key are project-specific):
```
select cron.schedule('ih-scheduled-reminders-daily', '0 1 * * *',
  $$ select net.http_post(url:='…/ih-scheduled-reminders', headers:='…', body:='{}'::jsonb); $$);
```

### A4. Admin PDF/upload failure visibility (§33)

Reuse existing `/staff/admin/email-log`. Add a small "Payslip PDF status" tile to `AdminPayslips.tsx` that filters payslips by `pdf_error IS NOT NULL` with a retry button.

---

## Part B — Sub-batch 4B-Calendar (Google Calendar leave/MC sync)

### B1. Connection

Use the existing `google_calendar` connector (developer/workspace account hosts one shared team calendar). Plan assumes connection is already linked; if not, the agent calls `standard_connectors--connect` at execution time.

**Settings**:
- New row in a 1-row config table `ih_calendar_config (id, calendar_id text, enabled boolean, updated_at)`. Admin sets `calendar_id` via a small page `/staff/admin/calendar-settings.tsx` that lists `calendarList` from the gateway and lets admin pick one. RLS: admin-only read/write.

### B2. Edge function `ih-calendar-sync`

Single function handling create / update / delete:
- Input: `{ action: 'upsert' | 'cancel', request_id }`.
- Fetches the `ih_requests` row (must be type leave or MC; must be in approved/accepted state for upsert).
- Reads `ih_calendar_config.calendar_id`. If disabled or unset → no-op, log skip.
- Builds event payload per §17–§21:
    - `summary = "<Staff Name> — Leave"` or `"— MC"`
    - `description` = empty (no reason, no medical, no attachments per §21)
    - Full-day → `start.date`/`end.date` (all-day per §18)
    - Half-day → timed event 09:00–13:00 (morning) or 14:00–18:00 (afternoon); if unspecified, 09:00–13:00 generic block (per §19)
- Stores `gcal_event_id` on the request row.
- On `cancel` or correction → DELETE the event via gateway and clear `gcal_event_id`.

**Schema** (migration):
- `ALTER TABLE public.ih_requests ADD COLUMN gcal_event_id text, ADD COLUMN gcal_sync_error text, ADD COLUMN half_day_slot text` (nullable: `'morning' | 'afternoon' | null`).
- `CREATE TABLE public.ih_calendar_config (...)` + GRANT + RLS admin-only.

### B3. Trigger points (§16, §20)

Since IH Request UI is still a stub, sync is wired at the **repo / RPC** layer so it activates the moment Requests ships:
- On `ih_requests.status` transition to `approved` (leave) or `accepted` (MC): call `ih-calendar-sync` with `action='upsert'`.
- On transition away from approved/accepted (corrected, cancelled, rejected-after-approval): call `action='cancel'`.

Implemented as a Postgres trigger that calls `pg_net.http_post` to the edge function (preferred — works regardless of which code path mutates the row). Trigger only fires on `OLD.status IS DISTINCT FROM NEW.status` and only for request types `'leave'` / `'mc'`.

### B4. Privacy guardrails

Edge function defensively strips `notes`, `reason`, `attachments` — only `summary` and dates leave the function. Unit test in `supabase/functions/ih-calendar-sync/sync_test.ts` asserts the outgoing body never contains the words "reason", "medical", or any attachment URL.

### B5. Admin visibility

Reuse pattern from EmailLog: small `ih_calendar_sync_log` table (event_type, request_id, status, error, created_at) with admin SELECT. Tile added to `/staff/admin` index showing recent failures with retry button.

---

## Files (new / edited)

### Part A (PDF)
- New: `supabase/functions/ih-generate-payslip-pdf/index.ts`
- New: `supabase/functions/ih-scheduled-reminders/index.ts`
- New: `src/lib/internal-hub/constants.ts` (MAX_UPLOAD_BYTES)
- Edited: `src/lib/internal-hub/repos/payslipRepo.ts`, `src/lib/internal-hub/email/dispatcher.ts`, `src/pages/staff/hub/payslips/PayslipDetail.tsx`, `src/pages/staff/hub/admin/payroll/AdminPayslips.tsx`, `supabase/config.toml`
- Migration: pdf columns on ih_payslips + bucket file_size_limit/MIME via management API

### Part B (Calendar)
- New: `supabase/functions/ih-calendar-sync/index.ts` + `sync_test.ts`
- New: `src/pages/staff/hub/admin/CalendarSettings.tsx`
- Edited: `src/App.tsx`, `src/pages/staff/hub/StaffHome.tsx` (admin tile)
- Migration: gcal columns on ih_requests, ih_calendar_config table, ih_calendar_sync_log table, trigger on ih_requests status change

---

## Acceptance after both sub-batches

Doc 4.2 score projection: **~95%** (41/43).
- Email: 12/12 Pass
- Calendar: 9/9 Pass (with caveat that triggers fire once Requests UI exists)
- File storage: 10/10 Pass (10 MB enforced at bucket; UI Partial→N/A pending Requests module)
- Payslip PDF: 7/7 Pass
- Scope control: 5/5 Pass

Remaining gap rows 4, 5, 22–27 (approval email wiring + upload UI) explicitly blocked on **Requests module** — recommend tracking under Doc 2.x build, not Doc 4.2.

## Risks

- **Google Calendar OAuth scope**: connector must include `https://www.googleapis.com/auth/calendar`. If missing, reconnect flow is triggered at execution time.
- **pg_net trigger calling edge function**: requires `pg_net` extension enabled and the service-role JWT stored in Vault for auth header. Will use same pattern as `process-email-queue` cron.
- **PDF rendering inside Deno**: `pdf-lib` works under `npm:` specifier; tested. No native deps needed.
