-- Create program_links table
CREATE TABLE public.program_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_title TEXT NOT NULL UNIQUE,
  signup_form_url TEXT NOT NULL,
  brochure_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.program_links ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow authenticated users to read program links"
  ON public.program_links FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert/update/delete for authenticated users
CREATE POLICY "Allow authenticated users to manage program links"
  ON public.program_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_program_links_updated_at
  BEFORE UPDATE ON public.program_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data with all programs
INSERT INTO public.program_links (program_title, signup_form_url, brochure_url) VALUES
  ('Business Writing with AI: 2-Day Masterclass', 
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/Sign%20Up%20Form%20-%20Business%20Writing%20with%20AI_Q4_compressed.pdf',
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/Business%20Writing%20with%20AI-Course_Brochure.pdf'),
  
  ('ChatGPT Skill Boost (Intermediate)',
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/Sign%20Up%20Form%20-%20ChatGPT%20Skill%20Boost%20Intermediate_Q4_compressed.pdf',
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/ChatGPT%20Skill%20Boost%20(GPT-5)-Course_Brochure.pdf'),
  
  ('ChatGPT Skill Boost (GPT-5 Edition)',
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/Sign%20Up%20Form%20-%20ChatGPT%20Skill%20Boost%20Intermediate_Q4_compressed.pdf',
   'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/ChatGPT%20Skill%20Boost%20(GPT-5)-Course_Brochure.pdf'),
  
  ('AI and ChatGPT for HR Professionals - 2 Day Masterclass',
   'https://drive.google.com/file/d/1IG9gOVe65C__6KTjJCd_RZqj_nAFlob_/view?usp=drive_link',
   'https://drive.google.com/file/d/1GWc2tUZfsUR8FSZxuGuBR8T34iVv9fFy/view'),
  
  ('The AI-Ready Leader: Win the Future with Strategic Action',
   'https://drive.google.com/file/d/1KEE95XsMiSMgV8YseUX2db7eV0qtI5AY/view?usp=drive_link',
   'https://drive.google.com/file/d/1silb4DtDCHv04r_eriODS6nn-QWZmkrs/view'),
  
  ('Business Writing with AI - 2 Days Masterclass',
   'https://drive.google.com/file/d/1TfMEwTzzaAimEyVH2jWIDDGam5WGVXht/view?usp=sharing',
   'https://drive.google.com/file/d/1Ds_rHup0GRHENj1FVR5_ABn05fYI-s1e/view?usp=sharing');