# Fix: page flashes then disappears after login

## Root cause — Lovable's AuthContext, not the docs

In `src/contexts/AuthContext.tsx` the `onAuthStateChange` handler fires for **every** auth event (including `TOKEN_REFRESHED`, which Supabase emits regularly — your auth logs show many `/user` and `/token` calls within seconds of login). On every event it:

1. Re-runs `fetchUserProfile(...)`.
2. If that fetch returns `null` or errors transiently (network blip, RLS race right after our security migration, etc.), it calls `setUser(null)`.

Combined with this line:

```ts
isAuthenticated: !!session && !!user,
```

…any momentary `user === null` flips `isAuthenticated` to `false`, and `ProtectedRoute` immediately `<Navigate to="/login" />`. That's the "shows for ~1s then disappears" behavior.

Two secondary issues amplify it:
- `INITIAL_SESSION` from `onAuthStateChange` and the manual `getSession()` both kick off `fetchUserProfile` in parallel — whichever finishes last wins, and a `null` result wipes a valid user.
- `setIsLoading(false)` is only called in the `getSession()` path; `onAuthStateChange` never toggles loading, so the gate relies entirely on whichever path resolves first.

## Fix (single file: `src/contexts/AuthContext.tsx`)

1. **Don't overwrite `user` with `null` on transient fetch failures.** Only clear `user` when the event is an actual sign-out (`SIGNED_OUT`) or when there's no session.
2. **Skip profile refetch on `TOKEN_REFRESHED`** — the profile hasn't changed; just update the session.
3. **Gate `isAuthenticated` on session only**, not on `user`. Use a separate `hasProfile` / `user` check inside `ProtectedRoute` for the role gate, with a loading state while the profile is still resolving.
4. **Single source of truth for the initial fetch.** Let `onAuthStateChange` (which fires `INITIAL_SESSION` on mount) own the bootstrap; drop the parallel `getSession().then(fetchUserProfile)` to remove the race.
5. **Track `isLoading` correctly:** set it `false` once we've received the first auth event AND (if there's a session) the first profile fetch has resolved.

## Update `ProtectedRoute` (`src/components/staff/ProtectedRoute.tsx`)

- While `isLoading` OR (session exists but profile not yet loaded) → show the spinner, don't redirect.
- Only redirect to `/login` when there is no session.
- Only redirect off `requireAdmin` routes after the profile has loaded.

## Verdict on the question

This is **Lovable's scaffold**, not the auth implementation doc. The doc correctly says "register `onAuthStateChange` early"; it does not tell you to refetch+overwrite the profile on every event, nor to couple `isAuthenticated` to a derived `user` object that can blink to null. The bug is in the generated `AuthContext`.

## Out of scope

- No DB / RLS changes — last migration is correct.
- No changes to `/staff/marketing` auth surface.
