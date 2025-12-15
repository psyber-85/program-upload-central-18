-- Drop existing restrictive policies on crm_campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON crm_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON crm_campaigns;

-- Add public access policies for crm_campaigns
CREATE POLICY "Allow public read" ON crm_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON crm_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON crm_campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON crm_campaigns FOR DELETE USING (true);

-- Drop existing restrictive policies on crm_leads
DROP POLICY IF EXISTS "Users can view their own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON crm_leads;

-- Add public access policies for crm_leads
CREATE POLICY "Allow public read" ON crm_leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON crm_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON crm_leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON crm_leads FOR DELETE USING (true);

-- Drop existing restrictive policies on crm_lead_activities
DROP POLICY IF EXISTS "Users can view their own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can create their own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can update their own lead activities" ON crm_lead_activities;
DROP POLICY IF EXISTS "Users can delete their own lead activities" ON crm_lead_activities;

-- Add public access policies for crm_lead_activities
CREATE POLICY "Allow public read" ON crm_lead_activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON crm_lead_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON crm_lead_activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON crm_lead_activities FOR DELETE USING (true);