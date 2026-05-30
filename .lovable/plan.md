## Fix plan — audit gaps for Docs 3.1, 3.2, 3.3

Scope is limited to `src/lib/internal-hub/**` and `src/pages/staff/hub/**` + `src/components/internal-hub/home/**`. No edits to TryHire main site, `/staff/marketing`, or anything outside the Internal Hub.

### 1. Doc 3.1 — Introduce real `Finalized` → `Locked` two-step (Medium)

**Repo (`src/lib/internal-hub/repos/payrollRepo.ts`)**
- Change `finalize(runId, adminId)`: set `status = 'Finalized'`, write `finalizedAt`/`finalizedBy`. Do NOT set `lockedAt` here. Still trigger payslip generation + per-staff PayrollNotice + claim `markIncluded` (these belong to finalization, not to locking).
- Add `lockRun(runId, adminId)`: requires `status === 'Finalized'`; sets `status = 'Locked'` and `lockedAt = now`.
- Edit-guards in `setAdjustment` / `setRowNotes` / `setRunNotes` / `refreshRow` / `markReadyForReview` already block on both `Finalized` and `Locked` — keep as-is so finalized runs remain non-casually-editable.
- `canFinalize` already rejects when already finalized — fine.

**UI (`src/pages/staff/hub/admin/payroll/PayrollRunDetail.tsx`)**
- Header status badge: shows `Finalized` (with finalizedAt) before lock, then `Locked` (with lockedAt).
- When `status === 'Finalized'`: render a single secondary action "Lock Run" with a confirm dialog ("Locking prevents future status changes. Corrections must use future-payroll adjustments."). Hide when `status === 'Locked'`.
- Net Pay rows + adjustment dialog stay disabled for both `Finalized` and `Locked`.

**UI (`src/pages/staff/hub/admin/payroll/PayrollIndex.tsx`)**
- List badge: distinguish `Finalized` vs `Locked` with separate variant (existing `statusVariant` map already has both keys — keep `Finalized: 'default'`, `Locked: 'secondary'` or similar so they read differently).

No data migration needed: previously-finalized runs in localStorage already have `status === 'Locked'`; we leave them as Locked.

### 2. Doc 3.2 — Explicit Inactive-staff guard on own payslip surface (Medium)

**Access helper (`src/lib/internal-hub/access.ts`)**
- Add `canAccessOwnPayslips(staff)` = `isAdmin(staff) || isActiveStaff(staff)`.

**Pages**
- `src/pages/staff/hub/payslips/PayslipsIndex.tsx`: if `!canAccessOwnPayslips(currentStaff)`, render a muted "Payslip access has been deactivated for your account. Contact HR (wani@theaihq.net)." panel instead of the list.
- `src/pages/staff/hub/payslips/PayslipDetail.tsx`: same guard before the existing self-vs-other check. Admin path unaffected.

**Home preview (`src/components/internal-hub/home/MyPayslipsPreview.tsx`)**
- If viewer is Inactive non-admin, render the deactivated-state message in place of the list. (StaffHome already passes the items prop — add a viewer-status check there or accept a `disabled` prop.)

No type changes. Admin retains full history via `AdminPayslips.tsx` (`listAll`) — already correct.

### 3. Doc 3.3 — Finance `markReviewed` sets `Reviewed` (Low)

**Repo (`src/lib/internal-hub/repos/financeSnapshotRepo.ts`)**
- `markReviewed(id, adminId)`: set `status = 'Reviewed'` (not `Locked`). Still writes `reviewedAt`/`reviewedBy`.
- Add `lockSnapshot(id)`: requires `status === 'Reviewed'`; sets `status = 'Locked'`. (Optional follow-up surface; not required for spec compliance but mirrors payroll.)
- `addLineItem` (non-correction): keep blocked unless `status === 'Draft'`.
- `addCorrectionLineItem`: still always allowed regardless of status (Doc 3.3 §21).
- `removeLineItem`: keep `status === 'Draft'`-only.
- `_patch` auto-refresh logic: existing "refresh auto-fill if status is Draft" stays — no refresh once Reviewed/Locked.

**UI (`src/pages/staff/hub/admin/finance/FinanceSnapshotDetail.tsx`)**
- `locked` flag already treats both `'Reviewed'` and `'Locked'` as locked — no change needed for input disabling.
- Header badge will now correctly read "Reviewed" after the action (label already defined in `FINANCE_STATUS_LABELS`).
- Optional: when `status === 'Reviewed'`, expose a small "Lock snapshot" button next to the badge (only if we add `lockSnapshot`). Skip if we want a single-step terminal state.

**UI (`src/pages/staff/hub/admin/finance/FinanceIndex.tsx`)**
- Lock icon currently only shows when `status === 'Locked'`. Update to also show for `'Reviewed'` (both are effectively locked from casual editing).

### Out of scope (explicit)

- No backend / Supabase work (Card 4 owns real PDF + storage + email fanout).
- No statutory EPF/SOCSO tables, no MTD, no bank reconciliation.
- No memory edits — existing `mem://internal-hub/payroll-doc-3.1.md`, `payslips-doc-3.2.md`, `finance-snapshot-doc-3.3.md` already describe these rules correctly; this is alignment with what was already specced.
- No edits to TryHire main site, marketing pages, or non-hub routes.

### Verification after build

1. Prepare a fresh payroll month → fix incomplete rows → Finalize. Header now shows `Finalized` badge + `finalizedAt`. Payslips appear; per-staff PayrollNotices fire. Adjustment fields are disabled. Click "Lock Run" → badge flips to `Locked` + `lockedAt`.
2. Toggle a staff to `Inactive` and visit `/staff/payslips` as that staff → deactivated panel shown. Admin still sees all entries at `/staff/admin/payslips`.
3. Open current finance snapshot → "Mark Month Reviewed" → badge reads `Reviewed`, inputs lock, "Add correction" remains available, and the snapshot list shows the lock icon. No occurrence of "Finalize Accounts" / "Close Books" copy anywhere.
