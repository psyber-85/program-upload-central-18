-- Enable pg_net extension to allow cron jobs to make HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;