
-- =========================================================
-- 1. hr_contacts: restrict to authenticated
-- =========================================================
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.hr_contacts;
CREATE POLICY "Authenticated can manage hr_contacts"
ON public.hr_contacts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- =========================================================
-- 2. prospects: restrict to authenticated
-- =========================================================
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.prospects;
CREATE POLICY "Authenticated can manage prospects"
ON public.prospects FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- =========================================================
-- 3. prospect_calls: restrict to authenticated
-- =========================================================
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.prospect_calls;
CREATE POLICY "Authenticated can manage prospect_calls"
ON public.prospect_calls FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- =========================================================
-- 4. participants: remove anon, allow authenticated
-- =========================================================
DROP POLICY IF EXISTS "Allow anonymous insert for participants" ON public.participants;
DROP POLICY IF EXISTS "Allow anonymous select for participants" ON public.participants;
CREATE POLICY "Authenticated can read participants"
ON public.participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert participants"
ON public.participants FOR INSERT TO authenticated WITH CHECK (true);
REVOKE SELECT, INSERT ON public.participants FROM anon;
GRANT SELECT, INSERT ON public.participants TO authenticated;

-- =========================================================
-- 5. participants_bday_duplicate: scope to authenticated only (existing)
--    Add stricter check: must be active IH staff or admin
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can read birthday participants" ON public.participants_bday_duplicate;
DROP POLICY IF EXISTS "Authenticated can insert birthday participants" ON public.participants_bday_duplicate;
CREATE POLICY "Active staff can read birthday participants"
ON public.participants_bday_duplicate FOR SELECT TO authenticated
USING (public.is_active_ih_staff(auth.uid()) OR public.has_ih_role(auth.uid(),'admin'::ih_app_role));
CREATE POLICY "Active staff can insert birthday participants"
ON public.participants_bday_duplicate FOR INSERT TO authenticated
WITH CHECK (public.is_active_ih_staff(auth.uid()) OR public.has_ih_role(auth.uid(),'admin'::ih_app_role));

-- =========================================================
-- 6. programs: remove anon insert; keep public read for marketing pages
-- =========================================================
DROP POLICY IF EXISTS "Allow anonymous insert for programs" ON public.programs;
CREATE POLICY "Authenticated can insert programs"
ON public.programs FOR INSERT TO authenticated WITH CHECK (true);
REVOKE INSERT ON public.programs FROM anon;
GRANT INSERT ON public.programs TO authenticated;

-- =========================================================
-- 7. registration_rounds: restrict writes to authenticated
-- =========================================================
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.registration_rounds;
CREATE POLICY "Public can read registration rounds"
ON public.registration_rounds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage registration rounds"
ON public.registration_rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update registration rounds"
ON public.registration_rounds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete registration rounds"
ON public.registration_rounds FOR DELETE TO authenticated USING (true);

-- =========================================================
-- 8. sp_staff_profiles: block self-update of sensitive columns
-- =========================================================
CREATE OR REPLACE FUNCTION public.sp_block_sensitive_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_sp_role(auth.uid(), 'admin'::sp_app_role) THEN
    IF NEW.salary_base IS DISTINCT FROM OLD.salary_base
       OR NEW.epf_rate IS DISTINCT FROM OLD.epf_rate
       OR NEW.socso_rate IS DISTINCT FROM OLD.socso_rate
       OR NEW.is_active IS DISTINCT FROM OLD.is_active
       OR NEW.business_arm IS DISTINCT FROM OLD.business_arm
       OR NEW.join_date IS DISTINCT FROM OLD.join_date
       OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Only admins can modify compensation, status, or identity fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sp_block_sensitive_self_update ON public.sp_staff_profiles;
CREATE TRIGGER trg_sp_block_sensitive_self_update
BEFORE UPDATE ON public.sp_staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.sp_block_sensitive_self_update();

-- =========================================================
-- 9. ih_staff_profiles: block self-update of sensitive columns
-- =========================================================
CREATE OR REPLACE FUNCTION public.ih_block_sensitive_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_ih_role(auth.uid(), 'admin'::ih_app_role) THEN
    IF NEW.salary_base IS DISTINCT FROM OLD.salary_base
       OR NEW.epf_rate IS DISTINCT FROM OLD.epf_rate
       OR NEW.socso_rate IS DISTINCT FROM OLD.socso_rate
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
$$;

DROP TRIGGER IF EXISTS trg_ih_block_sensitive_self_update ON public.ih_staff_profiles;
CREATE TRIGGER trg_ih_block_sensitive_self_update
BEFORE UPDATE ON public.ih_staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.ih_block_sensitive_self_update();

-- =========================================================
-- 10. request-attachments bucket: make private, remove anon read
-- =========================================================
UPDATE storage.buckets SET public = false WHERE id = 'request-attachments';
DROP POLICY IF EXISTS "Public can view request attachments" ON storage.objects;

-- =========================================================
-- 11. Fix function search_path on update_updated_at_column
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 12. Revoke EXECUTE on SECURITY DEFINER helpers from anon
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.has_sp_role(uuid, sp_app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_ih_role(uuid, ih_app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_active_ih_staff(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_sp_role(uuid, sp_app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_ih_role(uuid, ih_app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_ih_staff(uuid) TO authenticated, service_role;
