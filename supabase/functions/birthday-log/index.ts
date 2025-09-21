import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatInTimeZone } from "https://esm.sh/date-fns-tz@3.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TIMEZONE = 'Asia/Kuala_Lumpur';
    const now = new Date();
    const mmdd = formatInTimeZone(now, TIMEZONE, 'MM-dd');
    const year = formatInTimeZone(now, TIMEZONE, 'yyyy');
    const thisMonth = parseInt(formatInTimeZone(now, TIMEZONE, 'M'));

    console.log(`Birthday log function called for ${mmdd} (month: ${thisMonth})`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's total birthdays
    const { count: todayTotal, error: todayError } = await supabase
      .from('participants_bday_duplicate')
      .select('*', { count: 'exact', head: true })
      .eq('birth_mmdd', mmdd);

    if (todayError) {
      console.error('Error getting today total:', todayError);
      throw todayError;
    }

    // Get today's sent count (those with last_birthday_sent_year = current year)
    const { count: todaySent, error: sentError } = await supabase
      .from('participants_bday_duplicate')
      .select('*', { count: 'exact', head: true })
      .eq('birth_mmdd', mmdd)
      .eq('last_birthday_sent_year', parseInt(year));

    if (sentError) {
      console.error('Error getting today sent:', sentError);
      throw sentError;
    }

    // Get this month's total birthdays
    const { count: monthTotal, error: monthError } = await supabase
      .from('participants_bday_duplicate')
      .select('*', { count: 'exact', head: true })
      .gte('birth_date', `${year}-${thisMonth.toString().padStart(2, '0')}-01`)
      .lt('birth_date', thisMonth === 12 ? `${parseInt(year) + 1}-01-01` : `${year}-${(thisMonth + 1).toString().padStart(2, '0')}-01`);

    if (monthError) {
      console.error('Error getting month total:', monthError);
      throw monthError;
    }

    // Get yearly breakdown by month (single grouped query)
    const { data: yearlyData, error: yearlyError } = await supabase
      .from('participants_bday_duplicate')
      .select('birth_date')
      .not('birth_date', 'is', null);

    if (yearlyError) {
      console.error('Error getting yearly data:', yearlyError);
      throw yearlyError;
    }

    // Process yearly data into monthly counts
    const yearByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0
    }));

    if (yearlyData) {
      yearlyData.forEach(row => {
        if (row.birth_date) {
          const birthMonth = new Date(row.birth_date).getMonth() + 1;
          if (birthMonth >= 1 && birthMonth <= 12) {
            yearByMonth[birthMonth - 1].total++;
          }
        }
      });
    }

    // Get a sample of today's birthdays for quick glance (first 5)
    const { data: todaySample, error: sampleError } = await supabase
      .from('participants_bday_duplicate')
      .select('name, email')
      .eq('birth_mmdd', mmdd)
      .limit(5);

    if (sampleError) {
      console.error('Error getting today sample:', sampleError);
      // Don't throw, just continue without sample
    }

    const stats = {
      today_total: todayTotal || 0,
      today_sent: todaySent || 0,
      today_pending: (todayTotal || 0) - (todaySent || 0),
      month_total: monthTotal || 0,
      yearByMonth,
      today_sample: todaySample ? todaySample.slice(0, 5) : []
    };

    console.log(`Birthday log stats:`, stats);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Birthday log function error:', error);
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