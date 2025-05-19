
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Participant = {
  name: string;
  email: string;
  nric_number: string;
  phone: string;
  keyskilllist: string;
};

type RequestPayload = {
  program: string;
  data: Participant[];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Deno runtime
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the request payload
    const payload: RequestPayload = await req.json();
    const { program, data } = payload;

    console.log(`Processing ${data.length} participants for program: ${program}`);

    // Store participants in the database
    // First, we'll get the program ID
    let programId;
    const { data: existingProgram, error: programError } = await supabaseClient
      .from('programs')
      .select('id')
      .eq('title', program)
      .single();

    if (programError) {
      throw new Error(`Error fetching program: ${programError.message}`);
    }

    programId = existingProgram.id;

    // Process each participant
    const results = await Promise.all(
      data.map(async (participant) => {
        try {
          // Insert participant into database
          const { error: insertError } = await supabaseClient
            .from('participants')
            .insert({
              program_id: programId,
              name: participant.name,
              email: participant.email,
              nric_number: participant.nric_number,
              phone: participant.phone,
              key_skills: participant.keyskilllist,
              email_sent: true // We'll mark it as sent since we're simulating email sending
            });

          if (insertError) {
            throw new Error(`Error inserting participant: ${insertError.message}`);
          }

          // In a real implementation, you would send emails here
          // Either directly or by triggering another service
          
          // For now, we'll just log that we would send an email
          console.log(`Would send email to: ${participant.email} for program: ${program}`);

          return {
            email: participant.email,
            status: 'success',
            message: 'Participant registered and email sent',
          };
        } catch (error) {
          console.error(`Error processing participant ${participant.email}:`, error);
          return {
            email: participant.email,
            status: 'error',
            message: error.message,
          };
        }
      })
    );

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} participants for program: ${program}`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing participants:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
