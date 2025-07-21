
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { mockCRMData } from './mockData';

// Simulate async operations with setTimeout
const simulateAsync = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const fetchCrmCampaigns = async (): Promise<CRMCampaign[]> => {
  return simulateAsync(mockCRMData.crm_campaigns);
};

export const fetchCrmLeadsByCampaign = async (crm_campaignId: string): Promise<CRMLead[]> => {
  const filteredLeads = mockCRMData.crm_leads.filter(
    lead => lead.crm_campaignId === crm_campaignId
  );
  return simulateAsync(filteredLeads);
};

export const saveCrmLead = async (lead: Omit<CRMLead, 'crm_id' | 'crm_created_at' | 'crm_updated_at'>): Promise<CRMLead> => {
  const newLead: CRMLead = {
    ...lead,
    crm_id: `l${Date.now()}`,
    crm_created_at: new Date().toISOString(),
    crm_updated_at: new Date().toISOString()
  };
  
  mockCRMData.crm_leads.push(newLead);
  return simulateAsync(newLead);
};

export const updateCrmLeadField = async (
  leadId: string, 
  field: keyof CRMLead, 
  value: any
): Promise<CRMLead | null> => {
  const leadIndex = mockCRMData.crm_leads.findIndex(lead => lead.crm_id === leadId);
  if (leadIndex === -1) return null;
  
  mockCRMData.crm_leads[leadIndex] = {
    ...mockCRMData.crm_leads[leadIndex],
    [field]: value,
    crm_updated_at: new Date().toISOString()
  };
  
  return simulateAsync(mockCRMData.crm_leads[leadIndex]);
};

export const logCrmActivity = async (
  leadId: string, 
  activity: Omit<CRMLeadActivity, 'crm_id' | 'crm_leadId'>
): Promise<CRMLeadActivity> => {
  const newActivity: CRMLeadActivity = {
    ...activity,
    crm_id: `a${Date.now()}`,
    crm_leadId: leadId
  };
  
  mockCRMData.crm_lead_activities.push(newActivity);
  return simulateAsync(newActivity);
};

export const fetchCrmLeadActivities = async (leadId: string): Promise<CRMLeadActivity[]> => {
  const activities = mockCRMData.crm_lead_activities.filter(
    activity => activity.crm_leadId === leadId
  );
  return simulateAsync(activities);
};

export const saveCrmCampaign = async (
  campaign: Omit<CRMCampaign, 'crm_id' | 'crm_created_at' | 'crm_updated_at'>
): Promise<CRMCampaign> => {
  const newCampaign: CRMCampaign = {
    ...campaign,
    crm_id: `c${Date.now()}`,
    crm_created_at: new Date().toISOString(),
    crm_updated_at: new Date().toISOString()
  };
  
  mockCRMData.crm_campaigns.push(newCampaign);
  return simulateAsync(newCampaign);
};

export const importCrmLeadsFromSheet = async (
  file: File, 
  crm_campaignId: string
): Promise<{ imported: number; errors: string[] }> => {
  // Placeholder for sheet import functionality
  // This would typically parse CSV/XLSX and validate data
  return simulateAsync({ imported: 0, errors: ['Sheet import not implemented yet'] }, 1000);
};
