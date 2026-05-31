ALTER TABLE public.ih_payroll_runs
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.ih_payroll_items
  ADD COLUMN IF NOT EXISTS row_status text NOT NULL DEFAULT 'Complete',
  ADD COLUMN IF NOT EXISTS missing_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS adjustment jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS included_claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS included_training_claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.ih_payslips
  ADD COLUMN IF NOT EXISTS staff_name text,
  ADD COLUMN IF NOT EXISTS adjustment jsonb,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'Available',
  ADD COLUMN IF NOT EXISTS correction_ref text;

CREATE TABLE IF NOT EXISTS public.ih_payroll_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ih_payroll_reminders TO authenticated;
GRANT ALL ON public.ih_payroll_reminders TO service_role;
ALTER TABLE public.ih_payroll_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_payroll_reminders admin only" ON public.ih_payroll_reminders
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));