// Doc 4.2 §16–§21 — Sync approved leave / accepted MC to the shared team Google Calendar.
// Privacy: title is "<Name> — Leave" or "<Name> — MC". Description is always empty.
// Never includes reason, medical notes, or attachment references.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders, requireAdmin, jsonError } from "../_shared/auth.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

interface Body { action: "upsert" | "cancel"; request_id: string }

function buildSummary(staffName: string, type: string): string {
  return `${staffName} — ${type === "mc" ? "MC" : "Leave"}`;
}

function buildEventPayload(req: any, staffName: string) {
  const isHalf = !!req.half_day_slot;
  const summary = buildSummary(staffName, String(req.type ?? "leave").toLowerCase());

  // Strictly omit description, attachments, reason, notes (§21).
  const base: Record<string, unknown> = {
    summary,
    visibility: "default",
    reminders: { useDefault: false, overrides: [] },
  };

  if (isHalf) {
    // §19 — half-day timed block (MYT = UTC+8)
    const dateStr = String(req.start_date ?? req.date ?? "").slice(0, 10);
    if (!dateStr) throw new Error("missing_start_date_for_half_day");
    const startHour = req.half_day_slot === "afternoon" ? "14:00:00" : "09:00:00";
    const endHour = req.half_day_slot === "afternoon" ? "18:00:00" : "13:00:00";
    return {
      ...base,
      start: { dateTime: `${dateStr}T${startHour}`, timeZone: "Asia/Kuala_Lumpur" },
      end:   { dateTime: `${dateStr}T${endHour}`,   timeZone: "Asia/Kuala_Lumpur" },
    };
  }

  // §18 — full-day(s) all-day event. Google Calendar all-day end.date is exclusive.
  const startDate = String(req.start_date ?? req.date ?? "").slice(0, 10);
  let endRaw = String(req.end_date ?? req.start_date ?? req.date ?? "").slice(0, 10);
  if (!startDate) throw new Error("missing_start_date");
  // Defensive: clamp end < start to a single-day event so Google doesn't 400 with timeRangeEmpty.
  if (endRaw < startDate) endRaw = startDate;
  const endExclusive = new Date(endRaw);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  return {
    ...base,
    start: { date: startDate },
    end:   { date: endExclusive.toISOString().slice(0, 10) },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: corsHeaders });
  }
  if (!body.request_id || !["upsert", "cancel"].includes(body.action)) {
    return new Response(JSON.stringify({ error: "bad_input" }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const logSync = (status: string, gcal_event_id: string | null, error: string | null) =>
    supabase.from("ih_calendar_sync_log").insert({
      request_id: body.request_id,
      action: body.action,
      status,
      gcal_event_id,
      error_message: error,
    });

  const { data: cfg } = await supabase.from("ih_calendar_config").select("*").eq("id", 1).maybeSingle();
  if (!cfg?.enabled || !cfg?.calendar_id) {
    await logSync("skipped", null, "calendar_not_configured");
    return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders });
  }

  const { data: reqRow } = await supabase
    .from("ih_requests")
    .select("*")
    .eq("id", body.request_id)
    .maybeSingle();
  // Normalize: schema stores `kind` enum + dates inside `payload` jsonb.
  // The sync builder expects flat `type`, `start_date`, `end_date`, `half_day_slot`.
  const payload = (reqRow.payload ?? {}) as Record<string, unknown>;
  const kindLower = String(reqRow.kind ?? "").toLowerCase();
  const flat = {
    ...reqRow,
    type: kindLower,
    start_date: (reqRow as any).start_date ?? payload.start_date ?? payload.date,
    end_date:   (reqRow as any).end_date   ?? payload.end_date   ?? payload.date,
    date:       (reqRow as any).date       ?? payload.date,
    half_day_slot: reqRow.half_day_slot ?? payload.half_day_slot ?? null,
  };

  if (!["leave", "mc"].includes(kindLower)) {
    await logSync("skipped", reqRow.gcal_event_id, "not_leave_or_mc");
    return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders });
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    await logSync("failed", reqRow.gcal_event_id, "missing_connector_secrets");
    return new Response(JSON.stringify({ error: "missing_secrets" }), { status: 500, headers: corsHeaders });
  }
  const authHeaders = {
    "Authorization": `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gcalKey,
    "Content-Type": "application/json",
  };
  const calId = encodeURIComponent(cfg.calendar_id);

  try {
    if (body.action === "cancel") {
      if (reqRow.gcal_event_id) {
        const res = await fetch(
          `${GATEWAY}/calendars/${calId}/events/${encodeURIComponent(reqRow.gcal_event_id)}`,
          { method: "DELETE", headers: authHeaders },
        );
        // 404 / 410 are fine — event already gone
        if (!res.ok && ![404, 410].includes(res.status)) {
          const txt = await res.text();
          await logSync("failed", reqRow.gcal_event_id, `gcal_delete ${res.status}: ${txt.slice(0, 300)}`);
          return new Response(JSON.stringify({ error: "delete_failed" }), { status: 502, headers: corsHeaders });
        }
        await supabase.from("ih_requests").update({
          gcal_event_id: null, gcal_sync_error: null,
        }).eq("id", reqRow.id);
      }
      await logSync("success", reqRow.gcal_event_id, null);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // upsert
    const { data: staff } = await supabase
      .from("ih_staff_profiles")
      .select("name")
      .eq("id", reqRow.staff_id)
      .maybeSingle();
    const staffName = (staff as any)?.name ?? "Staff member";
    const eventPayload = buildEventPayload(flat, staffName);


    let res: Response;
    if (reqRow.gcal_event_id) {
      res = await fetch(
        `${GATEWAY}/calendars/${calId}/events/${encodeURIComponent(reqRow.gcal_event_id)}`,
        { method: "PUT", headers: authHeaders, body: JSON.stringify(eventPayload) },
      );
    } else {
      res = await fetch(
        `${GATEWAY}/calendars/${calId}/events`,
        { method: "POST", headers: authHeaders, body: JSON.stringify(eventPayload) },
      );
    }


    if (!res.ok) {
      const txt = await res.text();
      const errMsg = `gcal ${res.status}: ${txt.slice(0, 300)}`;
      await supabase.from("ih_requests").update({ gcal_sync_error: errMsg }).eq("id", reqRow.id);
      await logSync("failed", reqRow.gcal_event_id, errMsg);
      return new Response(JSON.stringify({ error: "gcal_failed", detail: errMsg }), { status: 502, headers: corsHeaders });
    }

    const ev = await res.json();
    await supabase.from("ih_requests").update({
      gcal_event_id: ev.id, gcal_sync_error: null,
    }).eq("id", reqRow.id);
    await logSync("success", ev.id, null);

    return new Response(JSON.stringify({ ok: true, event_id: ev.id }), { headers: corsHeaders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("ih_requests").update({ gcal_sync_error: msg.slice(0, 500) }).eq("id", reqRow.id);
    await logSync("failed", reqRow.gcal_event_id, msg.slice(0, 500));
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
  }
});

// Exported for unit testing.
export { buildEventPayload, buildSummary };
