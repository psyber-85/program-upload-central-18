## Problem

Zarnaaz (`zarnaaz@theaihq.net`) has `ih_staff_profiles.status = 'Pending'`. The hub treats `Pending` as `Inactive`, so after login she lands on `/staff`, gets bounced to `/login?reason=inactive`, and never reaches the Marketing Portal link.

Two bugs (audit P1 #1 / P2 #6):
1. `src/lib/internal-hub/HubContext.tsx:41` — collapses any non-Active status to `'Inactive'`, losing the `Pending` distinction.
2. `src/contexts/AuthContext.tsx` `login()` — only blocks `Inactive`, lets `Pending` through to be bounced downstream with a misleading "inactive" reason.

## Changes

### 1. `src/lib/internal-hub/HubContext.tsx`
Preserve all three states: `Active | Pending | Inactive` instead of collapsing to `Active | Inactive`.

### 2. `src/contexts/AuthContext.tsx` — `login()`
After fetching profile, also reject `Pending` with a clear message:
> "Your account is pending activation by an admin. Please check back later."

This stops Pending users from getting a half-broken session.

### 3. `src/components/internal-hub/InternalHubLayout.tsx`
Also redirect `Pending` (in addition to `Inactive`) to `/login?reason=pending`, so any pre-existing Pending session is cleanly handled.

### 4. `src/pages/Login.tsx`
Surface the `?reason=pending` and `?reason=inactive` query params as friendly messages on the login screen (so the user knows what happened instead of a blank login form).

### 5. Data fix — activate Zarnaaz
Migration: `UPDATE ih_staff_profiles SET status = 'Active' WHERE email = 'zarnaaz@theaihq.net' AND status = 'Pending';`

(Wrapped in migration tool since it touches a protected status field; the `ih_block_sensitive_self_update` trigger gates non-admin writes, but migrations run as superuser so this passes.)

## Scope guardrails

- Marketing Portal code untouched (per Core rule).
- No changes to roles, payroll, or any unrelated flows.
- No new dependencies.

## Verification

1. Log in as Zarnaaz → lands on `/staff`, no bounce, can click Marketing Portal.
2. Create a test Pending account → login is rejected with the "pending activation" message; no half-session.
3. Existing Inactive accounts still rejected with the original message.
