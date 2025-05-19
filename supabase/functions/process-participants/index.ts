
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import * as sendgrid from "https://esm.sh/@sendgrid/mail@7.7.0";

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

    // Configure SendGrid - fixed by using the correct method from the namespace import
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "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";
    sendgrid.mail.setApiKey(SENDGRID_API_KEY);

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
              email_sent: false // We'll update this after sending the email
            });

          if (insertError) {
            throw new Error(`Error inserting participant: ${insertError.message}`);
          }

          // Send email using SendGrid
          try {
            const msg = {
              to: participant.email,
              from: 'notifications@ntw-training.org', // Replace with your verified sender
              subject: `Welcome to ${program} Training Program`,
              text: `Hello ${participant.name},\n\nYou have been registered for the ${program} training program. We look forward to seeing you!\n\nBest regards,\nNational Training Week Team`,
              html: `<div>
                <h2>Welcome to ${program} Training Program</h2>
                <p>Hello ${participant.name},</p>
                <p>You have been successfully registered for the <strong>${program}</strong> training program.</p>
                <p>We look forward to seeing you!</p>
                <p>Best regards,<br>National Training Week Team</p>
              </div>`,
            };
            
            await sendgrid.mail.send(msg);
            console.log(`Email sent to: ${participant.email}`);
            
            // Update participant record to mark email as sent
            await supabaseClient
              .from('participants')
              .update({ email_sent: true })
              .eq('email', participant.email)
              .eq('program_id', programId);

            return {
              email: participant.email,
              status: 'success',
              message: 'Participant registered and email sent',
            };
          } catch (emailError) {
            console.error(`Error sending email to ${participant.email}:`, emailError);
            return {
              email: participant.email,
              status: 'partial_success',
              message: 'Participant registered but email failed to send',
            };
          }
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
