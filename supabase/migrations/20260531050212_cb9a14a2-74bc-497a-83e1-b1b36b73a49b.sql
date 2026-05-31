-- registration_programs: tighten writes to IH admin only; keep public read.
DROP POLICY IF EXISTS "Authenticated users can delete programs" ON public.registration_programs;
DROP POLICY IF EXISTS "Authenticated users can insert programs" ON public.registration_programs;
DROP POLICY IF EXISTS "Authenticated users can update programs" ON public.registration_programs;
CREATE POLICY "Admins manage registration_programs"
  ON public.registration_programs FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- registration_rounds: tighten writes to IH admin only; keep public read.
DROP POLICY IF EXISTS "Authenticated can delete registration rounds" ON public.registration_rounds;
DROP POLICY IF EXISTS "Authenticated can manage registration rounds" ON public.registration_rounds;
DROP POLICY IF EXISTS "Authenticated can update registration rounds" ON public.registration_rounds;
CREATE POLICY "Admins manage registration_rounds"
  ON public.registration_rounds FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- programs: restrict INSERT to admin; keep public SELECT.
DROP POLICY IF EXISTS "Authenticated can insert programs" ON public.programs;
CREATE POLICY "Admins insert programs"
  ON public.programs FOR INSERT TO authenticated
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));
CREATE POLICY "Admins update programs"
  ON public.programs FOR UPDATE TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));
CREATE POLICY "Admins delete programs"
  ON public.programs FOR DELETE TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));

-- program_links: restrict all writes to IH admin; allow authenticated read.
DROP POLICY IF EXISTS "Allow authenticated users to manage program links" ON public.program_links;
DROP POLICY IF EXISTS "Allow authenticated users to read program links" ON public.program_links;
CREATE POLICY "Authenticated read program_links"
  ON public.program_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage program_links"
  ON public.program_links FOR ALL TO authenticated
  USING (public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  WITH CHECK (public.has_ih_role(auth.uid(), 'admin'::ih_app_role));