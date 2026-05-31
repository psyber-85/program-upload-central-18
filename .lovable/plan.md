
# Patch 002 — Statutory Splits & Payslip Format

Applies the `patch-workflow` skill: gap-analysis first, surgical edits, no scope creep beyond payroll/payslip/finance-snapshot.

## Gap Analysis (what exists vs what Patch 002 requires)

| Area | Today | Required |
|---|---|---|
| Statutory items | EPF + SOCSO only (employee). Schema has `employer_epf`/`employer_socso` but no UI/repo use of employer side. | EPF + SOCSO + **EIS**, each split employee / employer. |
| Staff profile rates | `epf_rate`, `socso_rate` | Add `eis_rate` (+ optional `employer_*_rate` defaults). |
| Payroll item | `epf`, `socso`, `employer_epf`, `employer_socso`, `claims_total`, `training_total` | Add `eis`, `employer_eis`, `bonus_total`, `other_addition_total`, `total_employee_deductions`, `total_employer_contribution`. |
| Net Pay formula | `base − epf − socso + claims + training + adj` | `base − (epf+socso+eis) + claims + training + bonus + other + adj`. Employer contributions never reduce net pay (already true). |
| Income vs additions | "Claims/Training" displayed as +rows alongside EPF/SOCSO | Separate sections: **Income** (Basic only), **Claims/Reimb/Bonus**, **Employee Deductions**, **Net Pay**, **Employer Contributions**. |
| Payslip UI | Flat row list incl. EPF/SOCSO/Claims/Training | Re-section per §21. |
| Payslip PDF | Single table mixing earnings + deductions; no signature line present (good) | Rebuild rows per §25 sections; rename labels. Signature already absent — verify only. |
| Finance Snapshot | `epf_socso_total` aggregated from `employer_epf + employer_socso` | Replace with: employee statutory total, employer statutory total, EPF/SOCSO/EIS totals, bonus total. Mark legacy `epf_socso_total` deprecated (keep column, populate as sum for back-compat). |
| Staff "My Profile" | Already does NOT expose salary fields | OK — no change. |

Confirmed unaffected (do not touch): requests, leave/MC, claim approval, training fund, notices, resources, auth, calendar sync, AI extraction, `/staff/marketing/**`, marketing components.

## Plan

### 1. DB migration (additive only — no drops)
New migration adds:
- `ih_staff_profiles`: `eis_rate numeric DEFAULT 0.2`, optional `employer_epf_rate`, `employer_socso_rate`, `employer_eis_rate` (nullable; if null, payroll uses sensible defaults at calc time).
- `ih_payroll_items`: `eis numeric DEFAULT 0`, `employer_eis numeric DEFAULT 0`, `bonus_total numeric DEFAULT 0`, `other_addition_total numeric DEFAULT 0`, `total_employee_deductions numeric DEFAULT 0`, `total_employer_contribution numeric DEFAULT 0`.
- `ih_payslips`: same six columns as payroll items.
- `ih_finance_snapshots`: `employee_statutory_total`, `employer_statutory_total`, `epf_total`, `socso_total`, `eis_total`, `bonus_total` (all numeric DEFAULT 0). Keep `epf_socso_total` (deprecated; back-fill = employer EPF+SOCSO).
- Re-apply column-level GRANT/REVOKE for new sensitive staff columns matching existing pattern in `20260530192359_*`.
- Update the change-detect triggers in `20260530185559_*` to also include `eis_rate` (and employer rate columns if added).

### 2. Types (`src/lib/internal-hub/types.ts`)
- `StaffProfile`: add `eisRate: number` and optional employer rate fields.
- `PayrollItem`: add `eisAmount`, `employerEpf`, `employerSocso`, `employerEis`, `bonusTotal`, `otherAdditionTotal`, `totalEmployeeDeductions`, `totalEmployerContribution`. Add `'eisRate'` to `PayrollMissingField`.
- `Payslip`: same new fields.
- `FinanceSnapshot`: add new totals; keep `epfSocsoTotal` for compatibility but mark deprecated in comment.

