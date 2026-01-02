-- Update CRM Tables: Change from user-scoped to shared workspace model
-- All authenticated users can access all CRM data

-- Drop existing user-scoped policies on crm_campaigns
DROP POLICY IF EXISTS "Users can view own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON crm_campaigns;

-- Drop existing user-scoped policies on crm_leads
DROP POLICY IF EXISTS "Users can view own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can update own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON crm_leads;

-- Drop existing user-scoped policies on crm_lead_activities
DROP POLICY IF EXISTS "Users can view own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can insert own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can update own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can delete own lead activities" ON crm_lead_activities;

-- Create shared workspace policies for crm_campaigns
CREATE POLICY "Authenticated users can view all campaigns" ON crm_campaigns
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaigns" ON crm_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all campaigns" ON crm_campaigns
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all campaigns" ON crm_campaigns
  FOR DELETE TO authenticated
  USING (true);

-- Create shared workspace policies for crm_leads
CREATE POLICY "Authenticated users can view all leads" ON crm_leads
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads" ON crm_leads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all leads" ON crm_leads
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all leads" ON crm_leads
  FOR DELETE TO authenticated
  USING (true);

-- Create shared workspace policies for crm_lead_activities
CREATE POLICY "Authenticated users can view all lead activities" ON crm_lead_activities
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lead activities" ON crm_lead_activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all lead activities" ON crm_lead_activities
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all lead activities" ON crm_lead_activities
  FOR DELETE TO authenticated
  USING (true);