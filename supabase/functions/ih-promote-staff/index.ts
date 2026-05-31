// Doc 4.1 §5 — Admin promotes another Active staff to Admin (or revokes Admin).
// Caller must be authenticated and hold the 'admin' role in ih_user_roles.
// Cannot self-promote/demote (admins must ask another admin) and cannot demote
// the last remaining admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  target_user_id: string;
  action: "promote" | "revoke";
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
    const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) return json({ ok: false, error: "not_admin" }, 403);

    const body = (await req.json()) as Body;
    if (!body?.target_user_id || (body.action !== "promote" && body.action !== "revoke")) {
      return json({ ok: false, error: "invalid_body" }, 400);
    }
    if (body.target_user_id === caller.id) {
      return json({ ok: false, error: "cannot_modify_self" }, 400);
    }

    // Target must exist and be Active.
    const { data: target, error: tErr } = await admin
      .from("ih_staff_profiles")
      .select("id, status, name")
      .eq("id", body.target_user_id)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!target) return json({ ok: false, error: "target_not_found" }, 404);
    if (target.status !== "Active") {
      return json({ ok: false, error: "target_not_active" }, 400);
    }

    if (body.action === "promote") {
      const { error } = await admin
        .from("ih_user_roles")
        .upsert({ user_id: body.target_user_id, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw error;
      await admin
        .from("ih_staff_profiles")
        .update({ role: "admin" })
        .eq("id", body.target_user_id);
    } else {
      // Revoke — ensure at least one admin remains.
      const { count } = await admin
        .from("ih_user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return json({ ok: false, error: "last_admin" }, 400);
      }
      const { error } = await admin
        .from("ih_user_roles")
        .delete()
        .eq("user_id", body.target_user_id)
        .eq("role", "admin");
      if (error) throw error;
      await admin
        .from("ih_staff_profiles")
        .update({ role: "staff" })
        .eq("id", body.target_user_id);
    }

    console.log(`[ih-promote-staff] ${caller.id} ${body.action} ${body.target_user_id}`);
    return json({ ok: true });
  } catch (err) {
    console.error("ih-promote-staff error", err);
    return json({ ok: false, error: String((err as Error).message ?? err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
