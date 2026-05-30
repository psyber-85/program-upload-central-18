
DROP VIEW IF EXISTS public.ih_staff_profiles_self;
CREATE VIEW public.ih_staff_profiles_self
  WITH (security_invoker = true) AS
SELECT id, name, email, role, status, job_title, business_arm, join_date,
       notion_unlocked_at, welcome_email_status, deactivated_at, created_at, updated_at
FROM public.ih_staff_profiles;
GRANT SELECT ON public.ih_staff_profiles_self TO authenticated;
