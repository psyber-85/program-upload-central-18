
# Card 4 implementation — AIHQ Internal Hub

Scope: docs 4.1 (Supabase/Auth/RLS), 4.2 (SendGrid, Google Calendar, file storage, payslip PDFs), 4.3 (audit log, System Issues, hard-delete protection, optional AI extraction).

Hard guarantees (do not violate):
- `/marketing/**`, `src/pages/staff/marketing/**`, `src/components/marketing/**`, the TryHire site, CRM Tracker, Register Tracker, Birthday Dashboard, and `src/_backup/**` are NOT touched.
- Existing `sp_*` Supabase tables (legacy staff portal) remain untouched — Internal Hub gets its own `ih_*` table namespace so the two systems do not collide.
- First Admin: `pang@theaihq.net`. Seeded via Supabase Auth invite. No password is stored anywhere; admin sets their own via password-reset flow.
- Clean seed only. localStorage Internal Hub data is discarded (per Doc 4.1 §25/26). A small "demo seed" script populates Supabase with the first admin + 2 demo staff for QA, gated behind a dev flag.

Because Card 4 is large, it ships in 3 build loops. This plan describes all three; each loop ends in a working, deployable state.

---

## Loop 1 — Doc 4.1 (Supabase + Auth + RLS migration)

### Backend (single migration)

Create `ih_*` schema in `public`. Key tables (all with `GRANT ... TO authenticated; GRANT ALL TO service_role;` + RLS):

```text
ih_app_role            enum('admin','staff')
ih_staff_status        enum('Pending','Active','Inactive')
ih_business_arm        enum('Training','Solutions','Both')

ih_user_roles          (id, user_id, role)                — security-definer has_ih_role()
ih_staff_profiles      (id=auth uid, name, email, role, status, jobTitle, businessArm,
                        joinDate, salaryBase, epfRate, socsoRate, adminNotes,
                        notionUnlockedAt, deactivatedAt, …)
ih_access_checklist    (staff_id, item_key, status, updated_by, updated_at)
ih_tool_access         (staff_id, tool, status, granted_at)
ih_welcome_emails      (staff_id, status, sent_at, failure_reason)

ih_notices             (id, title, body, importance, audience, ack_required,
                        email_required, created_by, created_at, archived_at)
ih_notice_reads        (notice_id, staff_id, read_at)
ih_notice_acks         (notice_id, staff_id, acked_at)

ih_resources           (id, title, category, url, audience, created_at, archived_at)

ih_requests            (id, staff_id, kind, status, payload jsonb, created_at, decided_at,
                        decided_by, decision_note)            -- leave, claim, MC, training, benefit
ih_request_attachments (id, request_id, staff_id, path, size, mime, kind, uploaded_at)
ih_leave_balances      (staff_id, year, al_total, al_used, sl_total, sl_used)

ih_payroll_runs        (id, month, status enum('Draft','Finalized','Locked'),
                        finalized_at, finalized_by, locked_at, locked_by, total_work_days)
ih_payroll_items       (id, run_id, staff_id, base, days_worked, total_days,
                        epf, socso, employer_epf, employer_socso,
                        claims_total, training_total, net_pay, total_company_cost)
ih_payslips            (id, run_id, staff_id, month, base, epf, socso, employer_epf,
                        employer_socso, claims_total, training_total, net_pay, pdf_path)
ih_payslip_downloads   (payslip_id, staff_id, downloaded_at)

ih_finance_snapshots   (id, month, status enum('Draft','Reviewed','Locked'),
                        line_items jsonb, reviewed_at, reviewed_by, locked_at)
```

RLS principles per Doc 4.1 §18–24:
- `has_ih_role(uid, 'admin')` security-definer fn (mirror existing `has_sp_role`).
- `is_active_ih_staff(uid)` returns true only when `ih_staff_profiles.status='Active'`.
- Staff policies: every staff-scoped table requires `staff_id = auth.uid() AND is_active_ih_staff(auth.uid())`.
- Admin policies: `has_ih_role(auth.uid(),'admin') AND is_active_ih_staff(auth.uid())`.
- Sensitive `ih_staff_profiles` columns (`salaryBase`, `epfRate`, `socsoRate`, `adminNotes`) exposed to staff via a `ih_staff_profiles_self` view that omits them; full row only to admins.
- `ih_finance_snapshots`, `ih_payroll_runs`, `ih_payroll_items` — admin only. Staff can SELECT only their own `ih_payslips` rows.
- Notice/resource targeting enforced via policy joining `audience` against staff's `businessArm`.

### Auth

