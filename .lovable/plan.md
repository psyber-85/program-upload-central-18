## Root cause

The `send-hr-notification` edge function is gated by `requireAdmin(req)`:

```ts
// supabase/functions/send-hr-notification/index.ts (~line 193)
const auth = await requireAdmin(req);
if (!auth.ok) return jsonError(auth.status, auth.error);   // returns HTTP 403 for non-admins
```

Confirmed from the database:

| User    | `ih_staff_profiles.role` | `ih_user_roles.role` | Status |
|---------|--------------------------|----------------------|--------|
| Pang    | admin                    | admin                | Active |
| Zarnaaz | **staff**                | **staff**            | Active |

- **Pang** passes the admin check → 200, email sends.
- **Zarnaaz** fails the admin check → the function returns **HTTP 403**, which `supabase.functions.invoke` surfaces to the modal as *"Edge Function returned a non-2xx status code."*

This is a permissions mismatch, not a SendGrid / self-HR / program-links issue. Register-Tracker is a marketing tool operated by non-admin marketing staff — Zarnaaz is literally the sender/CC identity baked into the email itself — but the endpoint was locked to admins only.

## Proposed fix

Scope: only `supabase/functions/send-hr-notification/index.ts`. No frontend, DB, template, or other-function changes.

1. Replace `requireAdmin(req)` with `authenticate(req)` and then allow the call if the caller is **service, admin, OR an Active IH staff member**. Anon / inactive users still get 401/403.

   ```ts
   const auth = await authenticate(req);
   if (!auth.ok) return jsonError(auth.status, auth.error);

   if (!auth.isService && !auth.isAdmin) {
     const admin = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
     );
     const { data: staff } = await admin
       .from("ih_staff_profiles")
       .select("id")
       .eq("id", auth.userId)
       .eq("status", "Active")
       .maybeSingle();
     if (!staff) return jsonError(403, "staff_required");
   }
   ```

2. Everything else (self-HR handling, program-links lookup, SendGrid call, structured error responses) stays as-is.

## What is NOT changing

- No changes to `NotifyHRModal.tsx`, `ProspectTable.tsx`, or any DB schema.
- No relaxation to fully public — still requires a valid JWT belonging to an Active IH staff member (or admin/service).
- Admin-only endpoints elsewhere are untouched.

## Verification after implementation

- Zarnaaz clicks "Send Email" for Nur Syazliyana → 200, email delivered.
- Pang continues to work as before.
- Unauthenticated / inactive callers still receive 401/403.
