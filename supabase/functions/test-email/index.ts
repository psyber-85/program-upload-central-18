import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { authenticate, corsHeaders, jsonError } from "../_shared/auth.ts";

interface TestEmailRequest {
  to: string;
  name: string;
}

async function sendTestEmail(to: string, name: string): Promise<void> {
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

  if (response.status !== 202) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonError(405, "method_not_allowed");

  try {
    const auth = await authenticate(req);
    if (!auth.ok) return jsonError(auth.status, auth.error);

    // Allow admin/service straight through; otherwise require Active IH staff.
    if (!auth.isAdmin && !auth.isService) {
      if (!auth.userId) return jsonError(403, "forbidden");
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: staff } = await admin
        .from("ih_staff_profiles")
        .select("status")
        .eq("id", auth.userId)
        .maybeSingle();
      if (!staff || staff.status !== "Active") return jsonError(403, "active_staff_required");
    }

    const { to, name }: TestEmailRequest = await req.json();
    if (!to || !name) return jsonError(400, "missing_to_or_name");

    console.log(`Sending test email to ${to} with name ${name}`);
    await sendTestEmail(to, name);
    console.log(`Test email sent successfully to ${to}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Test email function error:", error);
    return jsonError(500, error instanceof Error ? error.message : "unknown_error");
  }
});