- Enable email+password in Supabase. Disable public signup (auth provider config — already off, just verify).
- Create `/staff/login` page using `supabase.auth.signInWithPassword`. Replace the localStorage role-switcher login.
- Create `/reset-password` route (public) handling `type=recovery`.
- `HubContext` switches from localStorage `currentStaff` to `supabase.auth.getUser()` + a SELECT on `ih_staff_profiles`. `InternalHubLayout` keeps the inactive redirect.
- Admin "Add staff" calls a new edge function `ih-create-staff` (admin-only via JWT check + `has_ih_role`) that uses `service_role` to `admin.inviteUserByEmail`, then inserts `ih_staff_profiles` row + `ih_user_roles` row.
- Admin "Deactivate" sets status=Inactive and calls `ih-deactivate-staff` edge function to revoke active sessions (`auth.admin.signOut(user_id)`).

### Frontend repo migration

Replace each `src/lib/internal-hub/repos/*.ts` localStorage implementation with a Supabase implementation behind the SAME interface so pages don't change. Files touched (logic only):
- `staffRepo`, `onboardingRepo`, `toolAccessRepo`, `welcomeEmailRepo`
- `noticeRepo`, `resourceRepo`
- `requestSummaryRepo` (+ leave/claim/MC/training/benefit sub-flows currently stubbed)
- `payrollRepo`, `payslipRepo`, `payslipSummaryRepo`, `financeSnapshotRepo`, `claimRepo`
- `seed.ts` / `seedNotices.ts` become dev-only seed callable from a hidden admin button (NOT auto-run in prod). `storage.ts` retired.

### Seed/migration

Edge function `ih-bootstrap-admin` (one-shot, refuses to run if any admin already exists): invites `pang@theaihq.net`, inserts profile + admin role.

### RLS tests

`supabase/functions/ih-rls-tests/index.ts` — Deno test using two seeded test users (`alice@…`, `bob@…`) verifying the 11 boundaries listed in Doc 4.1 §27. Runnable via `supabase--test_edge_functions`.

---

## Loop 2 — Doc 4.2 (SendGrid + Calendar + Files + PDF)

### SendGrid (already wired with `SENDGRID_API_KEY`, `FROM_EMAIL`, `SENDGRID_TEMPLATE_ID`)

One edge function `ih-send-email` accepting `{event, to, data}` where event ∈ {`broadcast`, `approval_needed`, `approval_outcome`, `payslip_ready`, `welcome`, `payroll_reminder_admin`, `notion_ready_admin`, `notice_ack_required`}. Sender: `system@theaihq.net` (override `FROM_EMAIL`).

Failure handling: every send writes a row in `ih_email_log (event, to, status, error, related_id, retry_count)`. Failures surface in System Issues (Loop 3). Underlying record (notice, decision, payslip) is created regardless of email outcome.

Triggers (no new product behavior, just wiring):
- Admin broadcast create → email all targets (importance Normal included, per existing memory).
- Request submit by staff → email admin(s) (NOT requester).
- Request decision → email requester.
- Payroll finalize → for each payslip: queue `payslip_ready` after PDF is ready (next section).
- Admin "Add staff" → queue `welcome` email (no password, includes portal link + Notion 1-month note).
- Day-25 cron `ih-payroll-reminder` → email admins if month's payroll still Draft.

### Payslip PDF

- Edge function `ih-generate-payslip-pdf` (called by `finalize`/`lock` of payroll run): renders one PDF per `ih_payslips` row using `pdf-lib` (already in project via `src/lib/pdfGenerator.ts` — reuse), stores in private storage bucket `ih-payslips/{staff_id}/{month}.pdf`, writes `pdf_path` back on the payslip row. After all PDFs succeed, enqueue `payslip_ready` email per staff (portal link only, no attachment per §31).
- Failure → no email sent for failed payslips, row added to `ih_system_issues` (Loop 3), payroll itself stays finalized.

### Private storage buckets

Two new private buckets (not public):
- `ih-attachments` — claim receipts, MC, training proof, benefit attachments. Path: `{staff_id}/{request_id}/{filename}`. RLS via storage policies: owner staff + admin.
- `ih-payslips` — payslip PDFs. Owner staff + admin only.

Client-side upload guard: `image/*` and `application/pdf` only; max 10 MB; clear error on failure (§23/24/27).

### Google Calendar sync

- Add secrets `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON` and `GOOGLE_CALENDAR_ID` (shared team calendar).
- Edge function `ih-calendar-sync` accepting `{action: 'upsert'|'delete', request_id}`. Uses googleapis JWT auth.
- Trigger on approve/accept of leave or MC → upsert event titled `{Name} — Leave` or `{Name} — MC`. All-day for full-day; half-day uses morning (09:00–13:00) or afternoon (13:00–17:00) slot per request payload. No reason/medical info.
- On correction/cancel/reject after acceptance → delete event. Stale event id stored on `ih_requests.calendar_event_id`.
- Sync failure → row in `ih_system_issues`. Request decision still saved.

