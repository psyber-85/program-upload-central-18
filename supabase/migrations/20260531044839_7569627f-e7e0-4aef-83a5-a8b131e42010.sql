-- Patch 001 §13 — carry-forward AL expiry tracking
ALTER TABLE public.ih_leave_balances
  ADD COLUMN IF NOT EXISTS al_carry_forward integer NOT NULL DEFAULT 0;
ALTER TABLE public.ih_leave_balances
  ADD COLUMN IF NOT EXISTS al_carry_forward_expires_on date;

-- Patch 001 §21 — system audit RPC for scheduled jobs (service-role only)
CREATE OR REPLACE FUNCTION public.ih_log_system_audit(
  _action text,
  _target_table text,
  _target_id uuid,
  _summary text,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'ih_log_system_audit may only be called by service_role';
  END IF;
  INSERT INTO public.ih_audit_log (action, actor_id, actor_role, target_table, target_id, summary, metadata)
  VALUES (_action, NULL, 'system', _target_table, _target_id, _summary, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO _audit_id;
  RETURN _audit_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ih_log_system_audit(text, text, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ih_log_system_audit(text, text, uuid, text, jsonb) TO service_role;