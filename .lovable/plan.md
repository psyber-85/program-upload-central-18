# Sub-batch 4A.6 — Close remaining Doc 4.1 gaps

Brings Doc 4.1 from 87% → ~97%.

## Changes

### 1. Extend `supabase/functions/_tests/rls_access_test.ts` (#22, #24)
- Add `import "https://deno.land/std@0.224.0/dotenv/load.ts";` so the runner picks up `.env`.
- Add 3 admin-access assertions: admin can read `ih_payroll_runs`, `ih_finance_snapshots`, and all `ih_requests` (no permission error).
- Add 2 audience tests: staff-active (Training arm) only sees notices/resources whose audience is `Everyone | Training | Individual=self`, and no `archived_at` rows.

### 2. New edge function `supabase/functions/ih-provision-test-fixtures/index.ts` (#20)
- Header-gated by `x-fixture-token` matching `FIXTURE_TOKEN` secret.
- Idempotently creates / upserts the 3 fixture auth users (`admin@`, `staff-active@`, `staff-inactive@`) with a generated shared password, plus their `ih_staff_profiles` + `ih_user_roles` rows + `Active`/`Inactive` status.
- Returns `{ ok, password }` so the operator can store it as `IH_TEST_PASSWORD`.
- Registered in `supabase/config.toml` with `verify_jwt = false`.
- Requires new secret: `FIXTURE_TOKEN` (operator-provided; will request via secrets tool).

### 3. Update `docs/auth-config.md` (#2)
- Add a "Verification evidence" section instructing the operator to attach a dated screenshot of the Auth settings page with `Enable signups = OFF` to the runbook (file path under `docs/screenshots/auth-signups-off.png`), and document a manual `signUp()` probe expected error.

## Files
```
supabase/functions/_tests/rls_access_test.ts       (extend)
supabase/functions/ih-provision-test-fixtures/index.ts  (new)
supabase/config.toml                                (register fn)
docs/auth-config.md                                 (extend)
```

## Out of scope
- Provisioning the fixtures in this Supabase project (operator runs the function once after secret is set).
- Actually running the tests (will skip until `IH_TEST_PASSWORD` is set).

## Acceptance
- Test file contains 13 test cases (was 7) covering admin reads + audience.
- `ih-provision-test-fixtures` deploys and rejects calls without the fixture token.
- `docs/auth-config.md` includes the verification evidence steps.

Approve to switch to build mode.
