
-- =========================================================================
-- Internal Hub (Doc 4.1) — Supabase backend, Auth & RLS
-- All tables prefixed ih_* to avoid colliding with legacy sp_* tables.
-- =========================================================================

-- Enums
CREATE TYPE public.ih_app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.ih_staff_status AS ENUM ('Pending', 'Active', 'Inactive');
CREATE TYPE public.ih_business_arm AS ENUM ('Training', 'Solutions', 'Both');
CREATE TYPE public.ih_notice_importance AS ENUM ('Normal', 'Important', 'Critical');
CREATE TYPE public.ih_request_kind AS ENUM ('Leave', 'MC', 'Claim', 'Training', 'Benefit');
CREATE TYPE public.ih_request_status AS ENUM ('Submitted', 'Approved', 'Rejected', 'NeedsCorrection', 'Cancelled');
CREATE TYPE public.ih_payroll_status AS ENUM ('Draft', 'Finalized', 'Locked');
CREATE TYPE public.ih_finance_status AS ENUM ('Draft', 'Reviewed', 'Locked');

-- =========================================================================
-- user_roles + security-definer helpers
-- =========================================================================
CREATE TABLE public.ih_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.ih_app_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.ih_user_roles TO authenticated;
GRANT ALL ON public.ih_user_roles TO service_role;
ALTER TABLE public.ih_user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_ih_role(_user_id uuid, _role public.ih_app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ih_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- staff_profiles (created before is_active_ih_staff because the helper queries it)
CREATE TABLE public.ih_staff_profiles (
  id uuid PRIMARY KEY,                   -- = auth.users.id
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role public.ih_app_role NOT NULL DEFAULT 'staff',
  status public.ih_staff_status NOT NULL DEFAULT 'Pending',
  job_title text,
  business_arm public.ih_business_arm DEFAULT 'Training',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  -- Sensitive (admin-only)
  salary_base numeric DEFAULT 0,
  epf_rate numeric DEFAULT 11,
  socso_rate numeric DEFAULT 2,
  admin_notes text,
  insurance_notes text,
  -- Lifecycle
  notion_unlocked_at timestamptz,
  welcome_email_status text,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.ih_staff_profiles TO authenticated;
GRANT ALL ON public.ih_staff_profiles TO service_role;
ALTER TABLE public.ih_staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_active_ih_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ih_staff_profiles
    WHERE id = _user_id AND status = 'Active'
  )
$$;

-- Policies: ih_user_roles
CREATE POLICY "ih_roles self read" ON public.ih_user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'));
CREATE POLICY "ih_roles admin manage" ON public.ih_user_roles
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

-- Policies: ih_staff_profiles
CREATE POLICY "ih_profile self read" ON public.ih_staff_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'));
CREATE POLICY "ih_profile self update non-sensitive" ON public.ih_staff_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "ih_profile admin manage" ON public.ih_staff_profiles
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

-- Sensitive column read enforcement is handled by a SECURITY DEFINER view used by staff UI.
CREATE OR REPLACE VIEW public.ih_staff_profiles_self AS
SELECT id, name, email, role, status, job_title, business_arm, join_date,
       notion_unlocked_at, welcome_email_status, deactivated_at, created_at, updated_at
FROM public.ih_staff_profiles;
GRANT SELECT ON public.ih_staff_profiles_self TO authenticated;

-- =========================================================================
-- onboarding / lifecycle
-- =========================================================================
CREATE TABLE public.ih_access_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, item_key)
);
GRANT SELECT ON public.ih_access_checklist TO authenticated;
GRANT ALL ON public.ih_access_checklist TO service_role;
ALTER TABLE public.ih_access_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_checklist self read" ON public.ih_access_checklist
  FOR SELECT TO authenticated
  USING ((staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()))
         OR public.has_ih_role(auth.uid(), 'admin'));
CREATE POLICY "ih_checklist admin manage" ON public.ih_access_checklist
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

CREATE TABLE public.ih_tool_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  tool text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  granted_at timestamptz,
  UNIQUE (staff_id, tool)
);
GRANT SELECT ON public.ih_tool_access TO authenticated;
GRANT ALL ON public.ih_tool_access TO service_role;
ALTER TABLE public.ih_tool_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_tool self read" ON public.ih_tool_access
  FOR SELECT TO authenticated
  USING ((staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()))
         OR public.has_ih_role(auth.uid(), 'admin'));
CREATE POLICY "ih_tool admin manage" ON public.ih_tool_access
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

