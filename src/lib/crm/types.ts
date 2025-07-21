
export interface CRMCampaign {
  crm_id: string;
  crm_name: string;
  crm_objective?: string;
  crm_startDate?: string;
  crm_endDate?: string;
  crm_notes?: string;
}

export interface CRMLead {
  crm_id: string;
  crm_campaignId: string;
  crm_name: string;
  crm_number: string;
  crm_jobRole: string;
  crm_org: string;
  crm_industry: string;
  crm_state: string;
  crm_leadSource: string;
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

export interface CRMLeadActivity {
  crm_id: string;
  crm_leadId: string;
  crm_type: 'Contacted' | 'Call' | 'Email';
  crm_note: string;
  crm_timestamp: string;
  crm_userId?: string;
  crm_userName: string;
}

export interface CRMData {
  crm_campaigns: CRMCampaign[];
  crm_leads: CRMLead[];
  crm_lead_activities: CRMLeadActivity[];
}

export const MALAYSIAN_STATES = [
  'Kuala Lumpur',
  'Selangor',
  'Johor',
  'Penang',
  'Perak',
  'Kedah',
  'Kelantan',
  'Terengganu',
  'Pahang',
  'Negeri Sembilan',
  'Melaka',
  'Sabah',
  'Sarawak',
  'Perlis',
  'Labuan',
  'Putrajaya'
];
