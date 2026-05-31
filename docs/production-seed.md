# Production Seed Runbook (Doc 4.1 §17)

The Internal Hub ships with **no fixture data** in production. The localStorage
seeds (`src/lib/internal-hub/seed.ts`, `seedNotices.ts`) are dev-only and never
write to Supabase.

## One-time bootstrap

1. **Deploy migrations.** Verified by `supabase migration list` showing the same
   set as `supabase/migrations/`.
2. **Confirm Auth settings.** See `docs/auth-config.md`. Signups must be OFF.
3. **Bootstrap the first Admin.**
   - Set a strong `BOOTSTRAP_TOKEN` secret on the project.
   - `curl -X POST https://<project>.functions.supabase.co/ih-bootstrap-admin \
        -H "Content-Type: application/json" \
        -d '{"token":"<BOOTSTRAP_TOKEN>","email":"founder@theaihq.net","name":"Founder"}'`
   - The function sends a Supabase invite email; the founder sets a password
     via that link.
4. **Founder signs in at `/login`.** They land in `/staff` as Admin.
5. **Invite remaining staff.** `/staff/admin/staff/new` → calls `ih-create-staff`.
6. **(Optional) promote a second Admin** via the Promote button on the staff
   detail page (calls `ih-promote-staff`). Always keep at least 2 Admins so no
   single account loss locks the system.

## What NOT to do

- Do **not** run `seed.ts` or `seedNotices.ts` against production — they only
  write to browser localStorage and have no effect on Supabase tables, but are
  marked dev-only to avoid confusion.
- Do **not** insert rows into `ih_user_roles` directly via the SQL editor for
  daily operations; always use `ih-promote-staff` so the staff profile `role`
  field stays in sync.
- Do **not** turn on Auth signups, even temporarily.

## Disaster recovery

If every Admin loses access:

1. Reset the `BOOTSTRAP_TOKEN` secret to a new random value.
2. Re-invoke `ih-bootstrap-admin` with an existing staff email — the function
   is idempotent and will (re-)attach the `admin` role to that user.
