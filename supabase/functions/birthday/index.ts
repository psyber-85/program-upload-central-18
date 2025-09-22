import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatInTimeZone } from "https://esm.sh/date-fns-tz@3.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendGridResponse {
  statusCode: number;
  body?: any;
}

async function sendBirthdayEmail(to: string, name: string): Promise<SendGridResponse> {
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

  return {
    statusCode: response.status,
    body: response.status !== 202 ? await response.text() : null
  };
}

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  const delays = [0, 2000, 5000];
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      // Only retry on 429 or 5xx errors
      if (error instanceof Error && error.message.includes('429') || 
          error instanceof Error && error.message.includes('5')) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TIMEZONE = 'Asia/Kuala_Lumpur';
    const now = new Date();
    const mmdd = formatInTimeZone(now, TIMEZONE, 'MM-dd');
    const year = formatInTimeZone(now, TIMEZONE, 'yyyy');
    const dateLocalISO = formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd');

    console.log(`Birthday function called for ${dateLocalISO} (${mmdd})`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query only today's birthdays, including those who haven't been sent emails yet (NULL) 
    // or those whose last sent year is not this year
    // Use DISTINCT ON (email) to prevent duplicate emails even if data has duplicates
    const { data: birthdayPeople, error } = await supabase
      .from('participants_bday_duplicate')
      .select('id, name, email, last_birthday_sent_year')
      .eq('birth_mmdd', mmdd)
      .or(`last_birthday_sent_year.is.null,last_birthday_sent_year.neq.${year}`)
      .order('email, registered_at', { ascending: false }); // Order by email first, then latest registration

    

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const stats = {
      dateLocal: dateLocalISO,
      mmdd,
      sent: 0,
      skippedNoEmail: 0,
      skippedAlreadyThisYear: 0,
      totalCandidates: birthdayPeople?.length || 0,
      errors: [] as Array<{id: string, email: string, reason: string}>
    };

    console.log(`Found ${stats.totalCandidates} birthday candidates`);

    // Track processed emails to prevent duplicates
    const processedEmails = new Set<string>();

    if (birthdayPeople && birthdayPeople.length > 0) {
      for (const person of birthdayPeople) {
        if (!person.email) {
          stats.skippedNoEmail++;
          continue;
        }

        // Skip if we've already processed this email
        if (processedEmails.has(person.email.toLowerCase())) {
          console.log(`Skipping duplicate email: ${person.email}`);
          continue;
        }
        
        processedEmails.add(person.email.toLowerCase());

        try {
          await retryOperation(async () => {
            const result = await sendBirthdayEmail(person.email, person.name);
            if (result.statusCode !== 202) {
              throw new Error(`SendGrid error: ${result.statusCode} - ${result.body}`);
            }
          });

          // Update last_birthday_sent_year if column exists
          const { error: updateError } = await supabase
            .from('participants_bday_duplicate')
            .update({ last_birthday_sent_year: year })
            .eq('id', person.id);

          if (updateError) {
            console.error(`Failed to update last_birthday_sent_year for ${person.id}:`, updateError);
            // Don't fail the whole operation for update errors
          }

          stats.sent++;
          console.log(`Sent birthday email to ${person.name} (${person.email})`);

        } catch (error) {
          console.error(`Failed to send email to ${person.email}:`, error);
          stats.errors.push({
            id: person.id,
            email: person.email,
            reason: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    console.log(`Birthday function completed:`, stats);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Birthday function error:', error);
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