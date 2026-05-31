// Helper for CalendarSettings.tsx — lists calendars from the linked Google Calendar connection.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    return new Response(JSON.stringify({ error: "missing_connector_secrets" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${GATEWAY}/users/me/calendarList?minAccessRole=writer`, {
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gcalKey,
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `gcal ${res.status}: ${txt.slice(0, 300)}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    const items = (data.items ?? []).map((c: Record<string, unknown>) => ({
      id: c.id, summary: c.summary, primary: c.primary ?? false,
    }));
    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
