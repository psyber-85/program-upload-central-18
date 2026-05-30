// Admin deactivates an Internal Hub staff member.
// Sets status='Inactive', stamps deactivated_at, and revokes active sessions
// for the target user. Soft action only — the auth user and history remain.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  user_id: string;
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

    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ ok: false, error: "invalid_token" }, 401);

    const admin = createClient(url, serviceKey);

    const { data: callerRoles } = await admin
      .from("ih_user_roles")
      .select("role")
      .eq("user_id", caller.id);
    if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
      return json({ ok: false, error: "not_admin" }, 403);
    }

    const { user_id } = (await req.json()) as Body;
    if (!user_id) return json({ ok: false, error: "user_id_required" }, 400);
    if (user_id === caller.id) {
      return json({ ok: false, error: "cannot_deactivate_self" }, 400);
    }

    const { error: updErr } = await admin
      .from("ih_staff_profiles")
      .update({
        status: "Inactive",
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", user_id);
    if (updErr) throw updErr;

    // Revoke active sessions for the target user.
    const { error: signOutErr } = await admin.auth.admin.signOut(user_id, "global");
    if (signOutErr) {
      console.warn("ih-deactivate-staff: signOut failed (continuing)", signOutErr);
    }

    return json({ ok: true, user_id });
  } catch (err) {
    console.error("ih-deactivate-staff error", err);
    return json({ ok: false, error: String((err as Error).message ?? err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
