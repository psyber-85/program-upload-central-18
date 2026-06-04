
-- 1. Backfill Pending → Active (bypass sensitive-field trigger)
ALTER TABLE public.ih_staff_profiles DISABLE TRIGGER USER;
UPDATE public.ih_staff_profiles SET status = 'Active' WHERE status = 'Pending';
ALTER TABLE public.ih_staff_profiles ENABLE TRIGGER USER;

-- 2. Hard-delete server-side block on ih_staff_profiles
DROP TRIGGER IF EXISTS ih_block_hard_delete_staff ON public.ih_staff_profiles;
CREATE TRIGGER ih_block_hard_delete_staff
BEFORE DELETE ON public.ih_staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();

-- 3. insurance_covered column on ih_staff_profiles
ALTER TABLE public.ih_staff_profiles
  ADD COLUMN IF NOT EXISTS insurance_covered boolean NOT NULL DEFAULT false;

-- Permit admins to update insurance_covered without tripping sensitive-field guard
-- (it's already not listed in ih_block_sensitive_self_update, so staff cannot update via RLS;
--  admin RLS policy + trigger already allow admin writes.)

-- 4. Notice type enum + column
DO $$ BEGIN
  CREATE TYPE public.ih_notice_type AS ENUM (
    'AdminBroadcast',
    'SystemNotification',
    'ResourceUpdate',
    'PayrollNotice',
    'AccessNotice',
    'DeadlineReminder',
    'GeneralAnnouncement'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.ih_notices
  ADD COLUMN IF NOT EXISTS type public.ih_notice_type NOT NULL DEFAULT 'AdminBroadcast';

-- 5. Allow Admin-only audience in RLS for ih_notices.
DROP POLICY IF EXISTS "ih_notice targeted read" ON public.ih_notices;
CREATE POLICY "ih_notice targeted read"
ON public.ih_notices
FOR SELECT
TO authenticated
USING (
  has_ih_role(auth.uid(), 'admin'::ih_app_role)
  OR (
    is_active_ih_staff(auth.uid())
    AND archived_at IS NULL
    AND (
      audience = 'Everyone'
      OR (audience = 'Admin' AND has_ih_role(auth.uid(), 'admin'::ih_app_role))
      OR (audience = 'Individual' AND audience_staff_id = auth.uid())
      OR (
        audience IN ('Training', 'Solutions')
        AND EXISTS (
          SELECT 1 FROM public.ih_staff_profiles p
          WHERE p.id = auth.uid()
            AND (p.business_arm::text = ih_notices.audience OR p.business_arm = 'Both'::ih_business_arm)
        )
      )
    )
  )
);

-- 6. Broadcast log table
CREATE TABLE IF NOT EXISTS public.ih_broadcast_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL,
  broadcast_at timestamptz NOT NULL DEFAULT now(),
  recipient_count integer NOT NULL DEFAULT 0,
  audience text NOT NULL,
  audience_staff_id uuid,
  email_required boolean NOT NULL DEFAULT true,
  created_by uuid
);

GRANT SELECT, INSERT ON public.ih_broadcast_log TO authenticated;
GRANT ALL ON public.ih_broadcast_log TO service_role;

ALTER TABLE public.ih_broadcast_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ih_broadcast_log admin read" ON public.ih_broadcast_log;
CREATE POLICY "ih_broadcast_log admin read"
ON public.ih_broadcast_log
FOR SELECT
TO authenticated
USING (has_ih_role(auth.uid(), 'admin'::ih_app_role));

DROP POLICY IF EXISTS "ih_broadcast_log admin insert" ON public.ih_broadcast_log;
CREATE POLICY "ih_broadcast_log admin insert"
ON public.ih_broadcast_log
FOR INSERT
TO authenticated
WITH CHECK (has_ih_role(auth.uid(), 'admin'::ih_app_role));
