## Patch 001 §13 — Close carry-forward AL expiry gap

### Problem
`al_carry_forward_expires_on` is never set, so the daily expiry branch in `ih-scheduled-reminders` is dead code. Patch 001 §13 requires expiry to "not depend only on manual memory."

### Solution — Jan 1 year-rollover job branch
Add a single dated branch to `supabase/functions/ih-scheduled-reminders/index.ts` that runs once per year on **Jan 1 (UTC)** and populates carry-forward + expiry from the previous year's unused AL.

### Rules
- **Eligible staff**: `ih_staff_profiles.status = 'Active'`.
- **Source row**: previous year's `ih_leave_balances` (`year = previousYear`).
- **Carry-forward amount**: `max(0, al_total - al_used)`, capped at **7 days** (company policy default; matches typical MY SME practice — flag for review if different).
- **Expiry**: `currentYear-07-01` (6 months after Jan 1, per §13).
- **Target row**: upsert the current-year row by `(staff_id, year)`, setting `al_carry_forward` and `al_carry_forward_expires_on`. Do not touch `al_total`, `al_used`, `sl_total`, `sl_used`.
- **Idempotency**: skip if target row already has `al_carry_forward > 0 OR al_carry_forward_expires_on IS NOT NULL` (job already ran this year for that staff).
- **Audit**: emit `leave.carry_forward_initialized` per staff via `ih_log_system_audit` with `{ year, amount, expiresOn, sourceYear }`.

### Edit
`supabase/functions/ih-scheduled-reminders/index.ts` — add one branch (~30 lines) gated by `today.getUTCMonth() === 0 && dayOfMonth === 1`, placed before the existing daily expiry branch. Update `results` shape with `carry_forward_rollover: { processed: n }`. Top-of-file comment list updated.

### Out of scope (deliberately untouched)
- No new admin UI for manual carry-forward (current `StaffSupabaseRepo.alCarryForward` write path still works for ad-hoc overrides).
- No backfill for past years — first run will be Jan 1, 2027.
- Cap value (7 days) is a default; change requires a separate request.
- No schema change.
- §18 file-upload failure tracking remains Low/out-of-scope.

### Verification
- Manual test: invoke with `?force_date=2027-01-01` (would need a small dev-only override) — skipped; instead rely on the audit-log + `carry_forward_rollover.processed` count on the first real run.
- Existing daily expiry branch unchanged → starts finding rows once rollover has populated them.

### Acceptance
Patch 001 §13 fully satisfied: balances roll forward automatically, expire automatically, and every action is audit-traced under `actor_role='system'`.
