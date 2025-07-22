
import { supabase } from '@/integrations/supabase/client';
import { CrmCampaign, CrmLead, CrmLeadActivity } from './types';
import { DbCrmCampaign, DbCrmLead, DbCrmLeadActivity } from './supabaseTypes';
import { 
  transformDbCampaign, 
  transformDbLead, 
  transformDbActivity,
  transformCampaignForDb,
  transformLeadForDb,
  transformActivityForDb
} from './dataTransforms';

// Get current user ID with error handling
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

export const fetchCrmCampaigns = async (): Promise<CrmCampaign[]> => {
  console.log('Fetching CRM campaigns from Supabase...');
  
  const { data, error } = await supabase
    .from('crm_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return (data as DbCrmCampaign[]).map(transformDbCampaign);
};

export const fetchCrmLeadsByCampaign = async (crm_campaignId: string): Promise<CrmLead[]> => {
  console.log(`Fetching leads for campaign ${crm_campaignId} from Supabase...`);
  
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('campaign_id', crm_campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return (data as DbCrmLead[]).map(transformDbLead);
};

export const saveCrmCampaign = async (campaign: Omit<CrmCampaign, 'crm_id'>): Promise<CrmCampaign> => {
  console.log('Saving CRM campaign to Supabase:', campaign);
  
  const userId = await getCurrentUserId();
  const dbCampaign = transformCampaignForDb(campaign, userId);

  const { data, error } = await supabase
    .from('crm_campaigns')
    .insert([dbCampaign])
    .select()
    .single();

  if (error) {
    console.error('Error saving campaign:', error);
    throw new Error(`Failed to save campaign: ${error.message}`);
  }

  return transformDbCampaign(data as DbCrmCampaign);
};

export const saveCrmLead = async (lead: CrmLead): Promise<CrmLead> => {
  console.log('Saving CRM lead to Supabase:', lead);
  
  const userId = await getCurrentUserId();

  if (lead.crm_id && lead.crm_id !== 'new') {
    // Update existing lead
    const { crm_id, ...leadWithoutId } = lead;
    const dbLead = transformLeadForDb(leadWithoutId, userId);

    const { data, error } = await supabase
      .from('crm_leads')
      .update(dbLead)
      .eq('id', crm_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return transformDbLead(data as DbCrmLead);
  } else {
    // Insert new lead
    const { crm_id, ...leadWithoutId } = lead;
    const dbLead = transformLeadForDb(leadWithoutId, userId);

    const { data, error } = await supabase
      .from('crm_leads')
      .insert([dbLead])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return transformDbLead(data as DbCrmLead);
  }
};

export const updateCrmLeadField = async (
  leadId: string, 
  field: keyof CrmLead, 
  value: any
): Promise<void> => {
  console.log(`Updating lead ${leadId} field ${field} to:`, value);

  // Map frontend field names to database field names
  const fieldMapping: Record<string, string> = {
    crm_name: 'name',
    crm_email: 'email',
    crm_number: 'number',
    crm_jobRole: 'job_role',
    crm_org: 'org',
    crm_industry: 'industry',
    crm_leadSource: 'lead_source',
    crm_state: 'state',
    crm_lastContacted: 'last_contacted',
    crm_nextFollowUp: 'next_follow_up',
    crm_potentialDealSize: 'potential_deal_size',
    crm_confirmedDealSize: 'confirmed_deal_size',
    crm_leadScore: 'lead_score',
    crm_status: 'status',
    crm_ownerId: 'owner_id',
    crm_ownerName: 'owner_name',
    crm_notes: 'notes',
    crm_convertedAt: 'converted_at',
  };

  const dbField = fieldMapping[field];
  if (!dbField) {
    throw new Error(`Invalid field: ${field}`);
  }

  const { error } = await supabase
    .from('crm_leads')
    .update({ [dbField]: value })
    .eq('id', leadId);

  if (error) {
    console.error('Error updating lead field:', error);
    throw new Error(`Failed to update lead field: ${error.message}`);
  }
};

export const logCrmActivity = async (
  leadId: string, 
  activity: Omit<CrmLeadActivity, 'crm_id' | 'crm_leadId'>
): Promise<CrmLeadActivity> => {
  console.log(`Logging activity for lead ${leadId}:`, activity);
  
  const userId = await getCurrentUserId();
  const dbActivity = transformActivityForDb(activity, leadId, userId);

  const { data, error } = await supabase
    .from('crm_lead_activities')
    .insert([dbActivity])
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    throw new Error(`Failed to log activity: ${error.message}`);
  }

  return transformDbActivity(data as DbCrmLeadActivity);
};

export const fetchCrmActivitiesByLead = async (leadId: string): Promise<CrmLeadActivity[]> => {
  console.log(`Fetching activities for lead ${leadId} from Supabase...`);
  
  const { data, error } = await supabase
    .from('crm_lead_activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return (data as DbCrmLeadActivity[]).map(transformDbActivity);
};

export const importCrmLeadsFromSheet = async (
  file: File, 
  crm_campaignId: string
): Promise<{ imported: number; duplicates: number; errors: string[] }> => {
  console.log(`Importing leads from ${file.name} to campaign ${crm_campaignId}...`);
  
  const userId = await getCurrentUserId();
  
  // This is a placeholder implementation - actual CSV/XLSX parsing would be more complex
  // For now, simulate the import process
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockImportResult = {
    imported: Math.floor(Math.random() * 20) + 5,
    duplicates: Math.floor(Math.random() * 3),
    errors: []
  };

  // TODO: Implement actual CSV/XLSX parsing and batch insert
  // 1. Parse the file using papaparse or xlsx
  // 2. Map columns to lead fields
  // 3. Validate data
  // 4. Check for duplicates
  // 5. Batch insert valid leads
  
  return mockImportResult;
};
