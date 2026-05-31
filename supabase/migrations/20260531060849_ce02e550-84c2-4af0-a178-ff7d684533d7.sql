SELECT cron.unschedule('birthday-automation-daily');
SELECT cron.schedule(
  'birthday-automation-daily',
  '22 23 * * *',
  $$
  SELECT net.http_post(
    url:='https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/birthday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "11111111"}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.unschedule('birthday-email-sender');
SELECT cron.schedule(
  'birthday-email-sender',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url:='https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/birthday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "11111111"}'::jsonb
  ) as request_id;
  $$
);