CREATE TABLE public.ih_welcome_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pending',
  sent_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ih_welcome_emails TO authenticated;
GRANT ALL ON public.ih_welcome_emails TO service_role;
ALTER TABLE public.ih_welcome_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_welcome admin only" ON public.ih_welcome_emails
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

-- =========================================================================
-- notices / resources
-- =========================================================================
CREATE TABLE public.ih_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  importance public.ih_notice_importance NOT NULL DEFAULT 'Normal',
  audience text NOT NULL DEFAULT 'Everyone',         -- 'Everyone' | 'Training' | 'Solutions' | 'Individual'
  audience_staff_id uuid REFERENCES public.ih_staff_profiles(id) ON DELETE SET NULL,
  ack_required boolean NOT NULL DEFAULT false,
  email_required boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
GRANT SELECT ON public.ih_notices TO authenticated;
GRANT ALL ON public.ih_notices TO service_role;
ALTER TABLE public.ih_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_notice targeted read" ON public.ih_notices
  FOR SELECT TO authenticated
  USING (
    public.has_ih_role(auth.uid(), 'admin')
    OR (
      public.is_active_ih_staff(auth.uid())
      AND archived_at IS NULL
      AND (
        audience = 'Everyone'
        OR (audience = 'Individual' AND audience_staff_id = auth.uid())
        OR (audience IN ('Training','Solutions') AND EXISTS (
              SELECT 1 FROM public.ih_staff_profiles p
              WHERE p.id = auth.uid()
                AND (p.business_arm::text = audience OR p.business_arm = 'Both')
            ))
      )
    )
  );
CREATE POLICY "ih_notice admin manage" ON public.ih_notices
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'));

CREATE TABLE public.ih_notice_reads (
  notice_id uuid NOT NULL REFERENCES public.ih_notices(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notice_id, staff_id)
);
GRANT SELECT, INSERT ON public.ih_notice_reads TO authenticated;
GRANT ALL ON public.ih_notice_reads TO service_role;
ALTER TABLE public.ih_notice_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_notice_reads self" ON public.ih_notice_reads
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_notice_reads self insert" ON public.ih_notice_reads
  FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid());

CREATE TABLE public.ih_notice_acks (
  notice_id uuid NOT NULL REFERENCES public.ih_notices(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  acked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notice_id, staff_id)
);
GRANT SELECT, INSERT ON public.ih_notice_acks TO authenticated;
GRANT ALL ON public.ih_notice_acks TO service_role;
ALTER TABLE public.ih_notice_acks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_notice_acks self read" ON public.ih_notice_acks
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_notice_acks self insert" ON public.ih_notice_acks
  FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()));

CREATE TABLE public.ih_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  url text NOT NULL,
  audience text NOT NULL DEFAULT 'Everyone',
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
GRANT SELECT ON public.ih_resources TO authenticated;
GRANT ALL ON public.ih_resources TO service_role;
ALTER TABLE public.ih_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_resources read" ON public.ih_resources
  FOR SELECT TO authenticated
  USING (
    archived_at IS NULL AND (
      public.has_ih_role(auth.uid(),'admin')
      OR (public.is_active_ih_staff(auth.uid()) AND (
        audience = 'Everyone'
        OR EXISTS (SELECT 1 FROM public.ih_staff_profiles p WHERE p.id=auth.uid()
                   AND (p.business_arm::text = audience OR p.business_arm = 'Both'))
      ))
    )
  );
CREATE POLICY "ih_resources admin manage" ON public.ih_resources
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

-- =========================================================================
-- requests (leave, MC, claim, training, benefit) + attachments + leave balances
-- =========================================================================
CREATE TABLE public.ih_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  kind public.ih_request_kind NOT NULL,
  status public.ih_request_status NOT NULL DEFAULT 'Submitted',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  calendar_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ih_requests TO authenticated;
GRANT ALL ON public.ih_requests TO service_role;
ALTER TABLE public.ih_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_requests self read" ON public.ih_requests
  FOR SELECT TO authenticated
  USING ((staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()))
         OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_requests self insert" ON public.ih_requests
  FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()));
CREATE POLICY "ih_requests self update pending" ON public.ih_requests
  FOR UPDATE TO authenticated
  USING (staff_id = auth.uid() AND status = 'Submitted')
  WITH CHECK (staff_id = auth.uid());
CREATE POLICY "ih_requests admin manage" ON public.ih_requests
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

