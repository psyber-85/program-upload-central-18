# Card 3 — Payroll, Payslips & Finance Snapshot

Implements Docs 3.1 (Payroll Prep & Finalization), 3.2 (Payslips & Staff Visibility), 3.3 (Admin Finance Snapshot). Frontend-first, localStorage-backed, mirroring the pattern already used for Docs 0.1–1.2.

**Scope guarantee:** Only `src/lib/internal-hub/**`, `src/components/internal-hub/**`, `src/pages/staff/hub/**` and `src/App.tsx` (routes). No edits to TryHire main site (`src/pages/tryhire/**`, `src/components/tryhire/**`, `src/pages/Index.tsx`) or marketing portal (`src/pages/staff/marketing/**`, `src/components/marketing/**`, CRM/Register/Birthday pages).

---

## 1. Data model (`src/lib/internal-hub/types.ts`)

Add:

- `PayrollRunStatus`: `'NotPrepared' | 'Draft' | 'ReadyForReview' | 'Finalized' | 'Locked'`
- `PayrollItemRowStatus`: `'Complete' | 'Incomplete'`
- `ClaimInclusionState`: `'NotIncluded' | 'QueuedForPayroll' | 'IncludedInPayroll'`
- `ManualAdjustment` `{ amount: number; reason: string }`
- `PayrollItem` per Doc 3.1 §12 (staffId, name, month, baseSalary, epfAmount, socsoAmount, claimsTotal, trainingClaimsTotal, adjustment, netPay, rowStatus, missingFields[], notes, includedClaimIds[], includedTrainingClaimIds[])
- `PayrollRun` (id, month YYYY-MM, status, items[], createdAt, preparedAt, finalizedAt, finalizedBy, lockedAt, adminNotes)
- `ApprovedClaim` & `ApprovedTrainingClaim` (preview shapes owned by Card 2) — minimal: id, staffId, amount, approvedAt, inclusionState, includedInPayrollMonth?, type
- `PayslipAvailability`: `'NotGenerated' | 'Generated' | 'Available' | 'Error'`
- `Payslip` (id, payrollRunId, payrollItemId, staffId, staffName, month, baseSalary, epf, socso, claimsTotal, trainingClaimsTotal, adjustment, netPay, finalizedAt, availability, pdfRef?, correctionRef?)
- `FinanceLineCategory`: `'Income' | 'Expense' | 'TransferAdjustment' | 'Other'`
- `FinanceLineItem` (id, snapshotId, category, amount, note, link?, createdAt, createdBy, isCorrection?)
- `FinanceSnapshotStatus`: `'Draft' | 'Reviewed' | 'Locked'`
- `FinanceSnapshot` (id, month, status, openingBalance?, closingBalance?, lineItems[], payrollTotal, claimsTotal, trainingClaimsTotal, epfSocsoTotal, manualAdjustmentTotal, notes, reviewedAt?, reviewedBy?, createdAt, updatedAt)

Constants: `PAYROLL_STATUS_LABELS`, `PAYSLIP_AVAIL_LABELS`, `FINANCE_CATEGORY_LABELS`, `FINANCE_STATUS_LABELS`, `CONFIDENTIAL_PAYSLIP_LABEL = 'Confidential payroll document'`.

Extend `PayslipSummary` to include `month`, `availability` so the existing Home preview keeps working.

## 2. Repos (`src/lib/internal-hub/repos/`)

New localStorage keys (via existing `storage.ts` helpers):

