// Doc 4.2 §6 + Patch 001 §10–§21 — Scheduled jobs (read-last authority: Patch 001).
// Jobs may prepare / remind / expire / retry / flag — never auto-finalize payroll
// or make high-impact decisions. All record-changing branches log via
// ih_log_system_audit (actor_role='system') so the audit trail stays consolidated
// in Doc 4.3 instead of fragmenting into per-feature mini-audits.
//
// Branches:
//   - Day 25 daily      → payroll reminder email (Patch 001 §11)
//   - Day 26 daily      → payroll draft prep (insert Draft run if missing)
//   - Day 29 daily      → payroll finalization reminder if not Finalized/Locked
//   - Daily             → Notion readiness reminder (Patch 001 §12)
//   - Daily             → carry-forward AL expiry (Patch 001 §13)
//   - Weekly (Mon UTC)  → ack-required notice digest to admins (Patch 001 §14)
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

async function send(_supabase: unknown, payload: Record<string, unknown>) {
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

async function logSystemAudit(
  supabase: ReturnType<typeof createClient>,
  action: string,
  targetTable: string,
  targetId: string | null,
  summary: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await supabase.rpc("ih_log_system_audit", {
      _action: action,
      _target_table: targetTable,
      _target_id: targetId,
      _summary: summary,
      _metadata: metadata,
    });
  } catch (e) {
    console.error("system audit failed", action, e);
  }
}

