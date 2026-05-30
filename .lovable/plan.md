# Loop 1 continuation — Auth pages + repo migration to Supabase

Loop 1 already shipped: `ih_*` schema + RLS + helpers, `ih-bootstrap-admin`, `ih-create-staff`, Supabase-backed `HubContext`. What remains is large (13 localStorage repos + login UI + RLS tests), so I'll split it into 3 small build messages so each is reviewable.

## Message A — Auth surface + identity repo

1. **`/staff/login`** page using `supabase.auth.signInWithPassword`. Redirect to `/staff` on success. Inactive profile → toast + sign out (mirrors `InternalHubLayout` guard).
2. **`/reset-password`** public route handling `type=recovery` link from invite/reset emails. Sets new password via `supabase.auth.updateUser`.
3. Wire both into `App.tsx` router. Existing role-switcher demo login is removed.
4. **`staffRepo`** → Supabase. List/get/upsert/deactivate against `ih_staff_profiles` + `ih_user_roles`. `addStaff` becomes a thin wrapper that invokes the existing `ih-create-staff` edge function.
5. **`ih-deactivate-staff`** edge function: admin-only, sets `status='Inactive'`, `deactivated_at=now()`, calls `auth.admin.signOut(user_id)`.

## Message B — Operational repos (notices, resources, requests, lifecycle)

Swap these repos to Supabase against the tables already migrated. Public method signatures stay identical so consumer pages don't change:

- `noticeRepo` → `ih_notices` + `ih_notice_reads` + `ih_notice_acks` (audience filter handled by RLS).
- `resourceRepo` → `ih_resources`.
- `requestSummaryRepo` → derived from `ih_requests` (count by status for home preview).
- `onboardingRepo` / `offboardingRepo` → `ih_access_checklist` (one row per item).
- `toolAccessRepo` → `ih_tool_access`.
- `welcomeEmailRepo` → `ih_welcome_emails`.
- `claimRepo` → reads `ih_requests` where `kind='claim' AND status='Approved'`, writes `payload.included_in_payroll_month`.

`storage.ts` keeps `nowISO`/`uid` helpers; `readJSON/writeJSON` deprecated and removed once no callers remain.

## Message C — Payroll/finance repos + RLS tests

- `payrollRepo` → `ih_payroll_runs` + `ih_payroll_items`.
- `payslipRepo` + `payslipSummaryRepo` → `ih_payslips` + `ih_payslip_downloads`.
- `financeSnapshotRepo` → `ih_finance_snapshots`.
- Delete `seed.ts` / `seedNotices.ts` auto-seed; move SEED_* constants under a dev-only `/staff/admin/seed` button that inserts via Supabase and is hidden in prod.
- **`ih-rls-tests`** Deno test: two seeded users verify the 11 boundaries from Doc 4.1 §27 (staff cannot read others' profiles/requests/payslips; admin can; inactive staff blocked; sensitive columns hidden from staff via view).
- Run `supabase--linter`; fix any new warnings.

## Out of scope (still)

`/marketing/**`, TryHire, CRM/Register/Birthday trackers, legacy `sp_*` tables, Loop 2 (SendGrid/Calendar/PDF), Loop 3 (audit/system issues/AI).

## Acceptance for Loop 1 close

- Sign in at `/staff/login` as `pang@theaihq.net` lands on `/staff` with admin nav.
- A demo staff added by admin receives invite, sets password via `/reset-password`, lands on `/staff` without admin nav.
- All hub pages render real Supabase data; no `readJSON/writeJSON` calls remain.
- `ih-rls-tests` passes.

Approve and I'll ship Message A first.
