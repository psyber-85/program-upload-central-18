
export interface CRMCampaign {
  crm_id: string;
  crm_name: string;
  crm_objective?: string;
  crm_startDate?: string;
  crm_endDate?: string;
  crm_notes?: string;
  crm_created_at: string;
  crm_updated_at: string;
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
  crm_ownerId: string;
  crm_ownerName: string;
  crm_notes?: string;
  crm_convertedAt?: string;
  crm_created_at: string;
  crm_updated_at: string;
}

export interface CRMLeadActivity {
  crm_id: string;
  crm_leadId: string;
  crm_type: string;
  crm_note: string;
  crm_timestamp: string;
  crm_userId: string;
  crm_userName: string;
}

export interface CRMData {
  crm_campaigns: CRMCampaign[];
  crm_leads: CRMLead[];
  crm_lead_activities: CRMLeadActivity[];
}

export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya'
];

export const LEAD_SCORES = ['A', 'B', 'C', 'D', 'E'] as const;
export const LEAD_STATUSES = ['Success', 'Lost', 'Future'] as const;
