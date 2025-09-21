import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
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

interface BirthdayStats {
  today: {
    count: number;
    people: { name: string; email: string }[];
  };
  monthSummary: {
    totalThisMonth: number;
    sentThisMonth: number;
  };
  yearByMonth: number[];
}

const getTodayParts = (timezone: string) => {
  const now = new Date();
  const dateLocalISO = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const mmdd = formatInTimeZone(now, timezone, 'MM-dd');
  const year = formatInTimeZone(now, timezone, 'yyyy');
  const monthNum = parseInt(formatInTimeZone(now, timezone, 'M'));
  
  return { dateLocalISO, mmdd, year, monthNum };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const timezone = Deno.env.get('TIMEZONE') || 'Asia/Kuala_Lumpur';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { mmdd, year, monthNum } = getTodayParts(timezone);

    // Get all participants with birth dates
    const { data: allParticipants, error } = await supabase
      .from('participants_bday_duplicate')
      .select('id, name, email, birth_date, last_birthday_sent_year, birth_mmdd');

    if (error) throw error;

    const participants = allParticipants || [];

    // Today's birthdays
    const todaysBirthdays = participants.filter((p: ParticipantRow) => {
      if (!p.birth_date) return false;
      
      if (p.birth_mmdd) {
        return p.birth_mmdd === mmdd;
      } else {
        const birthMmdd = new Date(p.birth_date).toISOString().slice(5, 10);
        return birthMmdd === mmdd;
      }
    });

    // This month's birthdays
    const thisMonthBirthdays = participants.filter((p: ParticipantRow) => {
      if (!p.birth_date) return false;
      const birthMonth = new Date(p.birth_date).getMonth() + 1;
      return birthMonth === monthNum;
    });

    // This month's sent emails (if tracking column exists)
    const sentThisMonth = thisMonthBirthdays.filter((p: ParticipantRow) => 
      p.last_birthday_sent_year === year
    ).length;

    // Year by month distribution
    const yearByMonth = Array(12).fill(0);
    participants.forEach((p: ParticipantRow) => {
      if (p.birth_date) {
        const birthMonth = new Date(p.birth_date).getMonth();
        yearByMonth[birthMonth]++;
      }
    });

    const stats: BirthdayStats = {
      today: {
        count: todaysBirthdays.length,
        people: todaysBirthdays.map((p: ParticipantRow) => ({
          name: p.name,
          email: p.email
        }))
      },
      monthSummary: {
        totalThisMonth: thisMonthBirthdays.length,
        sentThisMonth: sentThisMonth
      },
      yearByMonth
    };

    console.log(`Birthday stats computed for ${mmdd} in timezone ${timezone}:`, stats);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in birthday-log function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        today: { count: 0, people: [] },
        monthSummary: { totalThisMonth: 0, sentThisMonth: 0 },
        yearByMonth: Array(12).fill(0)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);