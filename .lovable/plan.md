# Doc 4.1 — Fix Plan (Sub-batch 4A)

Targets the 4 remaining gaps from the 78% audit. Mirrors the 2A–2F sub-batch pattern.

## Scope

| # | Gap | Spec ref | Severity |
|---|-----|----------|----------|
| G1 | No RLS / access test suite | Doc 4.1 §17 | High |
| G2 | No Admin-promotion path (UI + edge fn) | Doc 4.1 §5 | Medium |
| G3 | Public signup not verifiably disabled | Doc 4.1 §2 | Medium |
| G4 | No production Supabase seed runbook | Doc 4.1 §17-seed | Medium |
| G5 | Requests/claims lack `archived_at` (soft delete) | Doc 4.1 §11 | Low |

## Deliverables

### 4A.1 — RLS test suite (G1)
- New `supabase/tests/rls/` directory using pgTAP-style SQL tests run via `supabase--read_query` harness, or Deno test file `supabase/functions/_tests/rls_access_test.ts` that signs in as 3 fixture users (admin, active staff, inactive staff) and asserts:
  - staff can read own `ih_staff_profiles`, `ih_payslips`, `ih_requests`, `ih_claims`; cannot read others'
  - inactive staff blocked from all `ih_*` reads via `is_active_ih_staff()`
  - non-admin cannot read `ih_payroll_runs`, `ih_payroll_items`, `ih_finance_*`
  - non-admin cannot mutate sensitive fields (trigger fires)
  - non-admin cannot insert into `ih_user_roles`
- Documented `bun run test:rls` script.

### 4A.2 — Admin promotion (G2)
- New edge function `ih-promote-staff` (verify_jwt enforced in-code): caller must have `admin` role; inserts `(target_user_id, 'admin')` into `ih_user_roles`; writes audit row (uses Doc 4.3 audit log if present, else console).
- UI: on `AdminStaffDetail.tsx`, add "Promote to Admin" / "Revoke Admin" button (admin-only, hidden for self) calling the function. Confirm dialog. Toast on success.

### 4A.3 — Public signup lockdown (G3)
- No code change required in app (Login already has no signUp call). Add a `docs/auth-config.md` runbook documenting required Supabase Auth settings: **Enable signups = OFF**, **Confirm email = ON**, **Site URL** and **Redirect URLs** values.
- Add a runtime guard: small admin-only diagnostic card on `/staff` (Admin view) that calls `supabase.auth.signUp` with a synthetic disabled probe — optional, skip if too invasive. Default: docs only.

### 4A.4 — Production seed runbook (G4)
- New `docs/production-seed.md` describing the one-time bootstrap:
  1. Deploy migrations
  2. Invoke `ih-bootstrap-admin` with bootstrap token to create first Admin
  3. Admin signs in, creates remaining staff via `AdminAddStaff` (uses `ih-create-staff`)
  4. No fixture data inserted in prod
- Mark `src/lib/internal-hub/seed.ts` and `seedNotices.ts` clearly as **dev-only / localStorage only** via top-of-file comment.

### 4A.5 — Soft archive on requests/claims (G5)
- Migration: add `archived_at TIMESTAMPTZ` to `ih_requests` and `ih_claims`.
- Extend `ih_block_hard_delete` trigger to both tables.
- Update `requestSummaryRepo`/`claimRepo` list queries to filter `archived_at IS NULL` by default; admin archive action sets the column.
- No UI change required in 4A (admin archive UI deferred).

## Files touched (estimate)

```
supabase/migrations/<new>_doc4_1_archive_and_delete_guards.sql
supabase/functions/ih-promote-staff/index.ts
supabase/functions/_tests/rls_access_test.ts
supabase/config.toml                          (register new fn)
src/pages/staff/hub/admin/AdminStaffDetail.tsx
src/lib/internal-hub/repos/requestSummaryRepo.ts
src/lib/internal-hub/repos/claimRepo.ts
src/lib/internal-hub/seed.ts                  (comment only)
src/lib/internal-hub/seedNotices.ts           (comment only)
docs/auth-config.md                           (new)
docs/production-seed.md                       (new)
```

## Out of scope
- Doc 4.2 / 4.3 gaps (separate sub-batches 4B–4H).
- Admin UI for archived-request/claim restore (future).
- Replacing localStorage repos with Supabase (tracked elsewhere).

## Acceptance
- RLS test suite passes for all 3 fixture roles.
- Admin can promote/demote another Active staff to Admin from `AdminStaffDetail`.
- `docs/auth-config.md` and `docs/production-seed.md` exist and are accurate.
- `ih_requests` / `ih_claims` have `archived_at`; hard delete blocked; list views hide archived rows.

Approve to switch to build mode and execute 4A.1 → 4A.5 in order.
