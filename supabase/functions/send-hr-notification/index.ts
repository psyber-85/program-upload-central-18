
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

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
  product_type?: string;
  program_id?: string;
  participant_email?: string;
}

const generateEmailTemplate = async (hrName: string, staffName: string, courseName: string, productType: string, pricing: number) => {
  console.log('Generating email template for program:', productType);
  
  // Program-specific links mapping using exact program titles
  const programLinks = {
    "Business Writing with AI: 2-Day Masterclass": {
      signupForm: "https://drive.google.com/file/d/1i8os64_0YWr0nlJns88-i3IT1hNaepaN/view?usp=drive_link",
      courseBrochure: "https://drive.google.com/file/d/1f0-Nyg0zXxJ2-4c4OBzAduQr7Lk9QWmU/view?usp=drive_link"
    },
    "ChatGPT Skill Boost (Intermediate)": {
      signupForm: "https://drive.google.com/file/d/14xHGHHjbpXKo37D0Rp12mPKxJGxfJWP3/view?usp=drive_link",
      courseBrochure: "https://drive.google.com/file/d/16L7LfiuwFIIlJoY8HsMYql9pMSn372LX/view?usp=drive_link"
    },
    "AI and ChatGPT for HR Professionals - 2 Day Masterclass": {
      signupForm: "https://drive.google.com/file/d/1IG9gOVe65C__6KTjJCd_RZqj_nAFlob_/view?usp=drive_link",
      courseBrochure: "https://drive.google.com/file/d/1GWc2tUZfsUR8FSZxuGuBR8T34iVv9fFy/view"
    },
    "The AI-Ready Leader: Win the Future with Strategic Action": {
      signupForm: "https://drive.google.com/file/d/1KEE95XsMiSMgV8YseUX2db7eV0qtI5AY/view?usp=drive_link",
      courseBrochure: "https://drive.google.com/file/d/1silb4DtDCHv04r_eriODS6nn-QWZmkrs/view"
    }
  };

  // Try exact match first
  let links = programLinks[productType as keyof typeof programLinks];
  
  if (!links) {
    // Try to find partial matches for flexibility
    const programKeys = Object.keys(programLinks);
    const matchedKey = programKeys.find(key => 
      key.toLowerCase().includes(productType.toLowerCase()) || 
      productType.toLowerCase().includes(key.toLowerCase().replace(/[^\w\s]/g, '').trim())
    );
    
    if (matchedKey) {
      links = programLinks[matchedKey as keyof typeof programLinks];
      console.log(`Found partial match: ${matchedKey} for ${productType}`);
    }
  }
  
  if (!links) {
    console.error('No links found for product type:', productType);
    console.log('Available program keys:', Object.keys(programLinks));
    // Fallback to default links with error indication
    links = {
      signupForm: "https://drive.google.com/[SIGN_UP_FORM_NOT_FOUND]",
      courseBrochure: "https://drive.google.com/[COURSE_BROCHURE_NOT_FOUND]"
    };
  } else {
    console.log('Found links for program:', productType, links);
  }

  // Format pricing
  const formattedPricing = `RM${pricing.toLocaleString()}`;

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear ${hrName},</p>
      
      <p>I hope this message finds you well.</p>
      
      <p>I am writing to facilitate the registration of <strong>${staffName}</strong> from your organization for the upcoming training program, <strong>${courseName}</strong>, conducted by AIHQ.</p>
      
      <p>Attached are the following documents for your review:</p>
      
      <ul>
        <li><a href="${links.courseBrochure}" style="color: #2754C5; text-decoration: none;">Course Brochure</a></li>
        <li><a href="${links.signupForm}" style="color: #2754C5; text-decoration: none;">Sign-Up Form</a></li>
      </ul>
      
      <p>The fee for this 2-day program is <strong>${formattedPricing}</strong>, as stated in the sign-up form. However, this course is <strong>100% HRDC Claimable</strong>. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.</p>
      
      <p>For more information on AIHQ's expertise and track record, feel free to explore:</p>
      
      <ul>
        <li><a href="https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms//AIHQ_Profile.pdf" style="color: #2754C5; text-decoration: none;">AIHQ's Profile & Portfolio</a></li>
        <li><a href="http://theaihq.net" style="color: #2754C5; text-decoration: none;">Our Website</a></li>
        <li><a href="https://www.google.com/search?sca_esv=0e58669465c64ea2&sxsrf=AE3TifO01M1ZnuMUGy1ZOYy7cKB3BSmg_Q:1750924007883&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E8ss9ZAsrmkP2SnQ13k5Q1slVi9Okp1e3MtSGzQ-A-qiOCtAkpQyLE2q_z62UrP3t8xZxayiwjuBCszv6GjHWAAj1U9IqF7fgfSx9Q-7DIJQXGoJXg%3D%3D&q=AIHQ+Training+and+Consultancy+Reviews&sa=X&ved=2ahUKEwiLtZKczI6OAxWIS2wGHYSsHcMQ0bkNegQINRAE&biw=1536&bih=730&dpr=1.25" style="color: #2754C5; text-decoration: none;">Our 4.8-Star Google Reviews</a></li>
      </ul>
      
      <p>Should you have any questions or need further assistance, please feel free to contact me directly.</p>
      
      <p>Thank you for your attention and support. We look forward to welcoming <strong>${staffName}</strong> to the program.</p>
      
      <p>Best regards,<br>
      <strong>AIHQ Training and Consultancy</strong></p>
      
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
    </div>
  `;

  const plainTextTemplate = `Dear ${hrName},

I hope this message finds you well.

I am writing to facilitate the registration of ${staffName} from your organization for the upcoming training program, ${courseName}, conducted by AIHQ.

Attached are the following documents for your review:

- Course Brochure: ${links.courseBrochure}
- Sign-Up Form: ${links.signupForm}

The fee for this 2-day program is ${formattedPricing}, as stated in the sign-up form. However, this course is 100% HRDC Claimable. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.

For more information on AIHQ's expertise and track record, feel free to explore:

AIHQ's Profile & Portfolio: https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms//AIHQ_Profile.pdf

Our Website: http://theaihq.net

Our 4.8-Star Google Reviews: https://www.google.com/search?sca_esv=0e58669465c64ea2&sxsrf=AE3TifO01M1ZnuMUGy1ZOYy7cKB3BSmg_Q:1750924007883&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E8ss9ZAsrmkP2SnQ13k5Q1slVi9Okp1e3MtSGzQ-A-qiOCtAkpQyLE2q_z62UrP3t8xZxayiwjuBCszv6GjHWAAj1U9IqF7fgfSx9Q-7DIJQXGoJXg%3D%3D&q=AIHQ+Training+and+Consultancy+Reviews&sa=X&ved=2ahUKEwiLtZKczI6OAxWIS2wGHYSsHcMQ0bkNegQINRAE&biw=1536&bih=730&dpr=1.25

Should you have any questions or need further assistance, please feel free to contact me directly.

Thank you for your attention and support. We look forward to welcoming ${staffName} to the program.

Best regards,
AIHQ Training and Consultancy

_______`;

  return { htmlTemplate, plainTextTemplate };
};

const handler = async (req: Request): Promise<Response> => {
  console.log('SendGrid function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    console.log('Request body:', body);
    
    const { to_email, to_name, prospect_name, program_title, program_id, participant_email } = body;

    if (!to_email || !prospect_name || !program_title) {
      console.error('Missing required fields:', { to_email, prospect_name, program_title });
      throw new Error("Missing required fields: to_email, prospect_name, or program_title");
    }

    // Get SendGrid API key from environment
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY not found in environment');
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch pricing from programs table
    let pricing = 2850; // Default pricing
    if (program_id) {
      console.log('Fetching pricing for program_id:', program_id);
      const { data: program, error: programError } = await supabaseClient
        .from('programs')
        .select('pricing')
        .eq('id', program_id)
        .single();

      if (programError) {
        console.error('Error fetching program pricing:', programError);
      } else if (program?.pricing && program.pricing > 0) {
        pricing = program.pricing;
        console.log('Using program pricing:', pricing);
      } else {
        console.log('Using default pricing (program pricing is null or 0):', pricing);
      }
    } else {
      console.log('No program_id provided, using default pricing:', pricing);
    }

    // Generate the email template based on the program
    const { htmlTemplate, plainTextTemplate } = await generateEmailTemplate(
      to_name || to_email,
      prospect_name,
      program_title,
      program_title,
      pricing
    );

    const emailSubject = `Training Registration for ${program_title}`;

    console.log('Sending email via SendGrid...');
    console.log('Email subject:', emailSubject);
    console.log('Program title:', program_title);
    console.log('Pricing used:', pricing);
    
    // Prepare recipients
    const recipients = [
      {
        email: to_email,
        name: to_name || to_email,
      }
    ];

    // Add participant email if provided
    if (participant_email) {
      recipients.push({
        email: participant_email,
        name: prospect_name,
      });
    }

    console.log('Recipients:', recipients);
    
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
            to: recipients,
            cc: [
              {
                email: "wani@theaihq.net",
                name: "Wani - AIHQ",
              },
            ],
            subject: emailSubject,
          },
        ],
        from: {
          email: "wani@theaihq.net",
          name: "AIHQ Training and Consultancy",
        },
        content: [
          {
            type: "text/plain",
            value: plainTextTemplate,
          },
          {
            type: "text/html",
            value: htmlTemplate,
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

    const responseText = await sendgridResponse.text();
    console.log('Email sent successfully, response:', responseText);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        recipients: recipients.map(r => r.email),
        cc: ["wani@theaihq.net"],
        subject: emailSubject,
        pricing_used: pricing
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
