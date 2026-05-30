// One-shot: seed the first Internal Hub admin (pang@theaihq.net).
// Refuses to run if any ih_user_roles row with role='admin' already exists.
// Safe to call publicly because of that guard; produces no data on re-run.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRST_ADMIN_EMAIL = "pang@theaihq.net";
const FIRST_ADMIN_NAME = "Pang";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Guard: refuse if any admin already exists.
    const { data: existing } = await supabase
      .from("ih_user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1);
    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ ok: false, reason: "admin_already_seeded" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Look up or invite the auth user.
    const { data: usersList } = await supabase.auth.admin.listUsers();
    let authUser = usersList?.users.find((u) => u.email?.toLowerCase() === FIRST_ADMIN_EMAIL);
    let invitedNow = false;

    if (!authUser) {
      const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
        FIRST_ADMIN_EMAIL,
        { data: { name: FIRST_ADMIN_NAME } },
      );
      if (inviteErr) throw inviteErr;
      authUser = invited.user;
      invitedNow = true;
    }

    if (!authUser) throw new Error("failed_to_resolve_auth_user");

    // Upsert ih_staff_profiles.
    const { error: profileErr } = await supabase
      .from("ih_staff_profiles")
      .upsert({
        id: authUser.id,
        name: FIRST_ADMIN_NAME,
        email: FIRST_ADMIN_EMAIL,
        role: "admin",
        status: "Active",
        job_title: "Founder",
        business_arm: "Both",
        join_date: new Date().toISOString().slice(0, 10),
      }, { onConflict: "id" });
    if (profileErr) throw profileErr;

    // Insert admin role.
    const { error: roleErr } = await supabase
      .from("ih_user_roles")
      .insert({ user_id: authUser.id, role: "admin" });
    if (roleErr && roleErr.code !== "23505") throw roleErr;

    return new Response(
      JSON.stringify({
        ok: true,
        invited: invitedNow,
        user_id: authUser.id,
        email: FIRST_ADMIN_EMAIL,
        next_step: invitedNow
          ? "Check inbox for invite email; set password to log in."
          : "Auth user already existed; admin role + profile linked.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("ih-bootstrap-admin error", err);
    return new Response(
      JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
