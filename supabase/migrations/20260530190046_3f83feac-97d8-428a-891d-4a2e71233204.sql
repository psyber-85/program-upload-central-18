
-- Tighten participants (NRIC PII) — admin/active staff only
DROP POLICY IF EXISTS "Authenticated can read participants" ON public.participants;
DROP POLICY IF EXISTS "Authenticated can insert participants" ON public.participants;

CREATE POLICY "Staff can read participants"
ON public.participants FOR SELECT TO authenticated
USING (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "Staff can insert participants"
ON public.participants FOR INSERT TO authenticated
WITH CHECK (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- participants_bday has RLS enabled but no policies — add admin-only
CREATE POLICY "Staff can read bday participants"
ON public.participants_bday FOR SELECT TO authenticated
USING (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "Staff can insert bday participants"
ON public.participants_bday FOR INSERT TO authenticated
WITH CHECK (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- Tighten hr_contacts / prospects / prospect_calls — staff/admin only (was any authenticated)
DROP POLICY IF EXISTS "Authenticated can manage hr_contacts" ON public.hr_contacts;
CREATE POLICY "Staff can manage hr_contacts"
ON public.hr_contacts FOR ALL TO authenticated
USING (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role))
WITH CHECK (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

DROP POLICY IF EXISTS "Authenticated can manage prospects" ON public.prospects;
CREATE POLICY "Staff can manage prospects"
ON public.prospects FOR ALL TO authenticated
USING (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role))
WITH CHECK (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

DROP POLICY IF EXISTS "Authenticated can manage prospect_calls" ON public.prospect_calls;
CREATE POLICY "Staff can manage prospect_calls"
ON public.prospect_calls FOR ALL TO authenticated
USING (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role))
WITH CHECK (is_active_ih_staff(auth.uid()) OR has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- Add explicit UPDATE policy on request-attachments storage bucket (owner only)
CREATE POLICY "ih_attach owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'request-attachments' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'request-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Revoke EXECUTE from anon on SECURITY DEFINER role helpers (defense in depth)
REVOKE EXECUTE ON FUNCTION public.has_sp_role(uuid, sp_app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_ih_role(uuid, ih_app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_active_ih_staff(uuid) FROM anon, PUBLIC;
