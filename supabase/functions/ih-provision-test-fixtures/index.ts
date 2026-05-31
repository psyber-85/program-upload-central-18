// Doc 4.1 §27 — Idempotently provision the 3 RLS test fixture users.
// Header-gated by `x-fixture-token: <FIXTURE_TOKEN>` secret.
//
// Creates/upserts:
//   admin@aihq.test            (Admin, Active)
//   staff-active@aihq.test     (Staff, Active, business_arm='Training')
//   staff-inactive@aihq.test   (Staff, Inactive)
//
// All three share the same password (returned in the response); the operator
// should store it as IH_TEST_PASSWORD in .env and never use these accounts in
// production.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-fixture-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Fixture {
  email: string;
  name: string;
  role: "admin" | "staff";
  status: "Active" | "Inactive";
  businessArm: "Training" | "Solutions" | "Both";
}

const FIXTURES: Fixture[] = [
  { email: "admin@aihq.test", name: "Test Admin", role: "admin", status: "Active", businessArm: "Both" },
  { email: "staff-active@aihq.test", name: "Test Staff Active", role: "staff", status: "Active", businessArm: "Training" },
  { email: "staff-inactive@aihq.test", name: "Test Staff Inactive", role: "staff", status: "Inactive", businessArm: "Training" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const expected = Deno.env.get("FIXTURE_TOKEN");
    if (!expected) return json({ ok: false, error: "fixture_token_not_configured" }, 500);
    const provided = req.headers.get("x-fixture-token") ?? "";
    if (provided !== expected) return json({ ok: false, error: "forbidden" }, 403);

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    // Generate a deterministic-shape password per provisioning call.
    const password = `Fix-${crypto.randomUUID().slice(0, 12)}!Aa1`;

    const results: { email: string; user_id: string; created: boolean }[] = [];

    for (const f of FIXTURES) {
      let userId: string | undefined;
      let created = false;

      // Try to create; if exists, look up.
      const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
        email: f.email,
        password,
        email_confirm: true,
        user_metadata: { name: f.name, fixture: true },
      });
      if (createErr) {
        if (String(createErr.message).toLowerCase().includes("already")) {
          const { data: listed } = await admin.auth.admin.listUsers();
          const existing = listed?.users.find((u) => u.email?.toLowerCase() === f.email);
          if (!existing) throw createErr;
          userId = existing.id;
          // Reset password so the shared IH_TEST_PASSWORD always works.
          await admin.auth.admin.updateUserById(existing.id, { password });
        } else {
          throw createErr;
        }
      } else {
        userId = createRes.user!.id;
        created = true;
      }

      // Upsert profile.
      const { error: pErr } = await admin
        .from("ih_staff_profiles")
        .upsert({
          id: userId!,
          name: f.name,
          email: f.email,
          role: f.role,
          status: f.status,
          job_title: "Fixture",
          business_arm: f.businessArm,
          join_date: "2024-01-01",
          deactivated_at: f.status === "Inactive" ? new Date().toISOString() : null,
        }, { onConflict: "id" });
      if (pErr) throw pErr;

      // Upsert role row.
      const { error: rErr } = await admin
        .from("ih_user_roles")
        .upsert({ user_id: userId!, role: f.role }, { onConflict: "user_id,role" });
      if (rErr) throw rErr;

      results.push({ email: f.email, user_id: userId!, created });
    }

    return json({
      ok: true,
      password,
      note: "Store as IH_TEST_PASSWORD in .env. Do NOT use these accounts in production.",
      fixtures: results,
    });
  } catch (err) {
    console.error("ih-provision-test-fixtures error", err);
    return json({ ok: false, error: String((err as Error).message ?? err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