- `claimRepo.ts` (key `claims`, `training-claims`) — seeded with a couple Approved claims so payroll has inputs. Methods: `listApprovedForMonth(month)`, `markIncluded(ids, runId)`.
- `payrollRepo.ts` (key `payroll-runs`)
  - `getOrCreateDraft(month)` — pulls Active staff from `staffRepo`, builds rows; missing baseSalary/epfRate/socsoRate → row marked Incomplete with `missingFields`.
  - `recalcItem(item)` — applies Doc 3.1 §15 net pay formula.
  - `setAdjustment(runId, staffId, { amount, reason })` — reason required.
  - `setRowNotes`, `setRunNotes`.
  - `markReadyForReview(runId)`, `finalize(runId, adminId)` — blocked if any Active row Incomplete; on finalize: status → Finalized+Locked, claim inclusion states → IncludedInPayroll, triggers `payslipRepo.generateForRun(run)`, creates payslip-ready notices via `noticeRepo.broadcast` (PayrollNotice, audience Individual per staff, `emailRequired=true`, link to `/staff/payslips`).
  - `listRuns()`, `getRun(id)`.
- `payslipRepo.ts` (key `payslips`)
  - `generateForRun(run)` — one Payslip per item, availability `Available`, simple `pdfRef = payslip://<id>.pdf` placeholder (real PDF/storage is Card 4).
  - `listForStaff(staffId)`, `getById(id)`, `listAll()` (admin), `downloadPdf(id, actorId, actorRole)` — generates a simple text PDF on the fly with jsPDF (already optional? — fallback: trigger `window.print` view). Implementation: build an HTML/blob download.
  - Audit-readiness: log download intents to `payslip-download-log` (Doc 3.2 §20).
- `financeSnapshotRepo.ts` (key `finance-snapshots`, `finance-line-items`)
  - `getOrCreateForMonth(month)` — auto-fills payroll/claims/training/EPF-SOCSO/adjustment totals from finalized `PayrollRun` for that month (else zero).
  - `setOpening/setClosing/addLineItem/removeLineItem/setNotes` — all blocked when status === Locked, except `addCorrectionLineItem` which is always allowed (Doc 3.3 §21).
  - `markReviewed(snapshotId, adminId)` — sets Reviewed+Locked, captures reviewer.
  - `listSnapshots()`, `getById(id)`.

Reminder scheduling (Doc 3.1 §6/§7): expose `payrollReminders.ensureForMonth(month)` called from `StaffHome` admin mount that, on day-of-month 25, creates an Admin-targeted `PayrollNotice` once per month via `noticeRepo` if not already present (idempotency via a `payroll-reminder-log` key). No real cron — runs in browser when admin opens hub.

Update `src/lib/internal-hub/index.ts` to export the new repos.

## 3. Pages & components (`src/pages/staff/hub/`)

### Admin Payroll (replaces stub)

- `admin/payroll/PayrollIndex.tsx` — month list + status badges + “Prepare {month}” button when NotPrepared.
- `admin/payroll/PayrollRunDetail.tsx` — header (month, status, finalize date), Admin notes textarea, table of rows. Each row: name, base, EPF, SOCSO, claims, training claims, adjustment, net pay, status pill. Incomplete rows show red badge + missing field chips. Inline “Adjust” dialog (amount + required reason). Expandable row detail (Doc 3.1 §13).
- Actions: “Mark Ready for Review”, “Finalize Payroll” (disabled with tooltip if any Incomplete; modal confirm explaining lock + payslip generation).
- Finalized runs show lock icon and read-only rows; “Net Pay = Base − EPF − SOCSO + Claims + Training + Adjustments” formula visible (Doc 3.1 §15).
- Route: `/staff/admin/payroll`, `/staff/admin/payroll/:runId`.

Replace `Stubs.tsx`'s `PayrollAdmin` with real pages.

### Payslips (staff + admin)

- Rewrite `payslips/PayslipsIndex.tsx`: staff list of own payslips by month; columns month/finalized/availability/View/Download. Confidentiality label at top.
- `payslips/PayslipDetail.tsx` (`/staff/payslips/:id`) — full breakdown matching Doc 3.2 §10, confidentiality label, Download PDF button. Guard: staff can only open their own; admin can open any.
- `admin/payroll/AdminPayslips.tsx` (`/staff/admin/payslips`) — admin list of all payslips, filter by month/staff, download.
- Inactive staff: `InternalHubLayout` already redirects Inactive; payslip routes additionally hide for Inactive (defense-in-depth).

