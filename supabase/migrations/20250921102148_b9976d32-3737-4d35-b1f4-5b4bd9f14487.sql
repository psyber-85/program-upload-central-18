-- Fix the cron job to call the correct birthday function
SELECT cron.alter_job(
    1, -- job id
    command => $$
      SELECT
        net.http_post(
          url := 'https://nxnpjkthtjaqamrriogp.supabase.co/functions/v1/birthday',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bnBqa3RodGphcWFtcnJpb2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQwNjQsImV4cCI6MjA2MzE5MDA2NH0.ukmvfRYx55Yiw6-8hqLps0jAcaDs7p6Eg5xOtpJoQNs"}'::jsonb,
          body := '{}'::jsonb
        ) as request_id;
    $$
);