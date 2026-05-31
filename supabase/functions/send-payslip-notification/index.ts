import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdmin, jsonError, escapeHtml } from "../_shared/auth.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@theaihq.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayslipNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  month: string;
  baseSalary: number;
  epf: number;
  socso: number;
  claimsTotal: number;
  trainingClaimsTotal: number;
  netPay: number;
}

const formatCurrency = (amount: number): string => {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const generateEmailHtml = (data: PayslipNotificationRequest): string => {
  const additions = data.claimsTotal + data.trainingClaimsTotal;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Payslip for ${data.month}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px 40px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payslip Notification</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">${data.month}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">Dear ${data.recipientName},</p>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 14px; line-height: 1.6;">
                Your payslip for <strong>${data.month}</strong> has been finalized. Please find the summary below:
              </p>
              
              <!-- Payslip Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-size: 14px;">Base Salary</td>
                        <td style="padding: 10px 0; color: #333; font-size: 14px; text-align: right; font-weight: 500;">${formatCurrency(data.baseSalary)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-size: 14px;">EPF Deduction</td>
                        <td style="padding: 10px 0; color: #dc2626; font-size: 14px; text-align: right;">-${formatCurrency(data.epf)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-size: 14px;">SOCSO Deduction</td>
                        <td style="padding: 10px 0; color: #dc2626; font-size: 14px; text-align: right;">-${formatCurrency(data.socso)}</td>
                      </tr>
                      ${additions > 0 ? `
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-size: 14px;">Claims & Reimbursements</td>
                        <td style="padding: 10px 0; color: #16a34a; font-size: 14px; text-align: right;">+${formatCurrency(additions)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 10px;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #333; font-size: 16px; font-weight: 600;">Net Pay</td>
                        <td style="padding: 10px 0; color: #1e3a5f; font-size: 18px; text-align: right; font-weight: 700;">${formatCurrency(data.netPay)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                You can view your full payslip details by logging into the Staff Portal.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #666; font-size: 14px;">
                Best regards,<br>
                <strong>The AI HQ HR Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                This is an automated message from the Staff Portal. Please do not reply to this email.
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
  console.log("send-payslip-notification function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return jsonError(auth.status, auth.error);

  try {
    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY not configured");
      throw new Error("SendGrid API key not configured");
    }

    const payload: PayslipNotificationRequest = await req.json();
    console.log("Sending payslip notification to:", payload.recipientEmail);

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
        from: { email: FROM_EMAIL, name: "The AI HQ Staff Portal" },
        subject: `Your Payslip for ${payload.month}`,
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

    console.log("Payslip notification sent successfully to:", payload.recipientEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Payslip notification sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-payslip-notification:", error);
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