### Finance Snapshot (replaces stub)

- `admin/finance/FinanceIndex.tsx` — list of monthly snapshots with status pills.
- `admin/finance/FinanceSnapshotDetail.tsx` — fields: opening/closing balance inputs, auto-filled payroll totals card (read-only with "from finalized payroll"), notes textarea, line-items table (add/remove with Category select, amount, note, optional link). Disclaimer banner: “Internal monthly reference — not accounting.” Button **Mark Month Reviewed** (never "Finalize Accounts"). Once Reviewed: fields locked, but “Add correction line item” still available.
- Routes: `/staff/admin/finance`, `/staff/admin/finance/:id`.

### Home preview updates (`StaffHome.tsx`)

- `MyPayslipsPreview` already exists — wire to new `payslipRepo.listForStaff` so latest Generated payslip shows with "View" link.
- Admin summary card adds “Payroll: {status for current month}” + “Finance Snapshot: {status}” quick links.
- Day-of-month 25 reminder hook (admin only).

## 4. Routes (`src/App.tsx`)

Replace the `PayrollAdmin` / `FinanceSnapshot` stubs with real pages; add:

```
/staff/payslips/:id            → PayslipDetail
/staff/admin/payroll           → PayrollIndex
/staff/admin/payroll/:runId    → PayrollRunDetail
/staff/admin/payslips          → AdminPayslips
/staff/admin/finance           → FinanceIndex
/staff/admin/finance/:id       → FinanceSnapshotDetail
```

Sidebar/mobile nav: add Payroll, Finance entries under admin section in `HubSidebar.tsx` / `HubMobileNav.tsx`. Stub `Approvals` and `SettingsAdmin` remain (owned by Card 2 / later).

## 5. Seed data (`src/lib/internal-hub/seed.ts`)

Extend (idempotent): a couple of approved claims for Active staff, optionally one finalized payroll run for previous month so payslips/Finance Snapshot demo immediately.

## 6. Memory updates

Add `mem://internal-hub/payroll-doc-3.1.md`, `mem://internal-hub/payslips-doc-3.2.md`, `mem://internal-hub/finance-snapshot-doc-3.3.md` capturing the non-negotiables:

- Net Pay = Base − EPF − SOCSO + Claims + Training + Adjustments.
- Manual adjustments require reason; never hidden.
- Finalize blocked if any Active row Incomplete; finalize triggers payslip generation + payslip-ready notice.
- Finalized payroll is locked — corrections via future-payroll adjustment / correction note only.
- Payslips: staff sees only own; admin sees all; inactive staff cannot access portal (Admin retains history). Email never attaches PDF.
- Confidentiality label string locked: `Confidential payroll document`.
- Finance Snapshot is admin-only, never staff-visible, never labelled “Finalize Accounts/Close Books”; correction-after-lock uses correction line item; no file uploads — links only.

Update `mem://index.md` to reference the three new files.

## 7. Out of scope (per spec)

- Real PDF rendering pipeline / Supabase storage / RLS (Card 4).
- Real SendGrid delivery — broadcast log already covers email-required flag.
- Statutory EPF/SOCSO tables, tax, MTD/PCB.
- Claim approval workflow itself (Card 2 owns; we just consume Approved state).
- Bank reconciliation / accounting ledger / AR/AP.

## 8. Verification

- Build passes; type errors zero.
- Manual flow: Admin → Payroll → Prepare current month → row for each Active staff (with seeded missing-field for one to test block) → fix → Ready for Review → Finalize → payslips appear under each staff’s `/staff/payslips` + payslip-ready notices in `/staff/notices` for those individuals.
- Staff login as another user: cannot see admin's payslip URL.
- Admin → Finance → current month → opening/closing/line items → totals auto-filled from finalized payroll → Mark Month Reviewed → fields lock; "Add correction" still works.
- Marketing/main-site smoke: `/`, `/interest`, `/staff/marketing` unchanged.
