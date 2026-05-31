
-- Doc 4.2 §13 — IH email log for admin-visible delivery + retry
CREATE TABLE public.ih_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  to_addresses text[] NOT NULL,
  cc_addresses text[] NOT NULL DEFAULT '{}',
  subject text NOT NULL,
  related_table text,
  related_id uuid,
  idempotency_key text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  provider_message_id text,
  error_message text,
  attempt_count int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  CONSTRAINT ih_email_log_status_chk CHECK (status IN ('pending','sent','failed','retrying'))
);

GRANT SELECT ON public.ih_email_log TO authenticated;
GRANT ALL ON public.ih_email_log TO service_role;

ALTER TABLE public.ih_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email log"
ON public.ih_email_log FOR SELECT
TO authenticated
USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE INDEX ih_email_log_status_created_idx
  ON public.ih_email_log (status, created_at DESC);

CREATE INDEX ih_email_log_event_created_idx
  ON public.ih_email_log (event_type, created_at DESC);

CREATE TRIGGER ih_email_log_updated_at
  BEFORE UPDATE ON public.ih_email_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