function isoWeekKey(d: Date): string {
  // YYYY-Www
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date();
  const dayOfMonth = today.getUTCDate();
  const dayOfWeek = today.getUTCDay(); // 0=Sun, 1=Mon
  const isoDate = today.toISOString().slice(0, 10);
  const monthKey = today.toISOString().slice(0, 7); // YYYY-MM

  // Resolve admin emails
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

  const results: Record<string, unknown> = {
    date: isoDate,
    payroll_reminder: null,
    payroll_draft: null,
    payroll_finalize_reminder: null,
    notion: [],
    carry_forward_expiry: { expired: 0 },
    ack_reminder: { notices: 0 },
  };

  // --- §11 Day 25: payroll reminder ---
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
      results.payroll_reminder = r.status;
      await logSystemAudit(supabase, "payroll.reminder_sent", "ih_payroll_runs", null,
        `Payroll reminder sent for ${monthKey}`, { month: monthKey });
    } else {
      results.payroll_reminder = "already_finalized";
    }
  }

  // --- §11 Day 26: payroll draft prep ---
  if (dayOfMonth === 26) {
    const { data: existing } = await supabase
      .from("ih_payroll_runs")
      .select("id, status")
      .eq("month", monthKey)
      .maybeSingle();
    if (!existing) {
      const { data: created, error } = await supabase
        .from("ih_payroll_runs")
        .insert({ month: monthKey, status: "Draft" } as any)
        .select("id")
        .single();
      if (!error && created) {
        results.payroll_draft = { created: true, id: (created as any).id };
        await logSystemAudit(supabase, "payroll.draft_prepared", "ih_payroll_runs",
          (created as any).id, `Draft payroll prepared for ${monthKey}`, { month: monthKey });
      } else {
        results.payroll_draft = { created: false, error: error?.message ?? "unknown" };
      }
    } else {
      results.payroll_draft = { created: false, existed: true, status: (existing as any).status };
    }
  }

  // --- §11 Day 29: finalization reminder ---
  if (dayOfMonth === 29 && adminEmails.length > 0) {
    const { data: runs } = await supabase
      .from("ih_payroll_runs")
      .select("id, status")
      .eq("month", monthKey)
      .in("status", ["Finalized", "Locked"]);
    if (!runs || runs.length === 0) {
      const r = await send(supabase, {
        eventType: "payroll_reminder",
        to: adminEmails,
        subject: `Payroll finalization reminder — ${monthKey} still pending`,
        html: `
          <p>Payroll for <strong>${monthKey}</strong> is still not finalized. The review window ends today.</p>
          <p>Open payroll: <a href="${PORTAL_URL}/staff/admin/payroll">${PORTAL_URL}/staff/admin/payroll</a></p>
          <p style="color:#777;font-size:12px;margin-top:32px">— AIHQ Staff Portal</p>
        `,
        idempotencyKey: `payroll-finalize-reminder-${monthKey}-${isoDate}`,
      });
      results.payroll_finalize_reminder = r.status;
      await logSystemAudit(supabase, "payroll.finalize_reminder_sent", "ih_payroll_runs", null,
        `Finalization reminder sent for ${monthKey}`, { month: monthKey });
    } else {
      results.payroll_finalize_reminder = "already_finalized";
    }
  }

  // --- §12 Notion readiness reminder ---
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

  // --- §13 Carry-forward AL expiry (daily) ---
  {
    const { data: expired } = await supabase
      .from("ih_leave_balances")
      .select("id, staff_id, year, al_carry_forward, al_carry_forward_expires_on")
      .gt("al_carry_forward", 0)
      .lt("al_carry_forward_expires_on", isoDate);
    if (expired && expired.length > 0) {
      for (const row of expired as any[]) {
        const { error } = await supabase
          .from("ih_leave_balances")
          .update({ al_carry_forward: 0, al_carry_forward_expires_on: null })
          .eq("id", row.id);
        if (!error) {
          await logSystemAudit(supabase, "leave.carry_forward_expired", "ih_leave_balances",
            row.id, `Carry-forward AL expired for staff (${row.al_carry_forward} day(s))`,
            { staffId: row.staff_id, year: row.year, amount: row.al_carry_forward,
              expiredOn: row.al_carry_forward_expires_on });
        }
      }
      (results.carry_forward_expiry as any).expired = expired.length;
    }
  }

  // --- §14 Acknowledgment reminder digest (weekly, Mondays) ---
  if (dayOfWeek === 1 && adminEmails.length > 0) {
    const threshold = new Date(today);
    threshold.setUTCDate(threshold.getUTCDate() - 3);
    const { data: notices } = await supabase
      .from("ih_notices")
      .select("id, title, created_at")
      .eq("ack_required", true)
      .is("archived_at", null)
      .lt("created_at", threshold.toISOString());

    const overdue: Array<{ id: string; title: string; pending: number }> = [];
    for (const n of (notices ?? []) as any[]) {
      // Count Active staff
      const { count: totalStaff } = await supabase
        .from("ih_staff_profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "Active");
      const { count: ackedCount } = await supabase
        .from("ih_notice_acks")
        .select("notice_id", { count: "exact", head: true })
        .eq("notice_id", n.id);
      const pending = Math.max(0, (totalStaff ?? 0) - (ackedCount ?? 0));
      if (pending > 0) overdue.push({ id: n.id, title: n.title, pending });
    }

    if (overdue.length > 0) {
      const weekKey = isoWeekKey(today);
      const rows = overdue.map((o) =>
        `<li><a href="${PORTAL_URL}/staff/admin/notices/${o.id}">${escapeHtml(o.title)}</a> — ${o.pending} pending</li>`
      ).join("");
      const r = await send(supabase, {
        eventType: "ack_required_notice",
        to: adminEmails,
        subject: `Pending acknowledgments — ${overdue.length} notice(s)`,
        html: `
          <p>The following acknowledgment-required notices still have pending recipients:</p>
          <ul>${rows}</ul>
          <p style="color:#777;font-size:12px;margin-top:32px">— AIHQ Staff Portal</p>
        `,
        idempotencyKey: `ack-reminder-digest-${weekKey}`,
      });
      (results.ack_reminder as any) = { notices: overdue.length, status: r.status, week: weekKey };
      await logSystemAudit(supabase, "notice.ack_reminder_sent", "ih_notices", null,
        `Ack-reminder digest sent (${overdue.length} notice(s))`,
        { week: weekKey, notices: overdue.map((o) => o.id) });
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
