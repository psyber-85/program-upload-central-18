-- Fix the cron job timing to 7:22 AM Malaysia time (23:22 UTC)
SELECT cron.unschedule('birthday-automation-daily');

SELECT cron.schedule(
  'birthday-automation-daily',
  '22 23 * * *', -- 7:22 AM Malaysia time (UTC+8)
  $$
  SELECT net.http_post(
    url := 'https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/birthday',
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);