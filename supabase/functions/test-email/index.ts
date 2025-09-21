import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  to: string;
  name: string;
}

async function sendTestEmail(to: string, name: string): Promise<boolean> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  const SENDGRID_TEMPLATE_ID = Deno.env.get('SENDGRID_TEMPLATE_ID');
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL');
  
  if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID || !FROM_EMAIL) {
    throw new Error('Missing SendGrid configuration');
  }

  const emailData = {
    personalizations: [{
      to: [{ email: to }],
      dynamic_template_data: { name }
    }],
    from: { email: FROM_EMAIL, name: "AIHQ - theaihq.net" },
    template_id: SENDGRID_TEMPLATE_ID
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (response.status !== 202) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
  }

  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Verify TEST_TOKEN
    const authHeader = req.headers.get('Authorization');
    const TEST_TOKEN = Deno.env.get('TEST_TOKEN');
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== TEST_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { to, name }: TestEmailRequest = await req.json();

    if (!to || !name) {
      return new Response(JSON.stringify({ error: 'Missing to or name in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Sending test email to ${to} with name ${name}`);

    await sendTestEmail(to, name);

    console.log(`Test email sent successfully to ${to}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Test email function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);