// Admin invites a new staff member into the Internal Hub.
// Requires caller to be an authenticated user with role='admin' in ih_user_roles.
// Sends Supabase invite email (no password stored anywhere) and creates
// ih_staff_profiles + ih_user_roles rows. Welcome email queueing is Doc 4.2.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  name: string;
  email: string;
  jobTitle?: string;
  businessArm?: "Training" | "Solutions" | "Both";
  joinDate?: string;
  role?: "staff" | "admin"; // default staff
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ ok: false, error: "missing_bearer" }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Caller-context client (RLS-bound).
    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ ok: false, error: "invalid_token" }, 401);

    // Service client for privileged operations.
    const admin = createClient(url, serviceKey);

    // Verify caller is an active admin (Doc 4.1 §19).
    const { data: callerRoles } = await admin
      .from("ih_user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) return json({ ok: false, error: "not_admin" }, 403);

    const body = (await req.json()) as Body;
    if (!body?.email || !body?.name) {
      return json({ ok: false, error: "name_and_email_required" }, 400);
    }
    if (!body.businessArm || !["Training", "Solutions", "Both"].includes(body.businessArm)) {
      return json({ ok: false, error: "business_arm_required" }, 400);
    }
    const email = body.email.toLowerCase().trim();
    const role = body.role === "admin" ? "admin" : "staff";

    // Invite (sends magic-link / set-password email).
    let userId: string;
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { name: body.name },
    });
    if (inviteErr) {
      // If the user already exists in auth, find them and continue.
      if (String(inviteErr.message).toLowerCase().includes("already")) {
        const { data: listed } = await admin.auth.admin.listUsers();
        const existing = listed?.users.find((u) => u.email?.toLowerCase() === email);
        if (!existing) throw inviteErr;
        userId = existing.id;
      } else {
        throw inviteErr;
      }
    } else {
      userId = invited!.user!.id;
    }

    // Create profile. Doc 0.2 §6 — staff are Active from the moment they're invited;
    // there is no separate activation step. Login itself is gated by the invite email.
    const { error: profileErr } = await admin
      .from("ih_staff_profiles")
      .upsert({
        id: userId,
        name: body.name,
        email,
        role,
        status: "Active",
        job_title: body.jobTitle ?? null,
        business_arm: body.businessArm,
        join_date: body.joinDate ?? new Date().toISOString().slice(0, 10),
      }, { onConflict: "id" });
    if (profileErr) throw profileErr;


    // Role row.
    const { error: roleErr } = await admin
      .from("ih_user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return json({ ok: true, user_id: userId, email });
  } catch (err) {
    console.error("ih-create-staff error", err);
    return json({ ok: false, error: String((err as Error).message ?? err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
