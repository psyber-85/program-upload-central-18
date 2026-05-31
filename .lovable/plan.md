# Internal Hub — Spec Gap Fix Plan

Closes the 9 gaps from the audit. Grouped by risk/severity. No scope creep — only what the docs already require.

## Phase 1 — High severity (Requests & Leave correctness)

### 1. Human-readable request reference numbers (Doc 2.1)
- Add `reference_no TEXT UNIQUE` to `ih_requests`.
- Create sequence `ih_request_ref_seq` + trigger that assigns `REQ-YYYYMM-NNNN` on INSERT.
- Backfill existing rows.
- Surface in `RequestsIndex.tsx` list/detail and notice/email templates that reference a request.

### 2. Overlapping leave prevention (Doc 2.2)
- In `requestRepo.create`, before insert: query `ih_requests` for same `staff_id`, kind in `('AnnualLeave','SickLeave','UnpaidLeave')`, status in `('Submitted','Approved')`, with date-range overlap.
- Throw a typed `OverlappingLeaveError` → caught in form, shown inline.
- Add a DB-level `EXCLUDE USING gist` constraint as defense-in-depth.

### 3. Weekend exclusion in leave duration (Doc 2.2)
- Add `lib/internal-hub/leaveDays.ts` with `countWorkingDays(start, end, halfDaySlot?)` excluding Sat/Sun.
- Use it in request form (live duration preview) and in `requestRepo.create` to persist `working_days` on the row.
- Leave public-holiday calendar as a TODO hook (spec marks "public holiday readiness", not active enforcement) — pass an empty array but expose the parameter.

### 4. Training fund annual cycle (Doc 2.3)
- Already-existing `sp_training_entitlements` is the SP-side equivalent — mirror as `ih_training_entitlements (staff_id, year, allotted_amount, used_amount, carried_in, updated_at)`.
- On `TrainingApplication` approval: insert `pending_amount`; on `TrainingClaim` approval+payroll-inclusion: convert pending → used.
- Show balance in Request form ("Training fund remaining: RM X / RM Y for 2026").
- Block submission when `requested > remaining` unless admin override flag set.

## Phase 2 — Medium severity (balance wiring + payroll math)

### 5. AL / SL balance display & deduction (Doc 2.2)
- `ih_leave_balances` already exists; wire up:
  - On approve: decrement; on cancel-after-approve: re-credit (idempotent via `request_id` ledger column).
  - Show balances on `StaffHome` + leave request form header.
- Add monthly carry-forward / new-joiner prorate per memory `mem://staff-portal/approval-and-leave-balance-mechanics`.

### 6. Claim auto-approval guardrails (Doc 2.3)
- Add `claim_auto_approve_threshold` to a small config (constant for now, RM 50).
- In `requestRepo.create` for `Claim`: if `amount <= threshold` AND attachment present AND not flagged → set `status='Approved'`, `auto_approved=true`, audit-log.
- Anything over threshold or missing proof stays `Submitted` and hits admin queue.

### 7. Employer EPF / SOCSO calculation (Doc 3.1)
- Add `employer_epf_rate`, `employer_socso_rate` to `ih_staff_profiles` (defaults 13%, configurable).
- In `payrollRepo.preparePayroll`: compute `employer_epf`, `employer_socso`; persist into `ih_payroll_items`.
- Fix `total_company_cost = base + claims + training_claims + employer_epf + employer_socso` (not + employee deductions).
- Update payslip PDF "Employer contributions" line.

### 8. Finance Snapshot EPF/SOCSO autofill (Doc 3.3) — downstream of #7
- `financeSnapshotRepo` already sums `employer_epf + employer_socso` from payroll items → becomes correct once #7 lands. Verify with a snapshot for the current month.

## Phase 3 — Low severity

### 9. MC distinct accept/reject (Doc 2.2)
- Add admin action labels: "Accept MC" / "Reject MC" when `kind='SickLeave'` with attachment, mapping to `Approved` / `Rejected` under the hood (no new status, just clearer UX + audit summary text).

## Technical details

**Migrations (one per phase to keep blast radius small):**
- `M1`: alter `ih_requests` (`reference_no`, `working_days`, `auto_approved`); add `ih_request_ref_seq` + trigger; backfill; add GiST overlap constraint.
- `M2`: create `ih_training_entitlements` (+ GRANT to `authenticated` read-own/admin-all, RLS, service_role).
- `M3`: alter `ih_staff_profiles` add employer rate columns; alter `ih_payroll_items` add `employer_epf`, `employer_socso`.

**Code touch list:**
- `src/lib/internal-hub/repos/requestRepo.ts` — overlap check, working_days, auto-approve
- `src/lib/internal-hub/repos/claimRepo.ts` — threshold logic
- `src/lib/internal-hub/repos/payrollRepo.ts` — employer contrib calc, total_company_cost fix
- `src/lib/internal-hub/repos/leaveBalanceRepo.ts` (new) — ledger-style debit/credit
- `src/lib/internal-hub/leaveDays.ts` (new)
- `src/pages/staff/hub/requests/*` — show balances, reference_no, training remaining
- `src/pages/staff/hub/StaffHome.tsx` — show AL/SL balances
- `supabase/functions/ih-generate-payslip-pdf/index.ts` — employer contrib line

**Invariants honored:**
- RLS preserved (overlap query uses `auth.uid()`), GRANTs included in every new table.
- No scheduled-job auto-finalize (Patch 001).
- No PDF email attachments (Doc 3.2).
- Payroll lock after finalize untouched.

**Memory updates after ship:**
- Update `mem://internal-hub/payroll-doc-3.1` with employer EPF/SOCSO formula.
- Append claim auto-approval threshold + leave overlap rule to existing IH memories.

## Out of scope (deliberately)
- Public holiday calendar source (hook only).
- Multi-approver workflows.
- AI extraction (still deferred per Doc 4.3).
- Any SP / placement / marketing surfaces.

## Suggested execution order
Phase 1 → Phase 2 → Phase 3, with a verify pass after each (one snapshot, one payroll dry-run, one leave request) before moving on.
