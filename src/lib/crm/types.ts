
export interface CrmCampaign {
  crm_id: string;
  crm_name: string;
  crm_objective?: string;
  crm_startDate?: string;
  crm_endDate?: string;
  crm_notes?: string;
}

export interface CrmLead {
  crm_id: string;
  crm_campaignId: string;
  crm_name: string;
  crm_email: string;
  crm_number: string;
  crm_jobRole: string;
  crm_org: string;
  crm_industry: string;
  crm_leadSource: string;
  crm_state: string;
  crm_lastContacted?: string;
  crm_nextFollowUp?: string;
  crm_potentialDealSize: number;
  crm_confirmedDealSize: number;
  crm_leadScore: 'A' | 'B' | 'C' | 'D' | 'E';
  crm_status: 'Success' | 'Lost' | 'Future';
  crm_ownerId?: string;
  crm_ownerName: string;
  crm_notes?: string;
  crm_convertedAt?: string;
}

export interface CrmLeadActivity {
  crm_id: string;
  crm_leadId: string;
  crm_type: 'Contacted' | 'Call' | 'Email';
  crm_note: string;
  crm_timestamp: string;
  crm_userId: string;
  crm_userName: string;
}

export interface CrmData {
  crm_campaigns: CrmCampaign[];
  crm_leads: CrmLead[];
  crm_lead_activities: CrmLeadActivity[];
}

export const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
];

export const LEAD_SCORES = ['A', 'B', 'C', 'D', 'E'] as const;
export const LEAD_STATUSES = ['Success', 'Lost', 'Future'] as const;
export const ACTIVITY_TYPES = ['Contacted', 'Call', 'Email'] as const;
