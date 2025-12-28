-- Create table to log brochure downloads
CREATE TABLE public.tryhire_brochure_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tryhire_brochure_downloads ENABLE ROW LEVEL SECURITY;

-- Allow public insert (anonymous users can submit)
CREATE POLICY "Allow public insert" ON public.tryhire_brochure_downloads
  FOR INSERT WITH CHECK (true);