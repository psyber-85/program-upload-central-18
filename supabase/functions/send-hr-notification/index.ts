
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { requireAdmin, escapeHtml, jsonError } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to_email: string;
  to_name: string;
  participant_email: string;
  subject: string;
  message: string;
  prospect_name?: string;
  program_title?: string;
  product_type?: string;
}

const generateEmailTemplate = async (hrName: string, staffName: string, courseName: string, productType: string) => {
  console.log('Generating email template for program:', productType);
  
  // Initialize Supabase client to fetch pricing and links
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Fetch pricing from registration_programs table
  let pricing = 2850; // Default value
  try {
    const { data: programData, error } = await supabase
      .from('registration_programs')
      .select('pricing')
      .eq('title', productType)
      .single();
    
    if (!error && programData?.pricing) {
      pricing = programData.pricing;
      console.log(`Found pricing for ${productType}:`, pricing);
    } else {
      console.log(`No pricing found for ${productType}, using default:`, pricing);
    }
  } catch (error) {
    console.error('Error fetching pricing:', error);
    console.log('Using default pricing:', pricing);
  }
  
  // Fetch program links from database
  const programLinksMap: Record<string, { signupForm: string; courseBrochure: string }> = {};
  try {
    const { data: linksData, error: linksError } = await supabase
      .from('program_links')
      .select('program_title, signup_form_url, brochure_url');
    
    if (!linksError && linksData) {
      linksData.forEach(item => {
        programLinksMap[item.program_title] = {
          signupForm: item.signup_form_url,
          courseBrochure: item.brochure_url
        };
      });
      console.log('Loaded program links from database:', Object.keys(programLinksMap));
    }
  } catch (error) {
    console.error('Error fetching program links:', error);
  }

  // Try exact match first
  let links = programLinksMap[productType];
  
  if (!links) {
    // Try to find partial matches for flexibility
    const programKeys = Object.keys(programLinksMap);
    const matchedKey = programKeys.find(key => 
      key.toLowerCase().includes(productType.toLowerCase()) || 
      productType.toLowerCase().includes(key.toLowerCase().replace(/[^\w\s]/g, '').trim())
    );
    
    if (matchedKey) {
      links = programLinksMap[matchedKey];
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

  const safeHrName = escapeHtml(hrName);
  const safeStaffName = escapeHtml(staffName);
  const safeCourseName = escapeHtml(courseName);

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear ${safeHrName},</p>
      
      <p>I hope this message finds you well.</p>
      
      <p>I am writing to facilitate the registration of <strong>${safeStaffName}</strong> from your organization for the upcoming training program, <strong>${safeCourseName}</strong>, conducted by AIHQ.</p>
      
      <p>Attached are the following documents for your review:</p>
      
      <ul>
        <li><a href="${links.courseBrochure}" style="color: #2754C5; text-decoration: none;">Course Brochure</a></li>
        <li><a href="${links.signupForm}" style="color: #2754C5; text-decoration: none;">Sign-Up Form</a></li>
      </ul>
      
      <p>The fee for this 2-day program is <strong>RM${pricing}</strong>, as stated in the sign-up form. However, this course is <strong>100% HRDC Claimable</strong>. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.</p>
      
      <p>For more information on AIHQ's expertise and track record, feel free to explore:</p>
      
      <ul>
        <li>📌 <a href="http://storage.theaihq.net/AIHQ_Profile.pdf" style="color: #2754C5; text-decoration: none;">AIHQ's Profile & Portfolio</a></li>
        <li>🌍 <a href="http://theaihq.net" style="color: #2754C5; text-decoration: none;">Our Website</a></li>
        <li>⭐ <a href="https://www.google.com/maps?q=AIHQ+Training+and+Consultancy" style="color: #2754C5; text-decoration: none;">Our 4.9-Star Google Reviews</a></li>
      </ul>
      
      <p>Should you have any questions or need further assistance, please feel free to contact me directly.</p>
      
      <p>Thank you for your attention and support. We look forward to welcoming <strong>${safeStaffName}</strong> to the program.</p>
      
      <p>Warm regards,<br>
      Zarnaaz<br>
      Training Support Specialist<br>
      AIHQ Training & Consultancy<br>
      Phone: 011-6184-8751</p>
      
      
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
    </div>
  `;

  const plainTextTemplate = `Dear ${hrName},

I hope this message finds you well.

I am writing to facilitate the registration of ${staffName} from your organization for the upcoming training program, ${courseName}, conducted by AIHQ.

Attached are the following documents for your review:

- Course Brochure: ${links.courseBrochure}
- Sign-Up Form: ${links.signupForm}

The fee for this 2-day program is RM${pricing}, as stated in the sign-up form. However, this course is 100% HRDC Claimable. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.

For more information on AIHQ's expertise and track record, feel free to explore:

    📌 AIHQ's Profile & Portfolio (http://storage.theaihq.net/AIHQ_Profile.pdf)
    🌍 Our Website - http://theaihq.net
    ⭐ Our 4.9-Star Google Reviews - https://www.google.com/maps?q=AIHQ+Training+and+Consultancy

Should you have any questions or need further assistance, please feel free to contact me directly.

Thank you for your attention and support. We look forward to welcoming ${staffName} to the program.

Warm regards,
Zarnaaz
Training Support Specialist
AIHQ Training & Consultancy
Phone: 011-6184-8751

_______`;

  return { htmlTemplate, plainTextTemplate };
};

const handler = async (req: Request): Promise<Response> => {
  console.log('SendGrid function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return jsonError(auth.status, auth.error);

  try {
    const body: EmailRequest = await req.json();
    console.log('Request body:', body);
    
    const { to_email, to_name, participant_email, prospect_name, program_title, product_type } = body;

    if (!to_email || !participant_email || !prospect_name || !program_title) {
      console.error('Missing required fields:', { to_email, participant_email, prospect_name, program_title });
      throw new Error("Missing required fields: to_email, participant_email, prospect_name, or program_title");
    }

    // Get SendGrid API key from environment
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY not found in environment');
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }

    // Generate the email template based on the program (with dynamic pricing)
    const { htmlTemplate, plainTextTemplate } = await generateEmailTemplate(
      to_name || to_email,
      prospect_name,
      program_title,
      program_title // Use program_title for matching instead of product_type
    );

    const emailSubject = `Training Registration for ${program_title}`;

    console.log('Sending email via SendGrid...');
    console.log('Email subject:', emailSubject);
    console.log('Program title:', program_title);
    console.log('Recipients - HR:', to_email, 'Participant:', participant_email, 'CC: zarnaaz@theaihq.net');
    
    // Normalise addresses (case + whitespace insensitive)
    const CC_EMAIL = "zarnaaz@theaihq.net";
    const norm = (s: string) => (s || "").trim().toLowerCase();
    const hrNorm = norm(to_email);
    const participantNorm = norm(participant_email);
    const ccNorm = norm(CC_EMAIL);
    const localPart = (e: string) => (e.includes("@") ? e.split("@")[0] : e);
    const safeName = (n: string | undefined, e: string) => (n && n.trim()) || localPart(e);

    const isSelfHR = participantNorm === hrNorm;

    // Build TO list — HR always; participant only if distinct from HR and CC
    const toRecipients: { email: string; name: string }[] = [
      { email: to_email, name: safeName(to_name, to_email) },
    ];
    if (!isSelfHR && participantNorm !== ccNorm) {
      toRecipients.push({
        email: participant_email,
        name: safeName(prospect_name, participant_email),
      });
    }

    // Build CC — omit if it would duplicate any TO
    const toSet = new Set(toRecipients.map((r) => norm(r.email)));
    const ccRecipients: { email: string; name: string }[] = toSet.has(ccNorm)
      ? []
      : [{ email: CC_EMAIL, name: "AIHQ Training and Consultancy" }];

    // If self-HR, prepend a one-line note to both bodies
    let finalHtml = htmlTemplate;
    let finalText = plainTextTemplate;
    if (isSelfHR) {
      const noteHtml = `<p style="margin:0 0 12px;padding:10px 12px;background:#f1f5f9;border-left:3px solid #2754C5;font-family:Arial,sans-serif;color:#334155"><em>Note: This message is sent to you as both the HR contact and the program participant.</em></p>`;
      const noteText = `Note: This message is sent to you as both the HR contact and the program participant.\n\n`;
      finalHtml = noteHtml + htmlTemplate;
      finalText = noteText + plainTextTemplate;
    }

    const personalization: Record<string, unknown> = {
      to: toRecipients,
      subject: emailSubject,
    };
    if (ccRecipients.length > 0) personalization.cc = ccRecipients;

    const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [personalization],
        from: {
          email: "zarnaaz@theaihq.net",
          name: "AIHQ Training and Consultancy",
        },
        content: [
          { type: "text/plain", value: finalText },
          { type: "text/html", value: finalHtml },
        ],
      }),
    });

    console.log('SendGrid response status:', sendgridResponse.status);

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
      console.error('SendGrid error response:', errorText);
      // Return 200 with structured failure so the client can surface a meaningful toast
      return new Response(
        JSON.stringify({
          success: false,
          error: `SendGrid rejected the request`,
          sendgridStatus: sendgridResponse.status,
          sendgridBody: errorText.slice(0, 1000),
          recipients: { to: toRecipients, cc: ccRecipients, selfHR: isSelfHR },
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const responseText = await sendgridResponse.text();
    console.log('Email sent successfully, response:', responseText);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        recipients: {
          hr: to_email,
          participant: participant_email,
          cc: "zarnaaz@theaihq.net"
        },
        subject: emailSubject
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
