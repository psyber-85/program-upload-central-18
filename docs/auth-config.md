# Supabase Auth — Production Configuration (Doc 4.1 §2)

The Internal Hub uses Supabase Auth in **admin-invite-only** mode. Self-signup
must be disabled in production.

## Required Auth Settings

In the Supabase Dashboard → Authentication → Providers → Email:

| Setting | Value |
|---|---|
| Enable Email provider | **ON** |
| Enable signups | **OFF** |
| Confirm email | **ON** |
| Secure email change | **ON** |
| Secure password change | **ON** |

In Authentication → URL Configuration:

| Setting | Value |
|---|---|
| Site URL | Production app origin (e.g. `https://app.theaihq.net`) |
| Additional Redirect URLs | `https://app.theaihq.net/reset-password`, plus any preview URLs |

## Why

- The Login page deliberately exposes no `signUp()` call — the only way into the
  Hub is via an admin invite (`ih-create-staff`) or the bootstrap function
  (`ih-bootstrap-admin`).
- Leaving "Enable signups = ON" would allow anyone with the public anon key to
  create an auth account, even if they could not load any data. That is not the
  posture we want for an internal staff portal.

## Verification

After changing the settings, in an incognito window run from the JS console:

```js
const { error } = await window.supabase.auth.signUp({
  email: 'test+blocked@example.com',
  password: 'whatever-1234',
});
console.log(error?.message); // expect: "Signups not allowed for this instance"
```

If the response is anything other than an explicit "Signups not allowed" error,
revisit the settings above.

## Verification evidence

To satisfy Doc 4.1 §7 we keep dated evidence that signups are off:

1. In the Supabase Dashboard, take a screenshot of **Authentication →
   Providers → Email** with **Enable signups = OFF** clearly visible and the
   current date in frame (OS clock or browser UI).
2. Save it as `docs/screenshots/auth-signups-off-YYYY-MM-DD.png`.
3. Re-take and replace whenever Auth settings are touched.

### Runtime probe (optional)

```js
// Run in an incognito browser console on the app origin.
const { error } = await window.supabase.auth.signUp({
  email: `probe+${Date.now()}@example.com`,
  password: 'whatever-1234',
});
console.log(error?.message);
// Expected: "Signups not allowed for this instance"
```

Anything other than that exact error class means signups are still open.
