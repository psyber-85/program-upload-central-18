// Doc 4.1 §17 / §27 — RLS / access regression tests.
//
// These tests verify Row-Level Security on the ih_* tables, regardless of UI.
// Three fixture identities are required:
//   - admin@aihq.test            (Admin, Active)
//   - staff-active@aihq.test     (Staff, Active, business_arm='Training')
//   - staff-inactive@aihq.test   (Staff, Inactive)
//
// PROVISIONING (one-time):
//   Invoke the `ih-provision-test-fixtures` edge function with header
//   `x-fixture-token: <FIXTURE_TOKEN>` (secret). It is idempotent. Then set
//   IH_TEST_PASSWORD to the password it returned.
//
// HOW TO RUN
//   `deno test --allow-net --allow-env supabase/functions/_tests/`.
//   The dotenv import below picks up `.env` automatically.
//
// Tests are skipped if env vars are missing so CI does not fail before
// fixtures are provisioned.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
const PASSWORD = Deno.env.get("IH_TEST_PASSWORD");

const READY = Boolean(URL && KEY && PASSWORD);
const SKIP = !READY ? { ignore: true } : {};

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL!, KEY!);
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD! });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return c;
}

// ============================================================
// Staff isolation (Doc 4.1 §20)
// ============================================================

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

Deno.test({ name: "staff cannot read other staff's payslips", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { data } = await c.from("ih_payslips").select("staff_id");
  for (const row of data ?? []) {
    assertEquals(row.staff_id, me.user!.id);
  }
});

// ============================================================
// Admin elevated access (Doc 4.1 §19)
// ============================================================

Deno.test({ name: "non-admin cannot read ih_payroll_runs", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data } = await c.from("ih_payroll_runs").select("id");
  assertEquals(data?.length ?? 0, 0);
});

Deno.test({ name: "admin can read ih_payroll_runs", ...SKIP }, async () => {
  const c = await signIn("admin@aihq.test");
  const { error } = await c.from("ih_payroll_runs").select("id");
  // Empty result is fine; what matters is no permission error.
  assertEquals(error, null);
});

Deno.test({ name: "admin can read ih_finance_snapshots", ...SKIP }, async () => {
  const c = await signIn("admin@aihq.test");
  const { error } = await c.from("ih_finance_snapshots").select("id");
  assertEquals(error, null);
});

Deno.test({ name: "admin can read all ih_requests", ...SKIP }, async () => {
  const c = await signIn("admin@aihq.test");
  const { error } = await c.from("ih_requests").select("id");
  assertEquals(error, null);
});

// ============================================================
// Sensitive fields & role escalation (Doc 4.1 §14, §10)
// ============================================================

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

// ============================================================
// Notice & resource audience (Doc 4.1 §21)
// ============================================================

Deno.test({ name: "staff only sees notices targeted to them", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data: me } = await c.auth.getUser();
  const { data, error } = await c
    .from("ih_notices")
    .select("id, audience, audience_staff_id, archived_at");
  assertEquals(error, null);
  // Fixture staff is Training arm. Every row returned must be visible per policy.
  for (const n of data ?? []) {
    assertEquals(n.archived_at, null, "should not see archived notices");
    const ok =
      n.audience === "Everyone" ||
      n.audience === "Training" ||
      (n.audience === "Individual" && n.audience_staff_id === me.user!.id);
    assert(ok, `unexpected audience leak: ${JSON.stringify(n)}`);
  }
});

Deno.test({ name: "staff only sees resources targeted to their arm", ...SKIP }, async () => {
  const c = await signIn("staff-active@aihq.test");
  const { data, error } = await c
    .from("ih_resources")
    .select("id, audience, archived_at");
  assertEquals(error, null);
  for (const r of data ?? []) {
    assertEquals(r.archived_at, null, "should not see archived resources");
    const ok = r.audience === "Everyone" || r.audience === "Training";
    assert(ok, `unexpected resource audience leak: ${JSON.stringify(r)}`);
  }
});
