import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";
import { formatInTimeZone } from "npm:date-fns-tz@3.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParticipantRow {
  id: string;
  name: string;
  email: string;
  birth_date: string | null;
  last_birthday_sent_year?: string | null;
  birth_mmdd?: string | null;
}

interface EmailSendResult {
  dateLocal: string;
  mmdd: string;
  sent: number;
  skippedNoEmail: number;
  skippedAlreadyThisYear: number;
  totalCandidates: number;
  errors: Array<{ id: string; email: string; reason: string }>;
  dryRun?: boolean;
}

const getTodayParts = (timezone: string, overrideDate?: string) => {
  const date = overrideDate ? new Date(overrideDate) : new Date();
  const dateLocalISO = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  const mmdd = formatInTimeZone(date, timezone, 'MM-dd');
  const year = formatInTimeZone(date, timezone, 'yyyy');
  const monthNum = parseInt(formatInTimeZone(date, timezone, 'M'));
  
  return { dateLocalISO, mmdd, year, monthNum };
};

const sendBirthdayEmail = async (resend: Resend, participant: ParticipantRow, dryRun: boolean = false) => {
  if (dryRun) {
    // Simulate sending without actually sending
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
  }

  const templateId = Deno.env.get('SENDGRID_TEMPLATE_ID');
  const fromEmail = Deno.env.get('FROM_EMAIL');
  
  if (!templateId || !fromEmail) {
    throw new Error('Missing SENDGRID_TEMPLATE_ID or FROM_EMAIL environment variables');
  }

  return await resend.emails.send({
    from: fromEmail,
    to: [participant.email],
    subject: `Happy Birthday, ${participant.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">🎉 Happy Birthday! 🎂</h1>
        <p style="font-size: 18px; color: #555;">Dear ${participant.name},</p>
        <p style="font-size: 16px; color: #666; line-height: 1.5;">
          Wishing you a very happy birthday! May this special day bring you joy, happiness, and wonderful memories.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5;">
          Thank you for being part of our training programs. We hope you have a fantastic celebration!
        </p>
        <p style="font-size: 16px; color: #666; margin-top: 30px;">
          Best wishes,<br>
          <strong>HRDC Training Team</strong>
        </p>
      </div>
    `,
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Validate test token
    const authHeader = req.headers.get('Authorization');
    const testToken = Deno.env.get('TEST_TOKEN');
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== testToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const timezone = Deno.env.get('TIMEZONE') || 'Asia/Kuala_Lumpur';

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const { overrideDate, dryRun } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { dateLocalISO, mmdd, year } = getTodayParts(timezone, overrideDate);
    
    console.log(`${dryRun ? 'Dry run' : 'Manual run'} processing birthdays for ${dateLocalISO} (${mmdd})`);

    // First, try to fetch using birth_mmdd column for efficiency
    let { data: candidates, error } = await supabase
      .from('participants_bday_duplicate')
      .select('id, name, email, birth_date, last_birthday_sent_year, birth_mmdd')
      .eq('birth_mmdd', mmdd);

    // If birth_mmdd column doesn't exist or is empty, fallback to memory filtering
    if (error || !candidates || candidates.length === 0) {
      console.log('Fallback: querying all participants and filtering by birth_date');
      const { data: allParticipants, error: allError } = await supabase
        .from('participants_bday_duplicate')
        .select('id, name, email, birth_date, last_birthday_sent_year');

      if (allError) throw allError;

      candidates = (allParticipants || []).filter((p: ParticipantRow) => {
        if (!p.birth_date) return false;
        const birthMmdd = new Date(p.birth_date).toISOString().slice(5, 10);
        return birthMmdd === mmdd;
      });
    }

    console.log(`Found ${candidates?.length || 0} birthday candidates`);

    const result: EmailSendResult = {
      dateLocal: dateLocalISO,
      mmdd,
      sent: 0,
      skippedNoEmail: 0,
      skippedAlreadyThisYear: 0,
      totalCandidates: candidates?.length || 0,
      errors: [],
      dryRun
    };

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process each candidate
    for (const participant of candidates) {
      try {
        // Skip if no email
        if (!participant.email || !participant.email.trim()) {
          result.skippedNoEmail++;
          continue;
        }

        // Skip if already sent this year (if column exists) - only for non-dry-runs
        if (!dryRun && participant.last_birthday_sent_year === year) {
          result.skippedAlreadyThisYear++;
          continue;
        }

        // Send birthday email (or simulate)
        await sendBirthdayEmail(resend, participant, dryRun);
        result.sent++;

        // Update last_birthday_sent_year if column exists and not dry run
        if (!dryRun && 'last_birthday_sent_year' in participant) {
          const { error: updateError } = await supabase
            .from('participants_bday_duplicate')
            .update({ last_birthday_sent_year: year })
            .eq('id', participant.id);

          if (updateError) {
            console.error(`Failed to update last_birthday_sent_year for ${participant.id}:`, updateError);
          }
        }

        console.log(`${dryRun ? 'Would send' : 'Sent'} birthday email to ${participant.name} (${participant.email})`);

      } catch (error) {
        console.error(`Failed to ${dryRun ? 'simulate' : 'send'} email to ${participant.email}:`, error);
        result.errors.push({
          id: participant.id,
          email: participant.email,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Birthday ${dryRun ? 'dry run' : 'manual run'} complete:`, result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in birthday-test function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        dateLocal: new Date().toISOString().slice(0, 10),
        mmdd: '',
        sent: 0,
        skippedNoEmail: 0,
        skippedAlreadyThisYear: 0,
        totalCandidates: 0,
        errors: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);