
import { CrmCampaign, CrmLead, CrmLeadActivity } from './types';
import { mockCrmData } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCrmCampaigns = async (): Promise<CrmCampaign[]> => {
  await delay(500);
  console.log('Fetching CRM campaigns...');
  return mockCrmData.crm_campaigns;
};

export const fetchCrmLeadsByCampaign = async (crm_campaignId: string): Promise<CrmLead[]> => {
  await delay(300);
  console.log(`Fetching leads for campaign ${crm_campaignId}...`);
  return mockCrmData.crm_leads.filter(lead => lead.crm_campaignId === crm_campaignId);
};

export const saveCrmLead = async (lead: CrmLead): Promise<CrmLead> => {
  await delay(800);
  console.log('Saving CRM lead:', lead);
  
  // Simulate saving to backend
  const existingIndex = mockCrmData.crm_leads.findIndex(l => l.crm_id === lead.crm_id);
  if (existingIndex >= 0) {
    mockCrmData.crm_leads[existingIndex] = lead;
  } else {
    mockCrmData.crm_leads.push(lead);
  }
  
  return lead;
};

export const updateCrmLeadField = async (
  leadId: string, 
  field: keyof CrmLead, 
  value: any
): Promise<void> => {
  await delay(200);
  console.log(`Updating lead ${leadId} field ${field} to:`, value);
  
  const lead = mockCrmData.crm_leads.find(l => l.crm_id === leadId);
  if (lead) {
    (lead as any)[field] = value;
  }
};

export const logCrmActivity = async (
  leadId: string, 
  activity: Omit<CrmLeadActivity, 'crm_id' | 'crm_leadId'>
): Promise<CrmLeadActivity> => {
  await delay(400);
  console.log(`Logging activity for lead ${leadId}:`, activity);
  
  const newActivity: CrmLeadActivity = {
    crm_id: Date.now().toString(),
    crm_leadId: leadId,
    ...activity
  };
  
  mockCrmData.crm_lead_activities.push(newActivity);
  return newActivity;
};

export const importCrmLeadsFromSheet = async (
  file: File, 
  crm_campaignId: string
): Promise<{ imported: number; duplicates: number; errors: string[] }> => {
  await delay(1500);
  console.log(`Importing leads from ${file.name} to campaign ${crm_campaignId}...`);
  
  // This is a placeholder - actual implementation would use papaparse or xlsx
  return {
    imported: Math.floor(Math.random() * 20) + 5,
    duplicates: Math.floor(Math.random() * 3),
    errors: []
  };
};

export const fetchCrmActivitiesByLead = async (leadId: string): Promise<CrmLeadActivity[]> => {
  await delay(200);
  console.log(`Fetching activities for lead ${leadId}...`);
  return mockCrmData.crm_lead_activities.filter(activity => activity.crm_leadId === leadId);
};
