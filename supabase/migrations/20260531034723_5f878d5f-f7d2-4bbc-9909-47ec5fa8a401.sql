
-- Part A: payslip PDF tracking columns
ALTER TABLE public.ih_payslips
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS pdf_error text;

-- Part B: calendar sync columns on ih_requests
ALTER TABLE public.ih_requests
  ADD COLUMN IF NOT EXISTS gcal_event_id text,
  ADD COLUMN IF NOT EXISTS gcal_sync_error text,
  ADD COLUMN IF NOT EXISTS half_day_slot text
    CHECK (half_day_slot IS NULL OR half_day_slot IN ('morning','afternoon'));

-- Part B: admin-managed calendar config (single row enforced via PK=1)
CREATE TABLE IF NOT EXISTS public.ih_calendar_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  calendar_id text,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ih_calendar_config TO authenticated;
GRANT ALL ON public.ih_calendar_config TO service_role;
ALTER TABLE public.ih_calendar_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_calendar_config admin read"
  ON public.ih_calendar_config FOR SELECT
  TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));
CREATE POLICY "ih_calendar_config admin write"
  ON public.ih_calendar_config FOR ALL
  TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));
INSERT INTO public.ih_calendar_config (id, enabled) VALUES (1, false)
  ON CONFLICT (id) DO NOTHING;

-- Part B: calendar sync log (admin-visible failure tracking)
CREATE TABLE IF NOT EXISTS public.ih_calendar_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.ih_requests(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('upsert','cancel')),
  status text NOT NULL CHECK (status IN ('success','failed','skipped')),
  gcal_event_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ih_calendar_sync_log TO authenticated;
GRANT ALL ON public.ih_calendar_sync_log TO service_role;
ALTER TABLE public.ih_calendar_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_calendar_sync_log admin read"
  ON public.ih_calendar_sync_log FOR SELECT
  TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));
CREATE INDEX IF NOT EXISTS idx_ih_calendar_sync_log_status_created
  ON public.ih_calendar_sync_log (status, created_at DESC);
