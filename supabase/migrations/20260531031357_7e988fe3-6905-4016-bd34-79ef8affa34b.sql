-- Doc 4.1 §11: soft archive on requests; §12 extend hard-delete guard

ALTER TABLE public.ih_requests
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Replace self-read policy to hide archived rows from non-admins
DROP POLICY IF EXISTS "ih_requests self read" ON public.ih_requests;
CREATE POLICY "ih_requests self read" ON public.ih_requests
  FOR SELECT TO authenticated
  USING (
    (staff_id = auth.uid()
      AND public.is_active_ih_staff(auth.uid())
      AND archived_at IS NULL)
    OR public.has_ih_role(auth.uid(),'admin')
  );

-- Extend hard-delete guard to ih_requests
DROP TRIGGER IF EXISTS trg_ih_requests_block_delete ON public.ih_requests;
CREATE TRIGGER trg_ih_requests_block_delete
  BEFORE DELETE ON public.ih_requests
  FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();