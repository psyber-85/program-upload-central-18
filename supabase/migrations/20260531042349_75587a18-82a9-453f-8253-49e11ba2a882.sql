
-- Doc 4.3: Audit log + extended hard-delete protection

-- 1. Audit log table
CREATE TABLE public.ih_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  actor_role text,
  target_table text,
  target_id uuid,
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ih_audit_log_created_at ON public.ih_audit_log(created_at DESC);
CREATE INDEX idx_ih_audit_log_action ON public.ih_audit_log(action);
CREATE INDEX idx_ih_audit_log_target ON public.ih_audit_log(target_table, target_id);

GRANT SELECT ON public.ih_audit_log TO authenticated;
GRANT ALL ON public.ih_audit_log TO service_role;

ALTER TABLE public.ih_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only read; no client INSERT/UPDATE/DELETE policies (use RPC or service role)
CREATE POLICY "ih_audit_log admin read" ON public.ih_audit_log
  FOR SELECT TO authenticated
  USING (has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- 2. SECURITY DEFINER RPC for client-side audit inserts
CREATE OR REPLACE FUNCTION public.ih_log_audit(
  _action text,
  _target_table text,
  _target_id uuid,
  _summary text,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_id uuid;
  _role text;
BEGIN
  -- Only active staff or admins may write audit
  IF NOT (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role)) THEN
    RAISE EXCEPTION 'Not authorized to write audit log';
  END IF;

  SELECT CASE WHEN has_ih_role(auth.uid(), 'admin'::ih_app_role) THEN 'admin' ELSE 'staff' END
    INTO _role;

  INSERT INTO public.ih_audit_log (action, actor_id, actor_role, target_table, target_id, summary, metadata)
  VALUES (_action, auth.uid(), _role, _target_table, _target_id, _summary, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO _audit_id;

  RETURN _audit_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ih_log_audit(text, text, uuid, text, jsonb) TO authenticated;

-- 3. Block UPDATE on audit log (immutability) via trigger
CREATE OR REPLACE FUNCTION public.ih_block_audit_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries are immutable';
END;
$$;

DROP TRIGGER IF EXISTS trg_ih_audit_log_block_update ON public.ih_audit_log;
CREATE TRIGGER trg_ih_audit_log_block_update
  BEFORE UPDATE ON public.ih_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.ih_block_audit_update();

-- 4. Extend hard-delete protection to remaining sensitive tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ih_audit_log',
    'ih_staff_profiles',
    'ih_payroll_runs',
    'ih_payroll_items',
    'ih_payslips',
    'ih_finance_snapshots',
    'ih_request_attachments',
    'ih_leave_balances',
    'ih_access_checklist',
    'ih_payslip_downloads',
    'ih_notice_acks',
    'ih_notice_reads',
    'ih_email_log',
    'ih_calendar_sync_log',
    'ih_welcome_emails',
    'ih_tool_access'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_block_delete ON public.%s', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_block_delete BEFORE DELETE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete()',
      t, t
    );
  END LOOP;
END$$;
