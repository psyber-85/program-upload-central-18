// Doc 4.1 §17 — RLS / access regression tests.
//
// These tests verify that Row-Level Security on the ih_* tables behaves as
// specified, regardless of what the UI does. They are not unit tests of any
// repo: they hit Supabase directly using three role-shaped clients.
//
// HOW TO RUN
//   1. Create three test users in Supabase Auth (one-time setup):
//        - admin@aihq.test            (Admin, Active)
//        - staff-active@aihq.test     (Staff, Active)
//        - staff-inactive@aihq.test   (Staff, deactivated)
//      with rows in ih_staff_profiles + ih_user_roles to match. Then set:
//        IH_TEST_PASSWORD=<shared password>
//        VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (from .env)
//   2. From the project root:
//        deno test --allow-net --allow-env supabase/functions/_tests/rls_access_test.ts
//
// The tests are skipped if the env vars are missing so CI does not fail
// before the fixture users are provisioned.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
const PASSWORD = Deno.env.get("IH_TEST_PASSWORD");

const READY = Boolean(URL && KEY && PASSWORD);

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL!, KEY!);
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD! });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return c;
}

const SKIP = !READY ? { ignore: true } : {};

Deno.test({ name: "admin can read all ih_staff_profiles", ...SKIP }, async () => {
  const c = await signIn("admin@aihq.test");
  const { data, error } = await c.from("ih_staff_profiles").select("id");
  assertEquals(error, null);
  assert((data?.length ?? 0) >= 2, "admin should see ≥2 profiles");
});

Deno.test({ name: "active staff sees only own ih_staff_profiles row", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { data } = await c.from("ih_staff_profiles").select("id");
  assertEquals(data?.length, 1);
  assertEquals(data?.[0]?.id, me.user?.id);
});

Deno.test({ name: "inactive staff is blocked from ih_requests reads", ...SKIP }, async () => {
  const c = await signIn("staff-inactive@aihq.test");
  const { data } = await c.from("ih_requests").select("id");
  assertEquals(data?.length ?? 0, 0);
});

Deno.test({ name: "non-admin cannot read ih_payroll_runs", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data } = await c.from("ih_payroll_runs").select("id");
  assertEquals(data?.length ?? 0, 0);
});

Deno.test({ name: "non-admin cannot mutate compensation fields", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { error } = await c
    .from("ih_staff_profiles")
    .update({ salary_base: 99999 })
    .eq("id", me.user!.id);
  assert(error, "expected sensitive-field trigger to reject");
});

Deno.test({ name: "non-admin cannot insert into ih_user_roles", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { error } = await c
    .from("ih_user_roles")
    .insert({ user_id: me.user!.id, role: "admin" });
  assert(error, "expected RLS to reject role escalation");
});

Deno.test({ name: "staff cannot read other staff's payslips", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { data } = await c.from("ih_payslips").select("staff_id");
  for (const row of data ?? []) {
    assertEquals(row.staff_id, me.user!.id);
  }
});
