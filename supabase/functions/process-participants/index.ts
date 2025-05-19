
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const payload: RequestPayload = await req.json();
    const { program, data } = payload;

    console.log(`Processing ${data.length} participants for program: ${program}`);

    const { data: existingProgram, error: programError } = await supabaseClient
      .from('programs')
      .select('id')
      .eq('title', program)
      .single();

    if (programError) {
      throw new Error(`Error fetching program: ${programError.message}`);
    }

    const programId = existingProgram.id;

    const SENDGRID_API_KEY = "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";

    const results = await Promise.all(
      data.map(async (participant) => {
        try {
          const { error: insertError } = await supabaseClient
            .from('participants')
            .insert({
              program_id: programId,
              program_name: program, // Store the program name
              name: participant.name,
              email: participant.email,
              nric_number: participant.nric_number,
              phone: participant.phone,
              key_skills: participant.keyskilllist,
              email_sent: false,
            });

          if (insertError) {
            throw new Error(`Error inserting participant: ${insertError.message}`);
          }

          // Email button styling
          const buttonStyle = `
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
          `;

          // Send email via raw SendGrid API
          const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [
                {
                  to: [{ email: participant.email }],
                  subject: `[NTW] Your ${program} Registration is Confirmed`,
                },
              ],
              from: {
                email: "info@theaihq.net",
                name: "AIHQ - theaihq.net",
              },
              content: [
                {
                  type: "text/html",
                  value: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                             <p>Hello ${participant.name},</p>
                    <p>You have been successfully registered for the <strong>${program}</strong> training program.</p>
                    <p>To access your program materials, please visit the link and select the correct NTW programme. You will get an automated link to the programm access:</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://theaihq.net/shop-new/" style="${buttonStyle}">Access Program Link</a>
                    </div>
                    <p>After completing the program, your certificate will be issued from the NTW site.</p>
                    <p>Best regards,<br>AIHQ - National Training Week Team</p>
                    
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    
                    <h2>[NTW] Pendaftaran ${program} Anda Disahkan</h2>
                    <p>Salam ${participant.name},</p>
                    <p>Anda telah berjaya didaftarkan untuk program latihan <strong>${program}</strong>.</p>
                    <p>Untuk mengakses bahan program anda, sila layari:</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://theaihq.net/shop-new/" style="${buttonStyle}">Akses Program</a>
                    </div>
                    <p>Selepas menyelesaikan program, sijil anda akan dikeluarkan dari laman NTW.</p>
                    <p>Salam hormat,<br>AIHQ - Pasukan Minggu Latihan Nasional</p>
                  </div>`,
                },
              ],
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            throw new Error(`SendGrid error ${emailResponse.status}: ${errorText}`);
          }

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
      })
    );

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