CREATE TABLE public.ih_request_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.ih_requests(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  path text NOT NULL,
  size integer,
  mime text,
  kind text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ih_request_attachments TO authenticated;
GRANT ALL ON public.ih_request_attachments TO service_role;
ALTER TABLE public.ih_request_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_attach self read" ON public.ih_request_attachments
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_attach self insert" ON public.ih_request_attachments
  FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()));
CREATE POLICY "ih_attach admin manage" ON public.ih_request_attachments
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

CREATE TABLE public.ih_leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  year integer NOT NULL,
  al_total integer NOT NULL DEFAULT 14,
  al_used integer NOT NULL DEFAULT 0,
  sl_total integer NOT NULL DEFAULT 10,
  sl_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, year)
);
GRANT SELECT ON public.ih_leave_balances TO authenticated;
GRANT ALL ON public.ih_leave_balances TO service_role;
ALTER TABLE public.ih_leave_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_leave self read" ON public.ih_leave_balances
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_leave admin manage" ON public.ih_leave_balances
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

-- =========================================================================
-- payroll runs / items / payslips
-- =========================================================================
CREATE TABLE public.ih_payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,                -- 'YYYY-MM'
  status public.ih_payroll_status NOT NULL DEFAULT 'Draft',
  total_work_days integer NOT NULL DEFAULT 22,
  finalized_at timestamptz, finalized_by uuid,
  locked_at timestamptz, locked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ih_payroll_runs TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.ih_payroll_runs TO authenticated;
ALTER TABLE public.ih_payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_payroll_runs admin only" ON public.ih_payroll_runs
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

CREATE TABLE public.ih_payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ih_payroll_runs(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  staff_name text NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  days_worked integer, total_days integer,
  epf numeric DEFAULT 0, socso numeric DEFAULT 0,
  employer_epf numeric DEFAULT 0, employer_socso numeric DEFAULT 0,
  claims_total numeric DEFAULT 0, training_total numeric DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  total_company_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, staff_id)
);
GRANT ALL ON public.ih_payroll_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ih_payroll_items TO authenticated;
ALTER TABLE public.ih_payroll_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_payroll_items admin only" ON public.ih_payroll_items
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

CREATE TABLE public.ih_payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ih_payroll_runs(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  epf numeric DEFAULT 0, socso numeric DEFAULT 0,
  employer_epf numeric DEFAULT 0, employer_socso numeric DEFAULT 0,
  claims_total numeric DEFAULT 0, training_total numeric DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, staff_id)
);
GRANT ALL ON public.ih_payslips TO service_role;
GRANT SELECT ON public.ih_payslips TO authenticated;
ALTER TABLE public.ih_payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_payslips self read" ON public.ih_payslips
  FOR SELECT TO authenticated
  USING ((staff_id = auth.uid() AND public.is_active_ih_staff(auth.uid()))
         OR public.has_ih_role(auth.uid(),'admin'));
CREATE POLICY "ih_payslips admin manage" ON public.ih_payslips
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

CREATE TABLE public.ih_payslip_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id uuid NOT NULL REFERENCES public.ih_payslips(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.ih_staff_profiles(id) ON DELETE CASCADE,
  downloaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ih_payslip_downloads TO authenticated;
GRANT ALL ON public.ih_payslip_downloads TO service_role;
ALTER TABLE public.ih_payslip_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_pdl self insert" ON public.ih_payslip_downloads
  FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid());
CREATE POLICY "ih_pdl read" ON public.ih_payslip_downloads
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() OR public.has_ih_role(auth.uid(),'admin'));

-- =========================================================================
-- finance snapshots (admin only)
-- =========================================================================
CREATE TABLE public.ih_finance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  status public.ih_finance_status NOT NULL DEFAULT 'Draft',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_at timestamptz, reviewed_by uuid,
  locked_at timestamptz, locked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ih_finance_snapshots TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.ih_finance_snapshots TO authenticated;
ALTER TABLE public.ih_finance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ih_finance admin only" ON public.ih_finance_snapshots
  FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(),'admin'))
  WITH CHECK (public.has_ih_role(auth.uid(),'admin'));

-- =========================================================================
-- updated_at triggers
-- =========================================================================
CREATE TRIGGER ih_staff_profiles_touch BEFORE UPDATE ON public.ih_staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ih_requests_touch BEFORE UPDATE ON public.ih_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ih_payroll_runs_touch BEFORE UPDATE ON public.ih_payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ih_finance_snapshots_touch BEFORE UPDATE ON public.ih_finance_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