---

## Loop 3 — Doc 4.3 (Audit + System Issues + AI extraction)

### Audit log

Table `ih_audit_log (id, action, actor_id, actor_role, target_type, target_id, summary, old jsonb, new jsonb, metadata jsonb, created_at)`. Append-only:
- RLS: SELECT admin only, INSERT only via SECURITY DEFINER fn `ih_log_audit(...)`, no UPDATE/DELETE policy (immutable per §9). Indefinite retention.
- Wire `ih_log_audit` calls into existing repos at the events listed in Doc 4.3 §6 (staff create/deactivate/edit, role change, broadcast sent, ack, request decisions, claim-in-payroll, payroll finalize/lock, payslip generate, finance snapshot reviewed/locked, checklist update, file upload, integration failures).
- New admin page `/staff/admin/audit` — simple filterable list (action type, actor, target, date range). Admin-only route guard.

### Hard-delete protection

- All `ih_*` tables already use soft-delete patterns (archived_at, status=Inactive). Strip any remaining `DELETE` calls from repos for operational records. The only allowed hard delete: empty draft staff profile with no activity history (`ih-delete-staff` edge function refuses if any request/payslip/audit row references the staff).

### System Issues view

Table `ih_system_issues (id, type, related_type, related_id, status enum('Open','Resolved'), summary, last_attempt_at, resolved_at, resolved_by, metadata)`.
- Populated by SendGrid, calendar, PDF, file-upload, payroll, RLS failures (caught in edge functions/repos with try/catch).
- Admin page `/staff/admin/system-issues` — filterable list with "Retry" button for retryable types (email, calendar, PDF). Admin-only.

### Optional AI extraction

- Manual trigger only: "Auto-fill from file" button on claim form (receipt) and MC upload form (MC document).
- Edge function `ih-ai-extract` accepts `{file_path, kind}` (kind ∈ `receipt`|`mc`). Uses Lovable AI Gateway (`LOVABLE_API_KEY`, default model). Returns `{fields, confidence?}` for fields per §18: receipt amount/date/merchant; MC date range/clinic; attachment summary.
- UI shows extracted values in an editable "Review extracted values" panel with `Needs review` chip. User must explicitly click Save. AI never auto-submits or auto-decides. If extraction fails, form remains fully manual (§22).
- Audit row written on each extraction run with actor + provider + whether user edited before saving. Sensitive prompts/responses not stored.

### Production deployment readiness

- Document env vars used: `VITE_SUPABASE_*`, `SENDGRID_API_KEY`, `FROM_EMAIL`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON`, `GOOGLE_CALENDAR_ID`, `LOVABLE_API_KEY`.
- README section "Internal Hub production" listing required secrets, the `ih-bootstrap-admin` one-time call, and backup posture (Supabase daily backups + storage retention).

---

## Secrets to request (when each loop is reached)

- Loop 2: `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON`, `GOOGLE_CALENDAR_ID`. `SENDGRID_*` already present.
- Loop 3: `LOVABLE_API_KEY` if not already set (Lovable AI Gateway will be enabled).

## Out of scope (deferred / explicitly anti-goals)

- Multi-tenant, public signup, enterprise IAM, full HRMS/accounting/CRM/LMS.
- Email marketing, notification preferences, full scheduling, document management UI.
- Replacement of legacy `sp_*` tables (they keep working for any non-hub flows).
- AI auto-approval, fraud detection, OCR on every upload.
- Real bank/payment integration, statutory reporting, multi-currency.
- Touching `/marketing`, TryHire, CRM Tracker, Register Tracker, Birthday Dashboard, or any backup files.

## Verification per loop

- Loop 1: `supabase--linter` clean; `ih-rls-tests` all green; login as seeded admin and a demo staff in preview; staff cannot read other staff's request via direct supabase client call.
- Loop 2: send-test broadcast lands in inbox; payroll finalize produces PDF in bucket; approved leave appears on shared calendar; uploading a 15MB jpg is rejected.
- Loop 3: every event in §6 produces an `ih_audit_log` row; killing SendGrid key surfaces a system issue + the underlying notice still saves; "Auto-fill from file" populates fields but Save remains the human's click.

After your approval I'll start Loop 1 (single migration + auth wiring + repo swap + RLS tests). Loops 2 and 3 happen in follow-up messages so each can be reviewed before the next lands.
