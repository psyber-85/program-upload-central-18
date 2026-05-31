// Doc 4.2 §5–§13 — IH email dispatcher.
// Single sender identity: system@theaihq.net / "AIHQ Staff Portal".
// Idempotent: re-sending with same idempotency_key returns existing log row.
// Logs every send attempt to ih_email_log BEFORE the provider call (§12).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { requireAdmin } from "../_shared/auth.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDER_EMAIL = "system@theaihq.net";
const SENDER_NAME = "AIHQ Staff Portal";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_EVENTS = new Set([
  "welcome",
  "admin_broadcast",
  "ack_required_notice",
  "approval_needed",
  "approval_outcome",
  "payroll_reminder",
  "notion_readiness",
  "payslip_ready",
]);

interface SendRequest {
  eventType: string;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
  relatedTable?: string;
  relatedId?: string;
  idempotencyKey: string;
  force?: boolean;
}

function bad(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "method_not_allowed");

  const auth = await requireAdmin(req);
  if (!auth.ok) return bad(auth.status, auth.error);


  let body: SendRequest;
  try { body = await req.json(); } catch { return bad(400, "invalid_json"); }

  if (!body.eventType || !ALLOWED_EVENTS.has(body.eventType)) return bad(400, "invalid_event_type");
  if (!Array.isArray(body.to) || body.to.length === 0) return bad(400, "missing_to");
  if (!body.subject || !body.html) return bad(400, "missing_subject_or_html");
  if (!body.idempotencyKey) return bad(400, "missing_idempotency_key");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotency: return existing log row if already sent.
  const { data: existing } = await supabase
    .from("ih_email_log")
    .select("id, status, attempt_count")
    .eq("idempotency_key", body.idempotencyKey)
    .maybeSingle();

  if (existing && existing.status === "sent" && !body.force) {
    return new Response(JSON.stringify({ logId: existing.id, status: "sent", deduped: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Insert (or update on retry) log row in `pending` state BEFORE provider call.
  let logId: string;
  if (existing) {
    logId = existing.id;
    await supabase
      .from("ih_email_log")
      .update({
        status: "retrying",
        attempt_count: (existing.attempt_count ?? 1) + 1,
        error_message: null,
      })
      .eq("id", logId);
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("ih_email_log")
      .insert({
        event_type: body.eventType,
        to_addresses: body.to,
        cc_addresses: body.cc ?? [],
        subject: body.subject,
        related_table: body.relatedTable ?? null,
        related_id: body.relatedId ?? null,
        idempotency_key: body.idempotencyKey,
        status: "pending",
      })
      .select("id")
      .single();
    if (insErr || !inserted) return bad(500, `log_insert_failed:${insErr?.message ?? "unknown"}`);
    logId = inserted.id;
  }

  if (!SENDGRID_API_KEY) {
    await supabase.from("ih_email_log").update({
      status: "failed",
      error_message: "SENDGRID_API_KEY not configured",
    }).eq("id", logId);
    return bad(500, "sendgrid_not_configured");
  }

  // Provider call.
  try {
    const personalizations: Record<string, unknown> = {
      to: body.to.map((email) => ({ email })),
    };
    if (body.cc && body.cc.length > 0) {
      personalizations.cc = body.cc.map((email) => ({ email }));
    }

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [personalizations],
        from: { email: SENDER_EMAIL, name: SENDER_NAME },
        subject: body.subject,
        content: [
          { type: "text/plain", value: body.text ?? body.html.replace(/<[^>]+>/g, "") },
          { type: "text/html", value: body.html },
        ],
      }),
    });

    if (!sgRes.ok) {
      const errTxt = await sgRes.text();
      await supabase.from("ih_email_log").update({
        status: "failed",
        error_message: `sendgrid ${sgRes.status}: ${errTxt.slice(0, 500)}`,
      }).eq("id", logId);
      return new Response(JSON.stringify({ logId, status: "failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providerMsgId = sgRes.headers.get("x-message-id") ?? null;
    await supabase.from("ih_email_log").update({
      status: "sent",
      provider_message_id: providerMsgId,
      sent_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", logId);

    return new Response(JSON.stringify({ logId, status: "sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("ih_email_log").update({
      status: "failed",
      error_message: `exception: ${msg.slice(0, 500)}`,
    }).eq("id", logId);
    return bad(500, `send_failed:${msg}`);
  }
});
