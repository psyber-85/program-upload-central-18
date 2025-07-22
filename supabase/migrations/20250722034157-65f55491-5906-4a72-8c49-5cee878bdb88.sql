
-- Create ENUMs for CRM system
CREATE TYPE crm_lead_score AS ENUM ('A', 'B', 'C', 'D', 'E');
CREATE TYPE crm_lead_status AS ENUM ('Success', 'Lost', 'Future');
CREATE TYPE crm_activity_type AS ENUM ('Contacted', 'Call', 'Email');

-- Create crm_campaigns table
CREATE TABLE public.crm_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crm_leads table
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.crm_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  number TEXT NOT NULL,
  job_role TEXT NOT NULL,
  org TEXT NOT NULL,
  industry TEXT NOT NULL,
  lead_source TEXT NOT NULL,
  state TEXT NOT NULL,
  last_contacted TIMESTAMP WITH TIME ZONE,
  next_follow_up DATE,
  potential_deal_size NUMERIC DEFAULT 0,
  confirmed_deal_size NUMERIC DEFAULT 0,
  lead_score crm_lead_score NOT NULL DEFAULT 'C',
  status crm_lead_status NOT NULL DEFAULT 'Future',
  owner_id UUID,
  owner_name TEXT NOT NULL,
  notes TEXT,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crm_lead_activities table
CREATE TABLE public.crm_lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type crm_activity_type NOT NULL,
  note TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all CRM tables
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.crm_campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.crm_campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.crm_campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.crm_campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for crm_leads
CREATE POLICY "Users can view their own leads" 
  ON public.crm_leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.crm_leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
  ON public.crm_leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON public.crm_leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for crm_lead_activities
CREATE POLICY "Users can view their own lead activities" 
  ON public.crm_lead_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead activities" 
  ON public.crm_lead_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead activities" 
  ON public.crm_lead_activities 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead activities" 
  ON public.crm_lead_activities 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_crm_campaigns_user_id ON public.crm_campaigns(user_id);
CREATE INDEX idx_crm_leads_campaign_id ON public.crm_leads(campaign_id);
CREATE INDEX idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX idx_crm_lead_activities_lead_id ON public.crm_lead_activities(lead_id);
CREATE INDEX idx_crm_lead_activities_user_id ON public.crm_lead_activities(user_id);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_crm_campaigns_updated_at 
  BEFORE UPDATE ON public.crm_campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_leads_updated_at 
  BEFORE UPDATE ON public.crm_leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
