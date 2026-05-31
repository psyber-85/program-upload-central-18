# Sub-batch 2E — Finance Snapshot → Supabase

Final repo to migrate off `localStorage`. After this, every Doc 3.x flow is RLS-enforced.

## Schema additions (one migration)

`ih_finance_snapshots` already exists with `month`, `status` (enum: Draft/Reviewed/Locked), `line_items jsonb`, `locked_*`, `reviewed_*`. Missing the typed totals and balances Doc 3.3 needs. Add columns (non-breaking):

```sql
ALTER TABLE public.ih_finance_snapshots
  ADD COLUMN IF NOT EXISTS opening_balance         numeric,
  ADD COLUMN IF NOT EXISTS closing_balance         numeric,
  ADD COLUMN IF NOT EXISTS payroll_total           numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claims_total            numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS training_claims_total   numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS epf_socso_total         numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_adjustment_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes                   text;
```

Line items stay inline in `line_items jsonb` (array of `{id, category, amount, note, link?, createdBy, createdAt, isCorrection}`) — matches existing column and avoids a second table for an admin-only feature.

No RLS/GRANT change needed (table already admin-only).

## Repo rewrite — `financeSnapshotRepo.ts` (all async)

Backed by `ih_finance_snapshots`. Mapping helpers convert row ↔ `FinanceSnapshot` (snake/camel + `lineItems` extracted to `lineItemsFor()` view).

- `listSnapshots()` — order by `month desc`.
- `getById(id)`, `getForMonth(month)`, `statusFor(month)` (returns `'NotStarted'` when absent).
- `getOrCreateForMonth(month, adminId)` — select-or-insert. If existing & `status='Draft'`, refresh payroll-linked totals via `payrollTotalsFor(month)` and patch. Otherwise insert with `status='Draft'` + initial totals.
- `setOpeningBalance / setClosingBalance / setNotes` — single-column updates (Draft only enforced in mutation guards).
- `lineItemsFor(snapshotId)` — read row, return `line_items` array sorted by `createdAt desc`.
- `addLineItem` — guard `status='Draft'`, append non-correction item to `line_items`.
- `addCorrectionLineItem` — append `isCorrection:true` regardless of status (Doc 3.3 §21).
- `removeLineItem(snapshotId, itemId)` — Draft only, filter from jsonb.
- `markReviewed(id, adminId)` — set status, `reviewed_at`, `reviewed_by`.
- `lockSnapshot(id, adminId)` — guard `status='Reviewed'`, set status + `locked_at/by`.

### `payrollTotalsFor(month)` — Supabase aggregate

Replaces the Sub-batch 2D zero-stub. One query:

```ts
supabase
  .from('ih_payroll_items')
  .select('base_salary, employer_epf, employer_socso, claims_total, training_total, adjustment, ih_payroll_runs!inner(status, month)')
  .eq('ih_payroll_runs.month', month)
  .in('ih_payroll_runs.status', ['Finalized', 'Locked'])
  .eq('row_status', 'Complete');
```

Sum client-side into `{ payrollTotal: Σ(base + employer_epf + employer_socso), claimsTotal: Σclaims, trainingClaimsTotal: Σtraining, epfSocsoTotal: Σ(employer_epf+employer_socso), manualAdjustmentTotal: Σ(adjustment.amount ?? 0) }`. All rounded to 2dp.

## Callsite updates (TanStack Query)

- `StaffHome.tsx` — `financeSnapshotRepo.statusFor(month)` → `useQuery(['ih','finance','status',month])`. Already admin-only branch; on staff role the query is skipped via `enabled`.
- `FinanceIndex.tsx` — `listSnapshots()` → `useQuery`; "Open this month" → `useMutation(getOrCreateForMonth)` with invalidation + navigation.
- `FinanceSnapshotDetail.tsx` — replace `tick`/`useMemo` pattern:
  - `useQuery(['ih','finance','snapshot',id])` for snapshot row.
  - `useQuery(['ih','finance','items',id])` for line items (derived from same row; pull from snapshot data — drop second query, use `snapshot?.lineItems`).
  - `useMutation` for setOpeningBalance, setClosingBalance, setNotes (debounced text), addLineItem, addCorrectionLineItem, removeLineItem, markReviewed, lockSnapshot — each invalidates the snapshot query.

## Out of scope (deferred)
- Edge-function-side aggregation / materialized totals — not needed at current volume.
- Real PDF export of monthly snapshot.
- `ih_audit_log` writes — Doc 4.3.

## Verification
- `npm run build` clean.
- Admin: `/staff/admin/finance` → "Open this month" creates snapshot; payroll-linked totals populate from latest finalized run (verify against `/staff/admin/payroll`).
- Add line item, add correction line item (still works after marking reviewed), remove line item (blocked after review).
- Mark Reviewed → status flips; Lock → terminal.
- Refresh page — all values persist (no localStorage).
- Grep clean: no `readJSON`/`writeJSON` in `repos/financeSnapshotRepo.ts`; the file becomes the last localStorage-free repo.
