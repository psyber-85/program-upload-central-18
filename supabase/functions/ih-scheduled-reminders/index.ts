// Doc 4.2 §6 (items 7 & 8) — Daily reminders:
//  - Payroll reminder to Admins on day 25 if no Finalized run for current month
//  - Notion readiness reminder for staff whose join_date+1mo has elapsed and notion_unlocked_at IS NULL
// Idempotency keys include YYYY-MM-DD so each reminder fires at most once per day.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PORTAL_URL = Deno.env.get("PORTAL_URL") ?? "https://tryhire.theaihq.net";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function send(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/ih-send-email`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify(payload),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date();
  const dayOfMonth = today.getUTCDate();
  const isoDate = today.toISOString().slice(0, 10);
  const monthKey = today.toISOString().slice(0, 7); // YYYY-MM

  // Resolve admin emails (via ih_user_roles + ih_staff_profiles)
  const { data: adminRoles } = await supabase
    .from("ih_user_roles")
    .select("user_id")
    .eq("role", "admin");
  const adminIds = (adminRoles ?? []).map((r: any) => r.user_id);
  let adminEmails: string[] = [];
  if (adminIds.length > 0) {
    const { data: profs } = await supabase
      .from("ih_staff_profiles")
      .select("email")
      .in("id", adminIds)
      .eq("status", "Active");
    adminEmails = (profs ?? []).map((p: any) => p.email).filter(Boolean);
  }

  const results: Record<string, unknown> = { date: isoDate, payroll: null, notion: [] };

  // --- Payroll reminder (day 25) ---
  if (dayOfMonth === 25 && adminEmails.length > 0) {
    const { data: runs } = await supabase
      .from("ih_payroll_runs")
      .select("id, status")
      .eq("month", monthKey)
      .in("status", ["Finalized", "Locked"]);
    if (!runs || runs.length === 0) {
      const r = await send(supabase, {
        eventType: "payroll_reminder",
        to: adminEmails,
        subject: `Payroll reminder — ${monthKey} run not yet finalized`,
        html: `
          <p>This is a friendly reminder that payroll for <strong>${monthKey}</strong> has not been finalized yet.</p>
          <p>Open payroll: <a href="${PORTAL_URL}/staff/admin/payroll">${PORTAL_URL}/staff/admin/payroll</a></p>
          <p style="color:#777;font-size:12px;margin-top:32px">— AIHQ Staff Portal</p>
        `,
        idempotencyKey: `payroll-reminder-${monthKey}-${isoDate}`,
      });
      results.payroll = r.status;
    } else {
      results.payroll = "already_finalized";
    }
  }

  // --- Notion readiness reminder ---
  const cutoff = new Date(today);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 1);
  const { data: dueStaff } = await supabase
    .from("ih_staff_profiles")
    .select("id, name, email, join_date")
    .eq("status", "Active")
    .is("notion_unlocked_at", null)
    .lte("join_date", cutoff.toISOString().slice(0, 10));

  if (dueStaff && dueStaff.length > 0 && adminEmails.length > 0) {
    for (const s of dueStaff as any[]) {
      const r = await send(supabase, {
        eventType: "notion_readiness",
        to: adminEmails,
        subject: `Notion access ready to unlock — ${s.name}`,
        html: `
          <p><strong>${escapeHtml(s.name ?? "Staff")}</strong> joined on ${escapeHtml(s.join_date ?? "")} and is now eligible for Notion access (1 month has passed).</p>
          <p>Unlock in portal: <a href="${PORTAL_URL}/staff/admin/staff/${s.id}">${PORTAL_URL}/staff/admin/staff/${s.id}</a></p>
          <p style="color:#777;font-size:12px;margin-top:32px">— AIHQ Staff Portal</p>
        `,
        idempotencyKey: `notion-readiness-${s.id}-${isoDate}`,
      });
      (results.notion as unknown[]).push({ staffId: s.id, status: r.status });
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
