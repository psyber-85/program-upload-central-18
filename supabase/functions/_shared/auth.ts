// Shared auth helpers for edge functions.
// Used to lock down endpoints to admins, payslip owners, or cron callers.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export type AuthResult =
  | { ok: true; userId: string | null; isService: boolean; isAdmin: boolean }
  | { ok: false; status: number; error: string };

/**
 * Validate caller and return their identity.
 * - Accepts the Supabase service-role token (server-to-server calls).
 * - Otherwise validates the user JWT and looks up their IH admin role.
 */
export async function authenticate(req: Request): Promise<AuthResult> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, error: "missing_authorization" };
  }
  const token = auth.slice(7).trim();
  if (!token) return { ok: false, status: 401, error: "missing_authorization" };

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (serviceKey && token === serviceKey) {
    return { ok: true, userId: null, isService: true, isAdmin: true };
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data: userRes, error } = await sb.auth.getUser();
  if (error || !userRes?.user) {
    return { ok: false, status: 401, error: "invalid_jwt" };
  }
  const admin = serviceClient();
  const { data: roleRow } = await admin
    .from("ih_user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return {
    ok: true,
    userId: userRes.user.id,
    isService: false,
    isAdmin: !!roleRow,
  };
}

/** Require admin or service-role caller. */
export async function requireAdmin(req: Request): Promise<AuthResult> {
  const a = await authenticate(req);
  if (!a.ok) return a;
  if (!a.isAdmin) return { ok: false, status: 403, error: "admin_required" };
  return a;
}

/**
 * Cron-friendly gate: accept a shared CRON_SECRET via `x-cron-secret` header
 * (or `Authorization: Bearer <CRON_SECRET>`), or the service-role token.
 */
export function requireCronOrService(req: Request):
  | { ok: true }
  | { ok: false; status: number; error: string }
{
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const header = req.headers.get("x-cron-secret") ?? "";
  if (cronSecret && header && header === cronSecret) return { ok: true };

  const auth = req.headers.get("Authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (cronSecret && token === cronSecret) return { ok: true };
    if (serviceKey && token === serviceKey) return { ok: true };
  }
  return { ok: false, status: 401, error: "unauthorized_cron" };
}
