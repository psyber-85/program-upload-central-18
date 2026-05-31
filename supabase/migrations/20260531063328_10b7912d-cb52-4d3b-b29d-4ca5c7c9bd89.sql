
-- Patch 002: statutory splits & payslip format
ALTER TABLE public.ih_staff_profiles
  ADD COLUMN IF NOT EXISTS eis_rate numeric DEFAULT 0.2,
  ADD COLUMN IF NOT EXISTS employer_epf_rate numeric,
  ADD COLUMN IF NOT EXISTS employer_socso_rate numeric,
  ADD COLUMN IF NOT EXISTS employer_eis_rate numeric;

ALTER TABLE public.ih_payroll_items
  ADD COLUMN IF NOT EXISTS eis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_eis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_addition_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_employee_deductions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_employer_contribution numeric DEFAULT 0;

ALTER TABLE public.ih_payslips
  ADD COLUMN IF NOT EXISTS eis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_eis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_addition_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_employee_deductions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_employer_contribution numeric DEFAULT 0;

ALTER TABLE public.ih_finance_snapshots
  ADD COLUMN IF NOT EXISTS employee_statutory_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_statutory_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS epf_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS socso_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eis_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_total numeric NOT NULL DEFAULT 0;

-- Refresh non-admin self-update block to include new sensitive rate columns
CREATE OR REPLACE FUNCTION public.ih_block_sensitive_self_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_ih_role(auth.uid(), 'admin'::ih_app_role) THEN
    IF NEW.salary_base IS DISTINCT FROM OLD.salary_base
       OR NEW.epf_rate IS DISTINCT FROM OLD.epf_rate
       OR NEW.socso_rate IS DISTINCT FROM OLD.socso_rate
       OR NEW.eis_rate IS DISTINCT FROM OLD.eis_rate
       OR NEW.employer_epf_rate IS DISTINCT FROM OLD.employer_epf_rate
       OR NEW.employer_socso_rate IS DISTINCT FROM OLD.employer_socso_rate
       OR NEW.employer_eis_rate IS DISTINCT FROM OLD.employer_eis_rate
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.business_arm IS DISTINCT FROM OLD.business_arm
       OR NEW.join_date IS DISTINCT FROM OLD.join_date
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.deactivated_at IS DISTINCT FROM OLD.deactivated_at
       OR NEW.notion_unlocked_at IS DISTINCT FROM OLD.notion_unlocked_at THEN
      RAISE EXCEPTION 'Only admins can modify compensation, role, status, or identity fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
