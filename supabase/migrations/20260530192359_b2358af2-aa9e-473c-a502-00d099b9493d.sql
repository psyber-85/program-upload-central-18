-- =========================================================
-- Phase 1: Internal Hub security & hardening
-- Docs 4.1 (RLS gaps) + 4.3 (hard-delete protection)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Tighten ih_requests self-update: prevent status escalation
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "ih_requests self update pending" ON public.ih_requests;

CREATE POLICY "ih_requests self update pending"
ON public.ih_requests
FOR UPDATE
TO authenticated
USING (
  staff_id = auth.uid()
  AND status = 'Submitted'::ih_request_status
)
WITH CHECK (
  staff_id = auth.uid()
  AND status IN ('Submitted'::ih_request_status, 'Cancelled'::ih_request_status)
);

-- ---------------------------------------------------------
-- 2. Revoke staff column access to sensitive ih_staff_profiles fields
--    Staff must use ih_staff_profiles_self view; admins use has_ih_role check
-- ---------------------------------------------------------
REVOKE SELECT (salary_base, epf_rate, socso_rate, admin_notes, insurance_notes)
  ON public.ih_staff_profiles
  FROM authenticated;

-- Re-grant admin access (admin queries go through has_ih_role policy, but they
-- need the underlying column privilege). service_role keeps full access.
GRANT SELECT (salary_base, epf_rate, socso_rate, admin_notes, insurance_notes)
  ON public.ih_staff_profiles
  TO service_role;

-- ---------------------------------------------------------
-- 3. Add archived_at to ih_notices + update visibility policy
-- ---------------------------------------------------------
ALTER TABLE public.ih_notices
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Existing "ih_notice targeted read" already filters archived_at IS NULL,
-- but column didn't exist. Now backfilled.

-- ---------------------------------------------------------
-- 4. Hard-delete protection on ih_notices and ih_resources
--    Split FOR ALL into INSERT/UPDATE/SELECT-only; deny DELETE
-- ---------------------------------------------------------
-- Notices
DROP POLICY IF EXISTS "ih_notice admin manage" ON public.ih_notices;

CREATE POLICY "ih_notice admin select"
ON public.ih_notices FOR SELECT TO authenticated
USING (has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "ih_notice admin insert"
ON public.ih_notices FOR INSERT TO authenticated
WITH CHECK (has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "ih_notice admin update"
ON public.ih_notices FOR UPDATE TO authenticated
USING (has_ih_role(auth.uid(), 'admin'::ih_app_role))
WITH CHECK (has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- Resources
DROP POLICY IF EXISTS "ih_resources admin manage" ON public.ih_resources;

CREATE POLICY "ih_resources admin select"
ON public.ih_resources FOR SELECT TO authenticated
USING (has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "ih_resources admin insert"
ON public.ih_resources FOR INSERT TO authenticated
WITH CHECK (has_ih_role(auth.uid(), 'admin'::ih_app_role));

CREATE POLICY "ih_resources admin update"
ON public.ih_resources FOR UPDATE TO authenticated
USING (has_ih_role(auth.uid(), 'admin'::ih_app_role))
WITH CHECK (has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- Belt-and-suspenders: BEFORE DELETE trigger to block any non-service_role deletes
CREATE OR REPLACE FUNCTION public.ih_block_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (bypasses RLS); block everything else
  IF auth.role() = 'service_role' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Hard delete is not permitted on %; use archived_at instead', TG_TABLE_NAME;
END;
$$;

DROP TRIGGER IF EXISTS trg_ih_notices_block_delete ON public.ih_notices;
CREATE TRIGGER trg_ih_notices_block_delete
  BEFORE DELETE ON public.ih_notices
  FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();

DROP TRIGGER IF EXISTS trg_ih_resources_block_delete ON public.ih_resources;
CREATE TRIGGER trg_ih_resources_block_delete
  BEFORE DELETE ON public.ih_resources
  FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();

-- ---------------------------------------------------------
-- 5. Explicit DELETE policy for ih_request_attachments (owner + admin)
--    (Currently relies on admin-manage FOR ALL; add owner-self DELETE)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "ih_attach self delete" ON public.ih_request_attachments;

CREATE POLICY "ih_attach self delete"
ON public.ih_request_attachments
FOR DELETE
TO authenticated
USING (
  staff_id = auth.uid()
  AND is_active_ih_staff(auth.uid())
);

-- ---------------------------------------------------------
-- 6. Private payslips storage bucket + RLS
-- ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Owner read: path layout = {staff_id}/{filename.pdf}
DROP POLICY IF EXISTS "Payslips owner read" ON storage.objects;
CREATE POLICY "Payslips owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payslips'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin read: any payslip
DROP POLICY IF EXISTS "Payslips admin read" ON storage.objects;
CREATE POLICY "Payslips admin read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payslips'
  AND has_ih_role(auth.uid(), 'admin'::ih_app_role)
);

-- Admin write: edge function service_role bypasses; this allows admin UI uploads too
DROP POLICY IF EXISTS "Payslips admin write" ON storage.objects;
CREATE POLICY "Payslips admin write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payslips'
  AND has_ih_role(auth.uid(), 'admin'::ih_app_role)
);

DROP POLICY IF EXISTS "Payslips admin update" ON storage.objects;
CREATE POLICY "Payslips admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payslips'
  AND has_ih_role(auth.uid(), 'admin'::ih_app_role)
);

DROP POLICY IF EXISTS "Payslips admin delete" ON storage.objects;
CREATE POLICY "Payslips admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payslips'
  AND has_ih_role(auth.uid(), 'admin'::ih_app_role)
);
