# Fix: Birthday Dashboard "Test Email" fails

## Root cause

`supabase/functions/test-email/index.ts` gates on a `TEST_TOKEN` bearer header (lines 62-70). The dashboard UI (`src/pages/BirthdayDashboard.tsx`) initialises `testToken` as an empty string and never provides any way to populate it, so every call sends `Authorization: Bearer ` and the function returns **401 Unauthorized**. The frontend surfaces that as the generic "Failed to send test email" toast.

`send-remaining` has the same broken gate for the same reason ("Send Remaining Now" button will 401 too).

SendGrid config itself is fine — nothing to change there.

## Fix (mirror the pattern we already applied to `send-hr-notification`)

Replace the `TEST_TOKEN` check with the shared active-staff auth used elsewhere in the marketing portal. Any signed-in Active IH staff (or admin/service) can send test / remaining birthday emails; unauthenticated callers still get 401.

### Changes

1. **`supabase/functions/test-email/index.ts`**
   - Import `authenticate`, `corsHeaders`, `jsonError` from `../_shared/auth.ts`.
   - Drop the `TEST_TOKEN` check.
   - Require an authenticated caller; additionally verify the user is an Active IH staff via `ih_staff_profiles` (same lookup used by `send-hr-notification`).
   - Keep SendGrid send logic unchanged.

2. **`supabase/functions/send-remaining/index.ts`**
   - Same swap: remove `TEST_TOKEN` gate, use active-staff auth.
   - Keep CORS helper aligned with the shared one (adds `x-cron-secret` allow — harmless).

3. **`src/pages/BirthdayDashboard.tsx`**
   - Remove the unused `testToken` state and the `headers: { Authorization: Bearer ${testToken} }` overrides on the two `functions.invoke` calls. `supabase.functions.invoke` auto-attaches the user's JWT, which is exactly what the new gate expects.
   - No UI changes.

4. **Test send after deploy**
   - Call `test-email` for `psyber85@gmail.com` / name "Vino" using the browser session so we can confirm 200 + SendGrid 202. If the SendGrid call itself fails, surface the real error message in the toast (already does via `error.message`).

## Not touched

- SendGrid template body/image (that lives in the SendGrid dashboard, not this codebase).
- `birthday` / `birthday-log` cron functions.
- `TEST_TOKEN` secret (leave as-is; nothing else uses it, safe to delete later).

## Verification

- Sign in as any Active staff → dashboard → Send Test to `psyber85@gmail.com` → toast "Test email sent" and email arrives.
- Unauthenticated fetch to `/functions/v1/test-email` still returns 401.
