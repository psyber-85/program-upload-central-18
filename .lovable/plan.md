## Patch 001 — gap analysis & implementation plan

### Gap matrix (audit of Patch 001 §1–§24 against shipped code)

| § | Topic | Current state | Action |
|---|---|---|---|
| 3 | Build phase naming | implicit | Memory note only |
| 4 | MC calendar sync | `buildSummary` handles `mc`; tests pass | None — compliant |
| 5 | Payslip PDF boundary | `ih-generate-payslip-pdf` + System Issues retry | None |
| 6 | Insurance notes admin-only | column-level GRANT restricts to admin | None |
| 7 | Company Tools vs access checklist | lifecycle owns checklist | None |
| 8 | Finance Snapshot non-accounting | enforced by Doc 3.3 + memory | None |
| 9 | Audit consolidation | Doc 4.3 audit log + §6 audit calls shipped | None |
| 10 | Scheduled-jobs boundary | `ih-scheduled-reminders` exists | Add code-comment + audit |
| 11 | Payroll cadence (25/26/27–28/29) | Day-25 reminder only | **Add day-26 draft prep + day-29 finalize reminder** |
| 12 | Notion unlock reminder | Implemented daily | None |
| 13 | Carry-forward AL expiry | Schema lacks carry-forward + expiry fields, no job | **Add `al_carry_forward` + `al_carry_forward_expires_on` columns; expiry job** |
| 14 | Acknowledgment reminder | None | **Add weekly ack-reminder digest to admins** |
| 15–17 | Email/cal/PDF retry visibility | Manual retry in System Issues | None (auto-retry deferred per §15) |
| 18 | File upload failure | Not tracked (no failure surface) | Out of scope |
| 19 | System Issues view | Admin-only, exists | None |
| 21 | Scheduled-job audit-readiness | Reminders don't log audit | **Add `logSystemAudit` for each scheduled action** |

### Edits

**1. Migration — leave balance carry-forward fields + system audit RPC**
- `ALTER TABLE public.ih_leave_balances ADD COLUMN IF NOT EXISTS al_carry_forward integer NOT NULL DEFAULT 0;`
- `ALTER TABLE public.ih_leave_balances ADD COLUMN IF NOT EXISTS al_carry_forward_expires_on date;`
- Create `public.ih_log_system_audit(_action, _target_table, _target_id, _summary, _metadata)` SECURITY DEFINER — inserts into `ih_audit_log` with `actor_id=NULL`, `actor_role='system'`. Grant EXECUTE to `service_role` only.

**2. `supabase/functions/ih-scheduled-reminders/index.ts` — extend (single file, additive only)**
Add these branches; each idempotent via `idempotencyKey`:
- **Day 26 — draft prep**: insert into `ih_payroll_runs` `(month=monthKey, status='Draft')` if no row for the month; log `payroll.draft_prepared` via system-audit RPC. Never finalize (§11).
- **Day 29 — finalize reminder**: if current-month run isn't `Finalized`/`Locked`, send admins a reminder email (idempotency `payroll-finalize-reminder-{month}-{date}`); log `payroll.finalize_reminder_sent`.
- **Daily — carry-forward AL expiry**: select balances where `al_carry_forward > 0 AND al_carry_forward_expires_on < today`; per row set `al_carry_forward=0`, clear `al_carry_forward_expires_on`; log `leave.carry_forward_expired` with staff_id + amount.
- **Weekly (Mon) — ack reminder digest**: find ack-required notices unarchived, created ≥3 days ago, with at least one pending recipient; send one admin digest email (idempotency `ack-reminder-digest-{isoWeek}`); log `notice.ack_reminder_sent`.
- Top-of-file comment references Patch 001 §10–§21.

**3. Memory**
- New file `mem://internal-hub/patch-001` — capture the 6 alignment rules + scheduled-job boundaries (read-last authority).
- Update `mem://index.md` adding "Patch 001 (Alignment & Scheduled Jobs)" reference + a Core line: "Scheduled jobs may prepare/remind/expire/retry/flag only — never auto-finalize payroll or make high-impact decisions."

### Out of scope (deliberately untouched)
- /marketing, main site, CRM, Placement Portal, registration tracker.
- No new product modules (LMS/HRMS/observability/password manager).
- No auto-retry for email/calendar/PDF (§15 allows "still visible" as sufficient).
- No file-upload failure tracker (§18) — no failure surface to wire today.
- No cron scheduling SQL — existing scheduling infrastructure for `ih-scheduled-reminders` is assumed; we only extend its body.
- Doc 0.1–4.3 not rewritten (per §22).

### Acceptance check (§24)
All alignment bullets already pass; scope-control bullets preserved; scheduled-job bullets satisfied after edit #2; audit-readiness satisfied by the `logSystemAudit` calls.
