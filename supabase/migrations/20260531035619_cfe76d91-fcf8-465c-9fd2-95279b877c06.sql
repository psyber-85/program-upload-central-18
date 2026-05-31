
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove previous schedule if it exists, then create
DO $$
BEGIN
  PERFORM cron.unschedule('ih-scheduled-reminders-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ih-scheduled-reminders-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'ih-scheduled-reminders-daily',
  '0 1 * * *',
  $$ select net.http_post(
       url:='https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/ih-scheduled-reminders',
       headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bnBqa3RodGphcWFtcnJpb2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQwNjQsImV4cCI6MjA2MzE5MDA2NH0.ukmvfRYx55Yiw6-8hqLps0jAcaDs7p6Eg5xOtpJoQNs"}'::jsonb,
       body:=concat('{"time":"', now(), '"}')::jsonb
     );
  $$
);
