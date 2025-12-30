
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
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Get current user ID - requires authentication
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('Authentication required. Please log in to access CRM features.');
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
    // Insert new lead - don't include the crm_id field
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
  let parsedData: any[] = [];

  try {
    // Parse the file based on its type
    if (file.name.endsWith('.csv')) {
      parsedData = await parseCSVFile(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parsedData = await parseExcelFile(file);
    } else {
      throw new Error('Unsupported file type. Please upload CSV or Excel files.');
    }

    if (parsedData.length === 0) {
      throw new Error('No data found in the file');
    }

    // Map CSV columns to lead fields and validate data
    const mappedLeads = parsedData.map((row, index) => {
      try {
        return mapRowToLead(row, crm_campaignId, userId);
      } catch (error) {
        throw new Error(`Row ${index + 2}: ${error.message}`);
      }
    }).filter(lead => lead !== null);

    if (mappedLeads.length === 0) {
      throw new Error('No valid leads found in the file');
    }

    // Check for duplicates in the database
    const existingLeads = await supabase
      .from('crm_leads')
      .select('name, email')
      .eq('campaign_id', crm_campaignId)
      .eq('user_id', userId);

    if (existingLeads.error) {
      throw new Error(`Failed to check for duplicates: ${existingLeads.error.message}`);
    }

    const existingKeys = new Set(
      existingLeads.data.map(lead => `${lead.name.toLowerCase()}-${lead.email.toLowerCase()}`)
    );

    const newLeads: any[] = [];
    let duplicateCount = 0;

    mappedLeads.forEach(lead => {
      const key = `${lead.name.toLowerCase()}-${lead.email.toLowerCase()}`;
      if (existingKeys.has(key)) {
        duplicateCount++;
      } else {
        newLeads.push(lead);
        existingKeys.add(key);
      }
    });

    // Batch insert new leads
    let importedCount = 0;
    if (newLeads.length > 0) {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert(newLeads)
        .select();

      if (error) {
        throw new Error(`Failed to import leads: ${error.message}`);
      }

      importedCount = data?.length || 0;
    }

    return {
      imported: importedCount,
      duplicates: duplicateCount,
      errors: []
    };

  } catch (error) {
    console.error('Import error:', error);
    return {
      imported: 0,
      duplicates: 0,
      errors: [error.message || 'Unknown error occurred']
    };
  }
};

// Helper function to parse CSV files
const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

// Helper function to parse Excel files
const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to map CSV row to lead object with exact column names
const mapRowToLead = (row: any, campaignId: string, userId: string) => {
  // Exact column mapping - no variations allowed
  const name = (row.Name || '').toString().trim();
  const email = (row.Email || '').toString().trim();
  const phone = (row.Phone || '').toString().trim();
  const org = (row.Org || '').toString().trim();
  const role = (row.Role || '').toString().trim();
  const industry = (row.Industry || '').toString().trim();
  const leadSource = (row['Lead Source'] || '').toString().trim();
  const state = (row.State || '').toString().trim();

  if (!name || !email) {
    throw new Error('Name and Email are required fields');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  return {
    campaign_id: campaignId,
    user_id: userId,
    name,
    email,
    number: phone,
    job_role: role,
    org: org,
    industry: industry,
    lead_source: leadSource,
    state: state,
    potential_deal_size: 0,
    confirmed_deal_size: 0,
    lead_score: 'C',
    status: 'Future',
    owner_name: '',
    notes: null,
    last_contacted: null,
    next_follow_up: null,
    owner_id: null,
    converted_at: null
  };
};
