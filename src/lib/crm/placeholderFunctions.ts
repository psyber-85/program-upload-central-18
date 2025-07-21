
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { mockCRMData } from './mockData';

// Simulate async operations with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCrmCampaigns = async (): Promise<CRMCampaign[]> => {
  await delay(500);
  return mockCRMData.crm_campaigns;
};

export const fetchCrmLeadsByCampaign = async (crm_campaignId: string): Promise<CRMLead[]> => {
  await delay(300);
  return mockCRMData.crm_leads.filter(lead => lead.crm_campaignId === crm_campaignId);
};

export const saveCrmLead = async (lead: Omit<CRMLead, 'crm_id' | 'crm_created_at' | 'crm_updated_at'>): Promise<CRMLead> => {
  await delay(800);
  const newLead: CRMLead = {
    ...lead,
    crm_id: Date.now().toString(),
    crm_created_at: new Date().toISOString(),
    crm_updated_at: new Date().toISOString()
  };
  
  // Add to mock data
  mockCRMData.crm_leads.push(newLead);
  return newLead;
};

export const updateCrmLeadField = async (leadId: string, field: keyof CRMLead, value: any): Promise<void> => {
  await delay(200);
  const leadIndex = mockCRMData.crm_leads.findIndex(lead => lead.crm_id === leadId);
  if (leadIndex !== -1) {
    mockCRMData.crm_leads[leadIndex] = {
      ...mockCRMData.crm_leads[leadIndex],
      [field]: value,
      crm_updated_at: new Date().toISOString()
    };
  }
};

export const logCrmActivity = async (leadId: string, activity: Omit<CRMLeadActivity, 'crm_id' | 'crm_leadId'>): Promise<CRMLeadActivity> => {
  await delay(300);
  const newActivity: CRMLeadActivity = {
    ...activity,
    crm_id: Date.now().toString(),
    crm_leadId: leadId
  };
  
  // Add to mock data
  mockCRMData.crm_lead_activities.push(newActivity);
  return newActivity;
};

export const fetchCrmActivitiesByLead = async (leadId: string): Promise<CRMLeadActivity[]> => {
  await delay(200);
  return mockCRMData.crm_lead_activities.filter(activity => activity.crm_leadId === leadId);
};

export const createCrmCampaign = async (campaign: Omit<CRMCampaign, 'crm_id' | 'crm_created_at' | 'crm_updated_at'>): Promise<CRMCampaign> => {
  await delay(600);
  const newCampaign: CRMCampaign = {
    ...campaign,
    crm_id: Date.now().toString(),
    crm_created_at: new Date().toISOString(),
    crm_updated_at: new Date().toISOString()
  };
  
  // Add to mock data
  mockCRMData.crm_campaigns.push(newCampaign);
  return newCampaign;
};

export const importCrmLeadsFromSheet = async (file: File, crm_campaignId: string): Promise<{ imported: number; duplicates: number }> => {
  await delay(2000); // Simulate file processing time
  
  // This would normally parse the file and extract leads
  // For now, simulate importing 2 leads with 1 duplicate
  const mockImportResult = {
    imported: 2,
    duplicates: 1
  };
  
  return mockImportResult;
};
