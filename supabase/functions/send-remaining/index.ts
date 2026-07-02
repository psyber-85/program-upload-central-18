import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { formatInTimeZone } from "https://esm.sh/date-fns-tz@3.2.0";
import { authenticate, corsHeaders, jsonError } from "../_shared/auth.ts";

interface SendGridResponse {
  statusCode: number;
  body?: unknown;
}

async function sendBirthdayEmail(to: string, name: string): Promise<SendGridResponse> {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  const SENDGRID_TEMPLATE_ID = Deno.env.get("SENDGRID_TEMPLATE_ID");
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL");

  if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID || !FROM_EMAIL) {
    throw new Error("Missing SendGrid configuration");
  }

  const emailData = {
    personalizations: [{ to: [{ email: to }], dynamic_template_data: { name } }],
    from: { email: FROM_EMAIL, name: "AIHQ - theaihq.net" },
    template_id: SENDGRID_TEMPLATE_ID,
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  return {
    statusCode: response.status,
    body: response.status !== 202 ? await response.text() : null,
  };
}

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  const delays = [0, 2000, 5000];
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("429") || msg.includes("5")) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonError(405, "method_not_allowed");

  try {
    const auth = await authenticate(req);
    if (!auth.ok) return jsonError(auth.status, auth.error);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (!auth.isAdmin && !auth.isService) {
      if (!auth.userId) return jsonError(403, "forbidden");
      const { data: staff } = await supabase
        .from("ih_staff_profiles")
        .select("status")
        .eq("id", auth.userId)
        .maybeSingle();
      if (!staff || staff.status !== "Active") return jsonError(403, "active_staff_required");
    }

    const TIMEZONE = "Asia/Kuala_Lumpur";
    const now = new Date();
    const mmdd = formatInTimeZone(now, TIMEZONE, "MM-dd");
    const year = formatInTimeZone(now, TIMEZONE, "yyyy");

    console.log(`Send remaining function called for ${mmdd}`);

    const { data: pendingBirthdays, error } = await supabase
      .from("participants_bday_duplicate")
      .select("id, name, email, last_birthday_sent_year")
      .eq("birth_mmdd", mmdd)
      .or(`last_birthday_sent_year.is.null,last_birthday_sent_year.neq.${year}`)
      .order("email, registered_at", { ascending: false });

    if (error) return jsonError(500, error.message);

    const stats = {
      sent: 0,
      pendingBefore: pendingBirthdays?.length ?? 0,
      errors: [] as Array<{ id: string; email: string; reason: string }>,
    };

    const processedEmails = new Set<string>();

    for (const person of pendingBirthdays ?? []) {
      if (!person.email) continue;
      if (processedEmails.has(person.email.toLowerCase())) continue;
      processedEmails.add(person.email.toLowerCase());

      try {
        await retryOperation(async () => {
          const result = await sendBirthdayEmail(person.email, person.name);
          if (result.statusCode !== 202) {
            throw new Error(`SendGrid error: ${result.statusCode} - ${result.body}`);
          }
        });

        await supabase
          .from("participants_bday_duplicate")
          .update({ last_birthday_sent_year: year })
          .eq("id", person.id);

        stats.sent++;
      } catch (err) {
        stats.errors.push({
          id: person.id,
          email: person.email,
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    console.log("Send remaining completed:", stats);
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send remaining error:", error);
    return jsonError(500, error instanceof Error ? error.message : "unknown_error");
  }
});
