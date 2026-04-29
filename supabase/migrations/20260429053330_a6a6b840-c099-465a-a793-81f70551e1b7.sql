CREATE POLICY "Authenticated can read birthday participants"
ON public.participants_bday_duplicate
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert birthday participants"
ON public.participants_bday_duplicate
FOR INSERT
TO authenticated
WITH CHECK (true);