
-- Create prospects table for tracking sales prospects
CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  org TEXT,
  role TEXT,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'failed')),
  product_type TEXT,
  registration_status TEXT DEFAULT 'Pending' CHECK (registration_status IN ('Pending', 'Approved', 'Rejected', 'Postponed', 'On Hold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prospect_calls table for logging sales calls
CREATE TABLE public.prospect_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hr_contacts table for storing HR contact information
CREATE TABLE public.hr_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_prospects_program_id ON public.prospects(program_id);
CREATE INDEX idx_prospects_registration_status ON public.prospects(registration_status);
CREATE INDEX idx_prospect_calls_prospect_id ON public.prospect_calls(prospect_id);
CREATE INDEX idx_hr_contacts_prospect_id ON public.hr_contacts(prospect_id);

-- Enable Row Level Security (make tables public for now, can be restricted later if needed)
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_contacts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON public.prospects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.prospect_calls
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.hr_contacts
  FOR ALL USING (true) WITH CHECK (true);
