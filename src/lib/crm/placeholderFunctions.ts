
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { mockCRMData } from './mockData';

export const fetchCrmCampaigns = async (): Promise<CRMCampaign[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCRMData.crm_campaigns);
    }, 300);
  });
};

export const fetchCrmLeadsByCampaign = async (crm_campaignId: string): Promise<CRMLead[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = mockCRMData.crm_leads.filter(lead => lead.crm_campaignId === crm_campaignId);
      resolve(leads);
    }, 300);
  });
};

export const saveCrmLead = async (lead: Partial<CRMLead>): Promise<CRMLead> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLead: CRMLead = {
        crm_id: Date.now().toString(),
        crm_campaignId: lead.crm_campaignId || '1',
        crm_name: lead.crm_name || '',
        crm_number: lead.crm_number || '',
        crm_jobRole: lead.crm_jobRole || '',
        crm_org: lead.crm_org || '',
        crm_industry: lead.crm_industry || '',
        crm_state: lead.crm_state || 'Kuala Lumpur',
        crm_leadSource: lead.crm_leadSource || '',
        crm_lastContacted: lead.crm_lastContacted,
        crm_nextFollowUp: lead.crm_nextFollowUp,
        crm_potentialDealSize: lead.crm_potentialDealSize || 0,
        crm_confirmedDealSize: lead.crm_confirmedDealSize || 0,
        crm_leadScore: lead.crm_leadScore || 'C',
        crm_status: lead.crm_status || 'Future',
        crm_ownerName: lead.crm_ownerName || '',
        crm_notes: lead.crm_notes
      };
      mockCRMData.crm_leads.push(newLead);
      resolve(newLead);
    }, 500);
  });
};

export const updateCrmLeadField = async (leadId: string, field: string, value: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leadIndex = mockCRMData.crm_leads.findIndex(lead => lead.crm_id === leadId);
      if (leadIndex !== -1) {
        (mockCRMData.crm_leads[leadIndex] as any)[field] = value;
      }
      resolve();
    }, 200);
  });
};

export const logCrmActivity = async (leadId: string, activity: Partial<CRMLeadActivity>): Promise<CRMLeadActivity> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newActivity: CRMLeadActivity = {
        crm_id: Date.now().toString(),
        crm_leadId: leadId,
        crm_type: activity.crm_type || 'Contacted',
        crm_note: activity.crm_note || '',
        crm_timestamp: new Date().toISOString(),
        crm_userName: activity.crm_userName || 'Current User'
      };
      mockCRMData.crm_lead_activities.push(newActivity);
      resolve(newActivity);
    }, 300);
  });
};

export const importCrmLeadsFromSheet = async (file: File, crm_campaignId: string): Promise<CRMLead[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is a placeholder - in real implementation, this would parse the file
      const importedLeads: CRMLead[] = [];
      resolve(importedLeads);
    }, 1000);
  });
};
