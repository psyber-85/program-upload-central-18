## Diagnosis

**It's a UI copy / wiring bug — not a docs problem and not a broken implementation.**

- `WelcomeEmailStatus.handleResend` (src/components/internal-hub/WelcomeEmailStatus.tsx:18-22) calls `welcomeEmailRepo.resend(staffId)` and then immediately shows a hard-coded toast: *"Welcome email resend queued — No real email sent in dev mode."*
- `welcomeEmailRepo.resend` (src/lib/internal-hub/repos/welcomeEmailRepo.ts) **does** dispatch a real send: it kicks off `dispatchWelcome` → `welcomeEmail(...)` → `sendIhEmail(...)` → `supabase.functions.invoke('ih-send-email', ...)`.
- The `ih-send-email` edge function (supabase/functions/ih-send-email/index.ts) is fully implemented against SendGrid using `SENDGRID_API_KEY` (already configured in secrets) and writes results to `ih_email_log`.

So the email IS being sent for real. The toast text is **leftover copy from the earlier localStorage-only phase** and never got updated when Doc 4.2 wired the dispatcher to SendGrid. It also fires synchronously and ignores the actual result.

Same fire-and-forget pattern (no success/failure feedback) also affects `handleQueue` in the same component, but its toast at least isn't lying.

## Codebase sweep for similar issues

Searched for "dev mode" / "no real email" across `src` and `supabase`. Only one other hit:

- `src/lib/internal-hub/seedNotices.ts:3` — a code comment on the local notices seeder. That one is **accurate** (notice seeding really is local-only, no email path), so leave it alone.

No other UI surfaces are lying about send mode.

## Fix plan (frontend-only, surgical)

**File:** `src/components/internal-hub/WelcomeEmailStatus.tsx`

1. Remove the false "No real email sent in dev mode" copy.
2. Make `handleResend` and `handleQueue` `async`, await the repo call so the toast reflects the actual outcome.
3. Show:
   - success toast ("Welcome email sent" / "Welcome email queued and sent") on `status === 'sent' | 'resent'`
   - destructive toast ("Failed to send welcome email — check System Issues") on `status === 'failed'`
4. Disable the button while in-flight (local `isSending` state) so admins can't double-click.
5. Call `onUpdate()` after the dispatch resolves so the badge/timestamp refreshes from the just-written localStorage entry.

**Repo change (minimal):** `welcomeEmailRepo.resend` / `queue` currently return synchronously and run dispatch via `void`. To let the UI await the real outcome, change them to `async` and `await dispatchWelcome(...)` before returning the updated event. `dispatchWelcome` already writes the final `sent | resent | failed` status to localStorage, so the returned event is truthful.
   - Callers to recheck: `AdminAddStaff.tsx` (calls `welcomeEmailRepo.queue` fire-and-forget — keep working by not awaiting; the function returning a Promise is backward-compatible) and `AdminStaffDetail.tsx` (read-only `get`).

**Out of scope:** no edge function changes, no DB changes, no doctrine changes. SendGrid sender, idempotency, and `ih_email_log` truth source are untouched.

## Verification

- Click "Resend" on a staff profile with a valid email → expect success toast and `ih_email_log` row with `status='sent'`.
- Click on a staff profile with no email → expect failure toast (repo already marks status `failed` in that branch).
- Check `AdminAddStaff` flow still queues a welcome email on staff creation without regression.
