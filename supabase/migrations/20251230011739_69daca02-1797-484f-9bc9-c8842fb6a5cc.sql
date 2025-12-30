-- Fix CRM Tables: Remove public policies and add user-scoped policies

-- Drop all public policies on crm_campaigns
DROP POLICY IF EXISTS "Allow public read" ON crm_campaigns;
DROP POLICY IF EXISTS "Allow public insert" ON crm_campaigns;
DROP POLICY IF EXISTS "Allow public update" ON crm_campaigns;
DROP POLICY IF EXISTS "Allow public delete" ON crm_campaigns;

-- Drop all public policies on crm_leads
DROP POLICY IF EXISTS "Allow public read" ON crm_leads;
DROP POLICY IF EXISTS "Allow public insert" ON crm_leads;
DROP POLICY IF EXISTS "Allow public update" ON crm_leads;
DROP POLICY IF EXISTS "Allow public delete" ON crm_leads;

-- Drop all public policies on crm_lead_activities
DROP POLICY IF EXISTS "Allow public read" ON crm_lead_activities;
DROP POLICY IF EXISTS "Allow public insert" ON crm_lead_activities;
DROP POLICY IF EXISTS "Allow public update" ON crm_lead_activities;
DROP POLICY IF EXISTS "Allow public delete" ON crm_lead_activities;

-- Create authenticated user-scoped policies for crm_campaigns
CREATE POLICY "Users can view own campaigns" ON crm_campaigns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON crm_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON crm_campaigns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON crm_campaigns
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create authenticated user-scoped policies for crm_leads
CREATE POLICY "Users can view own leads" ON crm_leads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON crm_leads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON crm_leads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON crm_leads
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create authenticated user-scoped policies for crm_lead_activities
CREATE POLICY "Users can view own lead activities" ON crm_lead_activities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead activities" ON crm_lead_activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead activities" ON crm_lead_activities
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead activities" ON crm_lead_activities
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fix registration_programs: Enable RLS and add policies
ALTER TABLE registration_programs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (programs should be viewable for registration)
CREATE POLICY "Public can read programs" ON registration_programs
  FOR SELECT TO anon, authenticated
  USING (true);

-- Restrict write operations to authenticated users only
CREATE POLICY "Authenticated users can insert programs" ON registration_programs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update programs" ON registration_programs
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete programs" ON registration_programs
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);