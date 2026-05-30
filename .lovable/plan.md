# Plan — Ship Docs 4.1 / 4.2 / 4.3 (Internal Hub, /staff only)

Scope strictly limited to `/staff/*` (Internal Hub). `/staff/marketing` and the main site are untouched (per Core memory).

This is large. I'll ship in **5 phases** so each is reviewable. After each phase you can test and approve the next.

---

## Phase 1 — Critical security / RLS fixes (DB-only, fastest win)

Single migration. No app code needed.

1. **Tighten `ih_requests` self-update WITH CHECK** — prevent staff self-approving.
   `WITH CHECK (staff_id = auth.uid() AND status = 'Submitted')`
2. **Revoke staff column access to sensitive fields** on `ih_staff_profiles`:
   `REVOKE SELECT (salary_base, epf_rate, socso_rate, admin_notes, insurance_notes) FROM authenticated`
   (Admin reads via `has_ih_role`; staff use `ih_staff_profiles_self` view.)
3. **Hard-delete protection** on `ih_notices` and `ih_resources` — split admin `FOR ALL` into INSERT/UPDATE/SELECT only; add `BEFORE DELETE` trigger that raises (force soft-delete via `archived_at`).
4. **Add `archived_at`** to `ih_notices` (matches `ih_resources` pattern). Update RLS to filter it.
5. **Add explicit DELETE policy** for `ih_request_attachments` (owner + admin).
6. **Create `payslips` private storage bucket** + owner/admin RLS.

---

## Phase 2 — Repo → Supabase swap (the Critical blocker)

Replace `localStorage` data layer with Supabase across 13 repos in `src/lib/internal-hub/repos/*`. Only `/staff` hub pages affected.

Order (dependency-first):
1. `staffRepo` → `ih_staff_profiles` + `ih_staff_profiles_self` view
2. `noticeRepo` → `ih_notices`, `ih_notice_reads`, `ih_notice_acks`
3. `resourceRepo` → `ih_resources`
4. `requestRepo` / `claimRepo` / `requestSummaryRepo` → `ih_requests` + `ih_request_attachments` (Supabase Storage uploads)
5. `payrollRepo` → `ih_payroll_runs`, `ih_payroll_items`
6. `payslipRepo` / `payslipSummaryRepo` → `ih_payslips`, `ih_payslip_downloads`
7. `financeSnapshotRepo` → `ih_finance_snapshots`
8. `toolAccessRepo` / `onboardingRepo` / `offboardingRepo` → `ih_tool_access`, `ih_access_checklist`
9. `welcomeEmailRepo` → `ih_welcome_emails`

Each repo keeps the same exported function signatures so calling components don't change. `storage.ts` localStorage helpers stay as a no-op shim for any unmigrated callers, then deleted in Phase 5 cleanup.

---

## Phase 3 — Doc 4.2 integrations

1. **Notices email fanout** — `ih-broadcast-notice` edge function: on insert with `email_required=true`, resolve audience from `ih_staff_profiles`, SendGrid send via existing `SENDGRID_API_KEY`/`FROM_EMAIL`. In-app record persisted even if SendGrid fails.
2. **Upload validation** — client-side guard in request/claim upload paths: `accept="image/png,image/jpeg,application/pdf"`, `file.size ≤ 10 MB`. Reject before upload.
3. **Payslip PDF generation** — `ih-generate-payslip-pdf` edge function using `pdf-lib` (Deno). Triggered on payroll finalize. Writes to `payslips` bucket, stores path in `ih_payslips.pdf_path`. `payslipRepo.downloadPdf()` issues signed URL.
4. **Payslip email** — uses portal-link rule (per mem://internal-hub/payslips-doc-3.2: no PDF email attachments). Existing `send-payslip-notification` already conforms — add a "View payslip" link to `/staff/hub/payslips`.
5. **Google Calendar sync** — `ih-sync-leave-calendar` edge function. **Requires user to supply Google service-account JSON + calendar ID.** I'll set up the function shell and ask for the secret when Phase 3 starts.

---

## Phase 4 — Doc 4.3 hardening

1. **`ih_audit_log` table** (immutable, admin-read-only): `id, actor_id, action, entity, entity_id, payload jsonb, created_at`. INSERT-only RLS; no UPDATE/DELETE policies.
2. **`ih_system_issues` table** for operational errors (edge function failures, SendGrid failures, etc.). Admin-only.
3. **Admin pages**:
   - `/staff/hub/admin/audit-log` — filter by actor/entity/date.
   - `/staff/hub/admin/system-issues` — list with status (Open/Resolved).
4. **Audit writes** — wrap admin mutations (approve/reject request, archive notice, finalize payroll, deactivate staff) via a small `auditRepo.write()` helper.
5. **Deactivation realtime** — `AuthContext` subscribes to own `ih_staff_profiles` row; logout if `status='Inactive'`.

---

## Phase 5 — Optional AI extraction (Doc 4.3 §3.9–3.14)

1. Add `ai_extracted boolean`, `ai_confidence numeric`, `ai_review_state text` to `ih_request_attachments`.
2. `ih-extract-receipt` edge function using `LOVABLE_API_KEY` (Gemini vision). Pulls amount/date/vendor. Always editable; manual fallback preserved.
3. UI: "Auto-fill from receipt" button in claim form; confidence badge; required review if confidence < 0.7.

---

## Out of scope (will NOT touch)

- `/staff/marketing` and all marketing components
- `src/pages/Index.tsx` and main site routes
- CRM tracker public-access flows
- Placement portal
- Any `auth.users`, `storage`, `realtime` schema changes

---

## Technical notes

- **No new secrets needed for Phases 1, 2, 4.** SendGrid secrets already set for Phase 3.1. Phase 3.5 (calendar) and Phase 5 (AI) will request secrets at their respective phases.
- **Migrations are additive and reversible.** No data loss; localStorage data is mock/seed only.
- **Each phase is independently deployable** — you can stop after any phase.

---

## Suggested first step

Approve this plan, and I start with **Phase 1** (the security-tightening migration). It's contained, reviewable, and unblocks everything else without touching app code.