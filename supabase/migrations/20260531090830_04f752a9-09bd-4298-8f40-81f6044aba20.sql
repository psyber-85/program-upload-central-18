-- Patch 1.4 — Request flow completion: activity events, training linkage, sub_state.

-- 1. ih_request_events: append-only timeline.
CREATE TABLE public.ih_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.ih_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid,
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ih_request_events TO authenticated;
GRANT ALL ON public.ih_request_events TO service_role;

ALTER TABLE public.ih_request_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ih_request_events_read"
ON public.ih_request_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ih_requests r
    WHERE r.id = request_id
      AND (r.staff_id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  )
);

CREATE POLICY "ih_request_events_insert"
ON public.ih_request_events FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ih_requests r
    WHERE r.id = request_id
      AND (r.staff_id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  )
);

CREATE TRIGGER ih_request_events_no_delete
BEFORE DELETE ON public.ih_request_events
FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();

CREATE INDEX ih_request_events_request_id_idx
  ON public.ih_request_events(request_id, created_at);

-- 2. Add training linkage + sub_state to ih_requests (additive, nullable).
ALTER TABLE public.ih_requests
  ADD COLUMN IF NOT EXISTS training_application_id uuid REFERENCES public.ih_requests(id),
  ADD COLUMN IF NOT EXISTS sub_state text;

-- 3. Extend self-update policy so staff can also edit + resubmit a NeedsCorrection request
--    (current policy only permits status='Submitted'). Keep transition guardrails.
DROP POLICY IF EXISTS "ih_requests self update pending" ON public.ih_requests;

CREATE POLICY "ih_requests self update pending or correction"
ON public.ih_requests FOR UPDATE TO authenticated
USING (
  staff_id = auth.uid()
  AND status = ANY (ARRAY['Submitted'::ih_request_status, 'NeedsCorrection'::ih_request_status])
)
WITH CHECK (
  staff_id = auth.uid()
  AND status = ANY (ARRAY['Submitted'::ih_request_status, 'Cancelled'::ih_request_status])
);
