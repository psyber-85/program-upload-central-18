-- Enable the cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule birthday email sender to run daily at 01:00 UTC (09:00 Malaysia Time)
SELECT cron.schedule(
  'birthday-email-sender',
  '0 1 * * *',  -- Daily at 01:00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/birthday-sender',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bnBqa3RodGphcWFtcnJpb2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQwNjQsImV4cCI6MjA2MzE5MDA2NH0.ukmvfRYx55Yiw6-8hqLps0jAcaDs7p6Eg5xOtpJoQNs"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);