### 3. Payroll repo (`payrollRepo.ts`)
- `missingFor`: include `eisRate`.
- `buildItem`: compute EIS (employee + employer), employer EPF/SOCSO defaults, totals; initialise `bonusTotal=0`, `otherAdditionTotal=0` (bonus enters via Manual Adjustment until a bonus workflow exists — patch §27 forbids bonus approval workflow, so we expose a numeric field editable by admin in the row, no approval).
- `computeNetPay`: `base − (epf+socso+eis) + claims + training + bonus + other + adj`.
- `mapItem` / `itemToDb`: map all new columns.
- New mutator `setBonus(runId, staffId, amount, note)` and `setOtherAddition(runId, staffId, amount, note)`. Stored in `notes`-adjacent JSON or as numeric columns directly (using new columns).
- Recompute totals (`total_employee_deductions`, `total_employer_contribution`) on every write.

### 4. Payslip repo + PDF
- `payslipRepo.generateForRun`: copy all six new fields from payroll item.
- `mapRow`: read new fields.
- `ih-generate-payslip-pdf` edge function: redesign rows into 5 sections per Patch §25:
  1. **Income** — Basic Salary; Total Income.
  2. **Claims / Reimbursements / Bonus** — Claim, Training Claim, Bonus, Other (skip lines that are 0); subtotal.
  3. **Employee Deductions** — EPF, SOCSO, EIS; Total Employee Deductions.
  4. **Net Pay** — bold line.
  5. **Employer Contributions** — Employer EPF, Employer SOCSO, Employer EIS, Total Employer Contribution.
  Add Manual Adjustment line near Net Pay if present. No signature line (verify still absent).

### 5. Payslip UI (`PayslipDetail.tsx`)
- Replace flat `Row` list with section blocks matching PDF; each section has its own header and totals row. Reuse existing `Card`/typography, no new design tokens.

### 6. Admin Payroll Run Detail (`PayrollRunDetail.tsx`)
- Update formula caption to new Net Pay formula.
- Add EIS line, employer EPF/SOCSO/EIS lines, bonus/other inputs per row.
- Add inline numeric inputs (admin only) for: EIS override, employer overrides, bonus, other addition. Each override should accept reason via existing manual-adjustment pattern (kept simple — write `notes` augmented or store the values directly since the patch §6 only requires reason + actor + timestamp for *statutory* overrides; capture reason in `notes` field).

### 7. Finance Snapshot (`financeSnapshotRepo.ts`, `FinanceSnapshotDetail.tsx`, `FinanceIndex.tsx`)
- Aggregate using new columns: sum EPF (employee+employer? — patch §22 says "EPF total" without specifying side; use employee + employer = total EPF outflow, document in note), SOCSO total, EIS total, employee statutory, employer statutory, bonus total.
- Replace "EPF/SOCSO" stat with three stats: "Employee statutory", "Employer statutory", and per-fund totals (compact list). Keep snapshot non-accounting disclaimer.

### 8. Staff form (`StaffFormFields.tsx`)
- Add EIS rate input (admin-only section). Optionally add employer rate fields (collapsed under "Employer defaults" section). Default values: EPF 11, SOCSO 0.5, EIS 0.2 / employer EPF 13, SOCSO 1.75, EIS 0.2 (defaults only — admin may override per payroll row).

### 9. Seed (`seed.ts`)
- Add `eisRate: 0.2` to seeded staff.

## Out of scope (per Patch §27)
- No PCB/MTD, no statutory filing, no bank payment, no accounting ledger, no bonus approval workflow, no public-holiday automation, no signature workflow.
- No auth, calendar, AI, marketing, notices, requests, leave changes.

## Acceptance check (mirrors Patch §29)
After build, verify:
- EPF/SOCSO/EIS each with employee + employer fields exist in DB + types + payroll item + payslip.
- Net Pay never includes employer contributions; claims/bonus don't increase Total Income.
- Payslip UI + PDF render the 5 sections; no signature line.
- Finance Snapshot exposes employee statutory total, employer statutory total, and per-fund totals.
- `/staff/marketing/**` untouched.

## Notes
- Migration is additive; existing finalized runs / payslips retain old values (new columns default 0). No back-fill required by the patch.
- `epf_socso_total` column kept (deprecated) to avoid touching any external readers; new code reads the new totals.
- Default rates chosen so existing rows continue to compute identically until admin enters EIS.
