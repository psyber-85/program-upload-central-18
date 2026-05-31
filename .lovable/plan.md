
## Doc 4.3 — Production Hardening & Audit (scoped to `/staff`)

Implements audit logs, hard-delete protection, System Issues view, and production-readiness baseline. **AI extraction (§16–§24) deferred** — spec calls it "optional" and adds an AI provider dependency that should be its own approval; manual workflows already work. `/marketing` and the main site are untouched.

### 1. Audit log (§5–§10)

**New table `public.ih_audit_log`:**
- Columns: `id`, `action` (text — e.g. `staff.created`, `request.approved`, `payroll.finalized`), `actor_id` (uuid, nullable for system), `actor_role` (text), `target_table` (text), `target_id` (uuid, nullable), `summary` (text), `metadata` (jsonb), `created_at`
- RLS: admin-only SELECT; **no INSERT/UPDATE/DELETE policies for users** — inserts only via SECURITY DEFINER RPC `ih_log_audit(...)` or service-role from edge functions
- `ih_block_hard_delete` trigger attached → immutable from clients
- Retained indefinitely (no TTL)

**Helper:** `src/lib/internal-hub/audit.ts` with `logAudit({ action, targetTable, targetId, summary, metadata })` that calls the RPC. Wired at:
- Staff create / deactivate / role change (already exists in ih-create-staff, ih-deactivate-staff, ih-promote-staff edge functions — add `ih_log_audit` calls there using service role)
- Notice broadcast send (noticeRepo)
- Request approve / reject / needs-correction (requestRepo.decide)
- Payroll finalize / payslip generate (payrollRepo, ih-generate-payslip-pdf)
- Finance snapshot mark-reviewed
- Access checklist updates
- Calendar / email / PDF failures (called from inside edge functions on failure)

### 2. Hard-delete protection (§12)

Single migration extends `ih_block_hard_delete` trigger to all remaining sensitive tables not yet protected:
- `ih_staff_profiles`, `ih_payroll_runs`, `ih_payroll_items`, `ih_payslips`, `ih_finance_snapshots`, `ih_request_attachments`, `ih_leave_balances`, `ih_access_checklist`, `ih_payslip_downloads`, `ih_notice_acks`, `ih_notice_reads`, `ih_email_log`, `ih_calendar_sync_log`, `ih_welcome_emails`, `ih_audit_log` (new), `ih_tool_access`
- Exception per spec: empty staff records with no activity (kept as documentation note — current admin UI uses deactivate, not delete)

### 3. System Issues view (§13–§15)

**New page** `/staff/admin/system-issues` (admin-only, gated by `ProtectedRoute requireAdmin`):
- Unified read across:
  - `ih_email_log` where `status IN ('failed', 'retrying')`
  - `ih_calendar_sync_log` where `status = 'failed'`
  - `ih_payslips` where `pdf_error IS NOT NULL`
  - `ih_welcome_emails` where `status = 'Failed'`
- Filters: issue type, status (Open / Resolved), date range
- Each row shows: type, related table/id, safe error summary, created_at, last attempt
- Retry actions where practical: "Resend email" (re-invoke `ih-send-email` with same idempotency key + `force: true`), "Re-sync calendar" (re-invoke `ih-calendar-sync` upsert), "Regenerate PDF" (re-invoke `ih-generate-payslip-pdf`)
- Strictly Admin-only, operational copy — no engineering log dump

**New repo** `src/lib/internal-hub/repos/systemIssuesRepo.ts` with `list({ type?, status?, since? })` and `retry(issueId, type)`.

### 4. Production readiness baseline (§25)

- Add `mem://internal-hub/hardening-doc-4.3` memory note covering: secrets via Deno.env (no commits), env separation (Supabase project ref isolated), RLS test file at `supabase/functions/_tests/rls_access_test.ts` already exists, hard-delete protection inventory
- Add brief in-app "Operations" admin section in System Issues page header: "Backups are managed by Supabase. To restore, contact wani@theaihq.net."

### 5. Admin navigation

Add "System Issues" entry to admin nav so it's discoverable.

### Out of scope (explicitly)

- **AI extraction (§16–§24)** — deferred. The receipts/MC manual flow built in Doc 4.2 already works. Will revisit if user wants OpenAI/Gemini wired.
- Full observability, alerting, SIEM, DR plan (anti-goals §29)
- Anything outside `/staff`

### Technical notes

- All new tables follow the GRANT → ENABLE RLS → CREATE POLICY ordering
- `ih_log_audit` RPC is SECURITY DEFINER with `SET search_path = public`
- Audit insertions from edge functions use service role directly (bypasses RLS by design)
- Memory updates: new `hardening-doc-4.3.md`; index gets one new line
- No changes to `/marketing`, public site, CRM, placement portal, or `/sp_*` Staff Portal tables

### Files

**Created**
- `supabase/migrations/<ts>_doc_4_3_audit_hardening.sql` (audit table + RPC + hard-delete extension)
- `src/lib/internal-hub/audit.ts`
- `src/lib/internal-hub/repos/systemIssuesRepo.ts`
- `src/pages/staff/hub/admin/SystemIssues.tsx`
- `mem://internal-hub/hardening-doc-4.3`

**Edited**
- `src/App.tsx` — add `/admin/system-issues` route
- `src/components/internal-hub/AdminNav.tsx` (or wherever admin nav lives) — add link
- Existing repos/edge functions — add `logAudit` calls at action points (staffRepo, requestRepo, noticeRepo, payrollRepo, financeSnapshotRepo, edge functions ih-create-staff, ih-deactivate-staff, ih-promote-staff, ih-generate-payslip-pdf, ih-calendar-sync, ih-send-email — failure paths only for the last three)
- `mem://index.md` — append hardening reference

### Expected outcome

Doc 4.3 compliance: 33% → ~90% (only AI extraction §16–§24 remaining, intentionally deferred).
