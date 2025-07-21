
import { CRMData, CRMCampaign, CRMLead, CRMLeadActivity } from './types';

export const mockCampaigns: CRMCampaign[] = [
  {
    crm_id: '1',
    crm_name: 'AI Training Q1 2024',
    crm_objective: 'Promote AI training programs to corporate clients',
    crm_startDate: '2024-01-01',
    crm_endDate: '2024-03-31',
    crm_notes: 'Focus on large corporations and government agencies'
  },
  {
    crm_id: '2',
    crm_name: 'Leadership Development',
    crm_objective: 'Target senior management for leadership programs',
    crm_startDate: '2024-02-01',
    crm_endDate: '2024-05-31',
    crm_notes: 'Premium pricing strategy'
  }
];

export const mockLeads: CRMLead[] = [
  {
    crm_id: '1',
    crm_campaignId: '1',
    crm_name: 'Ahmad Rahman',
    crm_number: '+60123456789',
    crm_jobRole: 'HR Director',
    crm_org: 'Tech Malaysia Sdn Bhd',
    crm_industry: 'Technology',
    crm_state: 'Kuala Lumpur',
    crm_leadSource: 'LinkedIn',
    crm_lastContacted: '2024-01-15T10:30:00Z',
    crm_nextFollowUp: '2024-01-25',
    crm_potentialDealSize: 50000,
    crm_confirmedDealSize: 0,
    crm_leadScore: 'A',
    crm_status: 'Future',
    crm_ownerName: 'Sarah Lee',
    crm_notes: 'Very interested in AI training for their development team'
  },
  {
    crm_id: '2',
    crm_campaignId: '1',
    crm_name: 'Siti Nurhaliza',
    crm_number: '+60187654321',
    crm_jobRole: 'Learning & Development Manager',
    crm_org: 'Bank Rakyat',
    crm_industry: 'Banking',
    crm_state: 'Selangor',
    crm_leadSource: 'Email Campaign',
    crm_lastContacted: '2024-01-20T14:15:00Z',
    crm_nextFollowUp: '2024-02-01',
    crm_potentialDealSize: 75000,
    crm_confirmedDealSize: 75000,
    crm_leadScore: 'A',
    crm_status: 'Success',
    crm_ownerName: 'John Tan',
    crm_notes: 'Signed contract for comprehensive AI training program',
    crm_convertedAt: '2024-01-22T09:00:00Z'
  },
  {
    crm_id: '3',
    crm_campaignId: '2',
    crm_name: 'Robert Chen',
    crm_number: '+60162345678',
    crm_jobRole: 'CEO',
    crm_org: 'Global Logistics Sdn Bhd',
    crm_industry: 'Logistics',
    crm_state: 'Johor',
    crm_leadSource: 'Referral',
    crm_lastContacted: '2024-02-05T11:00:00Z',
    crm_nextFollowUp: '2024-02-15',
    crm_potentialDealSize: 100000,
    crm_confirmedDealSize: 0,
    crm_leadScore: 'B',
    crm_status: 'Future',
    crm_ownerName: 'Sarah Lee',
    crm_notes: 'Interested in leadership development for senior management team'
  }
];

export const mockActivities: CRMLeadActivity[] = [
  {
    crm_id: '1',
    crm_leadId: '1',
    crm_type: 'Call',
    crm_note: 'Initial discovery call, very positive response',
    crm_timestamp: '2024-01-15T10:30:00Z',
    crm_userName: 'Sarah Lee'
  },
  {
    crm_id: '2',
    crm_leadId: '2',
    crm_type: 'Email',
    crm_note: 'Sent proposal and pricing information',
    crm_timestamp: '2024-01-20T14:15:00Z',
    crm_userName: 'John Tan'
  },
  {
    crm_id: '3',
    crm_leadId: '2',
    crm_type: 'Call',
    crm_note: 'Contract negotiation and final terms discussion',
    crm_timestamp: '2024-01-22T09:00:00Z',
    crm_userName: 'John Tan'
  }
];

export const mockCRMData: CRMData = {
  crm_campaigns: mockCampaigns,
  crm_leads: mockLeads,
  crm_lead_activities: mockActivities
};
