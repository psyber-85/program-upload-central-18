# Patch 1.5 — Statutory Payroll Splits & Payslip Format

## Gap analysis (current state vs Patch 1.5)

Patch 1.5 was effectively delivered earlier under the "Patch 002" label. Walking every acceptance test:

### §4–§6 Statutory item model — DONE
- `ih_staff_profiles`: `epf_rate`, `socso_rate`, `eis_rate`, `employer_epf_rate`, `employer_socso_rate`, `employer_eis_rate` all present.
- `ih_payroll_items`: `epf`, `socso`, `eis`, `employer_epf`, `employer_socso`, `employer_eis`, `total_employee_deductions`, `total_employer_contribution`, `bonus_total`, `other_addition_total`, `claims_total`, `training_total`, `net_pay`, `adjustment` (jsonb with reason).
- `ih_payslips`: same statutory split + bonus/other-addition + totals.
- Admin override path: `payrollRepo.updateRow` writes the overridden amount, and `ih_audit_log` captures actor/timestamp via `ih_log_audit`.

### §10–§16 Net Pay / Total Income / Employer formula — DONE
- `payrollRepo.compute()`: `netPay = base - epf - socso - eis + claims + training + bonus + other + adjustment`.
- `totalEmployeeDeductions = epf + socso + eis`; `totalEmployerContribution = employerEpf + employerSocso + employerEis`.
- Total Income shown as Basic Salary only; claims/training/bonus are additions outside Income (PayslipDetail.tsx:101, ih-generate-payslip-pdf:100).

### §17 Signature line — DONE
- Removed from portal payslip and PDF. `rg` finds no signature reference anywhere.

### §21 Payslip section structure — DONE
Sections render in required order in both portal (`PayslipDetail.tsx`) and PDF (`ih-generate-payslip-pdf`):
Header → Staff Info → Income → Claims/Reimbursements/Bonus → Employee Deductions → (Manual Adjustment) → Net Pay → Employer Contributions.

### §22 Finance Snapshot — DONE
- `ih_finance_snapshots` carries `employee_statutory_total`, `employer_statutory_total`, `epf_total`, `socso_total`, `eis_total`, `bonus_total`, `payroll_total`, `claims_total`, `training_claims_total`.
- `FinanceSnapshotDetail.tsx` and `FinanceIndex.tsx` surface these and label them "Internal reference only — not accounting."
- Deprecated `epf_socso_total` is still written for back-compat but is not used in UI (acceptable, no rule violation).

### §23 Staff profile statutory defaults — DONE
- Stored on `ih_staff_profiles`; admin-only writes via `ih_block_sensitive_self_update`. Not exposed on `MyProfile`.

### §24/§25 Backend schema & PDF parity — DONE
- Schema columns exist; PDF and portal payslip render identical line-items and totals.

### §27 Out-of-scope items — DONE
- No PCB/MTD, filing, banking, accounting ledger, signature workflow, or new approval rules were added.

## Verdict

**No code changes required.** All Patch 1.5 acceptance tests are satisfied by current code and schema.

## Recommended deliverables (documentation only)

1. Add a memory note `mem://internal-hub/patch-1.5` recording that Patch 1.5 is satisfied by the existing Patch 002 implementation, with pointers to:
   - `src/pages/staff/hub/payslips/PayslipDetail.tsx`
   - `supabase/functions/ih-generate-payslip-pdf/index.ts`
   - `src/lib/internal-hub/repos/payrollRepo.ts`, `payslipRepo.ts`, `financeSnapshotRepo.ts`
   - schema columns on `ih_staff_profiles`, `ih_payroll_items`, `ih_payslips`, `ih_finance_snapshots`.
2. Update `mem://index.md` to add Patch 1.5 to the Core list ("Patch 1.5: EPF/SOCSO/EIS each split into employee + employer portions; claims/bonus excluded from Total Income; no payslip signature line").
3. Move on to Patch 1.6 next.

## What I will deliberately not touch

- `epf_socso_total` legacy column (still populated for back-compat readers; harmless).
- `total_company_cost` column (not referenced by Patch 1.5; unchanged).
- Request/leave/claim approval flow, calendar sync, auth, notices, resources — all out of scope per §3.

## Technical notes

Files re-verified during gap analysis: `src/lib/internal-hub/types.ts`, `repos/staffRepo.ts`, `repos/payrollRepo.ts`, `repos/payslipRepo.ts`, `repos/financeSnapshotRepo.ts`, `src/pages/staff/hub/payslips/PayslipDetail.tsx`, `src/pages/staff/hub/admin/finance/*`, `supabase/functions/ih-generate-payslip-pdf/index.ts`. Live DB columns confirmed via information_schema query.

Used the patch-workflow skill.
