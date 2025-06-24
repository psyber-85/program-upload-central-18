
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  prospect_name?: string;
  program_title?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('SendGrid function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    console.log('Request body:', body);
    
    const { to_email, to_name, subject, message } = body;

    if (!to_email || !subject || !message) {
      throw new Error("Missing required fields: to_email, subject, or message");
    }

    // Get SendGrid API key from environment
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }

    console.log('Sending email via SendGrid...');
    
    // SendGrid API request
    const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: to_email,
                name: to_name || to_email,
              },
            ],
            subject: subject,
          },
        ],
        from: {
          email: "noreply@yourcompany.com",
          name: "Training Administration",
        },
        content: [
          {
            type: "text/plain",
            value: message,
          },
        ],
      }),
    });

    console.log('SendGrid response status:', sendgridResponse.status);
    
    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
      console.error('SendGrid error response:', errorText);
      throw new Error(`SendGrid API error: ${sendgridResponse.status} - ${errorText}`);
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        recipient: to_email 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-hr-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
