# Sub-batch 2D — Payroll, Claims & Payslips → Supabase

Final migration of the localStorage repos in the Internal Hub data layer. After this, every Card 1.x/3.x flow is RLS-enforced.

## Schema additions (one migration)

Existing `ih_payroll_runs`, `ih_payroll_items`, `ih_payslips`, `ih_payslip_downloads` are close but missing several Doc 3.1/3.2 fields. Add columns (no breaking changes):

```sql
ALTER TABLE public.ih_payroll_runs
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.ih_payroll_items
  ADD COLUMN IF NOT EXISTS row_status text NOT NULL DEFAULT 'Complete',  -- 'Complete' | 'Incomplete'
  ADD COLUMN IF NOT EXISTS missing_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS adjustment jsonb,                              -- { amount, reason } | null
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS included_claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS included_training_claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.ih_payslips
  ADD COLUMN IF NOT EXISTS staff_name text,
  ADD COLUMN IF NOT EXISTS adjustment jsonb,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'Available',
  ADD COLUMN IF NOT EXISTS correction_ref text;

-- Reminder log: replace localStorage idempotency with a tiny admin-only table
CREATE TABLE IF NOT EXISTS public.ih_payroll_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ih_payroll_reminders TO authenticated;
GRANT ALL ON public.ih_payroll_reminders TO service_role;
ALTER TABLE public.ih_payroll_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_payroll_reminders admin only" ON public.ih_payroll_reminders
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));
```

No new tables otherwise — `ih_requests` (kind='Claim') backs claims.

## Repo rewrites (all async)

### 1. `claimRepo.ts`
Backed by `ih_requests` where `kind='Claim'`. Payload stores `{ amount, description, type: 'Claim'|'TrainingClaim', inclusionState, includedInPayrollRunId, includedInMonth }`.
- `list()`, `queueableForMonth(month)` (status='Approved' AND payload->>'inclusionState' ≠ 'IncludedInPayroll' AND decided_at < first-of-month).
- `markIncluded(ids, runId, month)` → bulk update payload jsonb.
- `setStateForRun(runId, state)` → filter by `payload->>'includedInPayrollRunId'`.
- `addManual(input)` → insert row, `status='Approved'`, `decided_at=now`.

### 2. `payrollRepo.ts`
Backed by `ih_payroll_runs` + `ih_payroll_items`. All methods async:
- `listRuns`, `getRun`, `getForMonth`, `statusFor`.
- `getOrCreateDraft(month)` — load Active staff, queueable claims, insert run + items in one round trip.
- `refreshRow(runId, staffId)` — rebuild a single item from current staff profile, preserve adjustment/notes.
- `setAdjustment`, `setRunNotes`, `setRowNotes`, `markReadyForReview` — single-field updates.
- `canFinalize` — derive from items.
- `finalize(runId, adminId)` — transaction: set run finalized, call `claimRepo.markIncluded`, generate payslips, broadcast notices.
- `lockRun` — set status='Locked', locked_at/by.
- `ensureReminderForMonth(month, adminId)` — guard via `ih_payroll_reminders` upsert (ON CONFLICT DO NOTHING).

### 3. `payslipRepo.ts`
Backed by `ih_payslips` + `ih_payslip_downloads`. All async:
- `list`, `listAll`, `listForStaff`, `getById`, `forRun`.
- `generateForRun(run)` — insert payslips for rows with row_status='Complete'.
- `downloadPdf(id, actorId, actorRole)` — insert download log, then generate placeholder .txt blob client-side (Doc 3.2 §7 — real PDF is Card 4 / `ih-generate-payslip-pdf`).
- `setCorrectionRef`.

### 4. `payslipSummaryRepo.ts`
Thin wrapper over `payslipRepo.listForStaff` (used by Home preview only). Async; mapping `availability='Available' → status='Ready'`.

## Callsite updates (TanStack Query)
- `StaffHome.tsx` — `payrollRepo.statusFor`, `payslipRepo.listForStaff`, `payrollRepo.ensureReminderForMonth` → `useQuery`/effect.
- `PayrollIndex.tsx` — listRuns + getForMonth via `useQuery`; "Prepare draft" via `useMutation` invalidating both.
- `PayrollRunDetail.tsx` — getRun via `useQuery`; setAdjustment/setRunNotes/setRowNotes/refreshRow/markReadyForReview/finalize/lockRun via `useMutation` with invalidation. Drop `tick` state.
- `PayslipsIndex.tsx`, `PayslipDetail.tsx`, `AdminPayslips.tsx` — async list + download mutation.
- `MyPayslipsPreview.tsx` — already prop-driven; no change.

## Out of scope (deferred)
- Real PDF generation (`ih-generate-payslip-pdf` pdf-lib edge function) — Doc 4.2 sub-batch.
- `ih_audit_log` writes on finalize/lock — Doc 4.3 sub-batch.
- Card 2 request submission UI.

## Verification
- `npm run build` clean.
- Admin: open `/staff/admin/payroll`, "Prepare draft", add adjustment, finalize → payslips appear in `/staff/payslips` for that staff user; notice broadcast.
- Staff: payslip detail loads and download writes one `ih_payslip_downloads` row (verify via SQL).
- No remaining `readJSON`/`writeJSON` references in `repos/payroll*`, `repos/payslip*`, `repos/claimRepo`.
