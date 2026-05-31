import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { escapeHtml, jsonError } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HiringInterestRequest {
  picName: string;
  contactNumber: string;
  email: string;
  hiringNeeds: string;
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = await req.json().catch(() => null) as Partial<HiringInterestRequest> | null;
    if (!raw) return jsonError(400, "invalid_json");
    const picName = String(raw.picName ?? "").trim().slice(0, 120);
    const contactNumber = String(raw.contactNumber ?? "").trim().slice(0, 40);
    const email = String(raw.email ?? "").trim().slice(0, 200);
    const hiringNeeds = String(raw.hiringNeeds ?? "").trim().slice(0, 4000);
    if (!picName || !contactNumber || !email || !hiringNeeds) {
      return jsonError(400, "missing_fields");
    }
    if (!isEmail(email)) return jsonError(400, "invalid_email");

    const safePic = escapeHtml(picName);
    const safeContact = escapeHtml(contactNumber);
    const safeEmail = escapeHtml(email);
    const safeNeeds = escapeHtml(hiringNeeds);

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "info@theaihq.net";

    if (!SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }


    // Send LOI email to the employer
    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: FROM_EMAIL, name: "TryHire by TheAIHQ" },
        subject: "Your Hiring Interest - Letter of Intent from TryHire",
        content: [
          {
            type: "text/html",
            value: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">TryHire</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Hire First-Time Right</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Dear ${safePic},</h2>
    
    <p>Thank you for your interest in TryHire! We're excited to help you find the right talent for your organization.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #1e293b;">Your Hiring Requirements:</strong>
      <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${safeNeeds}</p>
    </div>
    
    <h3 style="color: #1e293b;">Next Steps:</h3>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">We will review your requirements and prepare a <strong>Hiring Letter of Intent (LOI)</strong> for you.</li>
      <li style="margin-bottom: 10px;">Once you receive and sign the LOI, our team will begin matching candidates to your needs.</li>
      <li style="margin-bottom: 10px;">Pre-screened candidates will be sent to you automatically from <strong>info@theaihq.net</strong>.</li>
    </ol>
    
    <p style="margin-top: 25px;">If you have any questions, feel free to reply to this email or contact us at <a href="mailto:info@theaihq.net" style="color: #f97316;">info@theaihq.net</a>.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        Best regards,<br>
        <strong style="color: #1e293b;">The TryHire Team</strong><br>
        TheAIHQ Sdn Bhd
      </p>
    </div>
  </div>
  
  <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
    © 2024 TryHire by TheAIHQ. All rights reserved.
  </p>
</body>
</html>
            `,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    // Also send internal notification
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: FROM_EMAIL }] }],
        from: { email: FROM_EMAIL, name: "TryHire System" },
        subject: `New Hiring Interest: ${safePic}`,
        content: [
          {
            type: "text/html",
            value: `
<h2>New Hiring Interest Submission</h2>
<p><strong>PIC Name:</strong> ${safePic}</p>
<p><strong>Contact:</strong> ${safeContact}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<h3>Hiring Needs:</h3>
<p style="white-space: pre-wrap;">${safeNeeds}</p>
            `,
          },
        ],
      }),
    });

    console.log("LOI email sent successfully to:", email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-hiring-loi function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
