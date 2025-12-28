import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@theaihq.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  recipientEmail: string;
  recipientName: string;
  customMessage: string;
  loginUrl?: string;
  senderName?: string;
}

const generateEmailHtml = (data: WelcomeEmailRequest): string => {
  const loginUrl = data.loginUrl || "https://theaihq.net/staff";
  const customParagraphs = data.customMessage
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.6;">${p}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The AI HQ</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to The AI HQ!</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We're excited to have you on board 🎉</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px 0; color: #333; font-size: 18px; font-weight: 500;">Dear ${data.recipientName},</p>
              
              ${customParagraphs}
              
              <!-- Login Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Access Staff Portal
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to reach out to your manager or the HR team.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #666; font-size: 14px;">
                Best regards,<br>
                <strong>${data.senderName || 'The AI HQ Team'}</strong>
              </p>
            </td>
          </tr>
          
          <!-- What's Next Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #2563eb;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a5f; font-size: 16px; font-weight: 600;">📋 What's Next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                      <li>Log in to the Staff Portal using your email</li>
                      <li>Complete your profile setup</li>
                      <li>Explore the portal features</li>
                      <li>Submit any required onboarding documents</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                This email was sent from the Staff Portal. If you believe you received this in error, please contact HR.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY not configured");
      throw new Error("SendGrid API key not configured");
    }

    const payload: WelcomeEmailRequest = await req.json();
    console.log("Sending welcome email to:", payload.recipientEmail);

    const emailHtml = generateEmailHtml(payload);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: payload.recipientEmail, name: payload.recipientName }],
          },
        ],
        from: { email: FROM_EMAIL, name: "The AI HQ" },
        subject: `Welcome to The AI HQ, ${payload.recipientName}!`,
        content: [
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error:", response.status, errorText);
      throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
    }

    console.log("Welcome email sent successfully to:", payload.recipientEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
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
