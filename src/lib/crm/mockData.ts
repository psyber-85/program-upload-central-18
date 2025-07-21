
import { CRMCampaign, CRMLead, CRMLeadActivity, CRMData } from './types';

export const mockCRMData: CRMData = {
  crm_campaigns: [
    {
      crm_id: '1',
      crm_name: 'Q1 2024 Lead Generation',
      crm_objective: 'Generate 100 qualified leads for our training programs',
      crm_startDate: '2024-01-01',
      crm_endDate: '2024-03-31',
      crm_notes: 'Focus on SMEs in Selangor and KL',
      crm_created_at: '2024-01-01T08:00:00Z',
      crm_updated_at: '2024-01-15T10:30:00Z'
    },
    {
      crm_id: '2',
      crm_name: 'Digital Transformation Outreach',
      crm_objective: 'Target companies looking to digitize their operations',
      crm_startDate: '2024-02-01',
      crm_endDate: '2024-05-31',
      crm_notes: 'Focus on manufacturing and retail sectors',
      crm_created_at: '2024-02-01T09:00:00Z',
      crm_updated_at: '2024-02-10T14:20:00Z'
    }
  ],
  crm_leads: [
    {
      crm_id: '1',
      crm_campaignId: '1',
      crm_name: 'Ahmad Rahman',
      crm_number: '+60123456789',
      crm_jobRole: 'HR Manager',
      crm_org: 'Tech Solutions Sdn Bhd',
      crm_industry: 'Technology',
      crm_state: 'Selangor',
      crm_leadSource: 'LinkedIn',
      crm_lastContacted: '2024-01-15T10:30:00Z',
      crm_nextFollowUp: '2024-01-22',
      crm_potentialDealSize: 25000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'A',
      crm_status: 'Future',
      crm_ownerId: 'user1',
      crm_ownerName: 'Sarah Lee',
      crm_notes: 'Very interested in leadership training program',
      crm_created_at: '2024-01-10T08:00:00Z',
      crm_updated_at: '2024-01-15T10:30:00Z'
    },
    {
      crm_id: '2',
      crm_campaignId: '1',
      crm_name: 'Siti Nurhaliza',
      crm_number: '+60187654321',
      crm_jobRole: 'Training Coordinator',
      crm_org: 'Manufacturing Plus',
      crm_industry: 'Manufacturing',
      crm_state: 'Johor',
      crm_leadSource: 'Email Campaign',
      crm_lastContacted: '2024-01-20T14:00:00Z',
      crm_nextFollowUp: '2024-01-25',
      crm_potentialDealSize: 45000,
      crm_confirmedDealSize: 45000,
      crm_leadScore: 'A',
      crm_status: 'Success',
      crm_ownerId: 'user2',
      crm_ownerName: 'Michael Tan',
      crm_notes: 'Confirmed booking for technical skills training',
      crm_convertedAt: '2024-01-20T16:00:00Z',
      crm_created_at: '2024-01-08T09:00:00Z',
      crm_updated_at: '2024-01-20T16:00:00Z'
    },
    {
      crm_id: '3',
      crm_campaignId: '2',
      crm_name: 'David Lim',
      crm_number: '+60162345678',
      crm_jobRole: 'IT Director',
      crm_org: 'Retail Chain Malaysia',
      crm_industry: 'Retail',
      crm_state: 'Kuala Lumpur',
      crm_leadSource: 'Referral',
      crm_lastContacted: '2024-02-05T11:30:00Z',
      crm_nextFollowUp: '2024-02-12',
      crm_potentialDealSize: 60000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'B',
      crm_status: 'Future',
      crm_ownerId: 'user1',
      crm_ownerName: 'Sarah Lee',
      crm_notes: 'Interested in digital transformation workshop',
      crm_created_at: '2024-02-01T08:30:00Z',
      crm_updated_at: '2024-02-05T11:30:00Z'
    }
  ],
  crm_lead_activities: [
    {
      crm_id: '1',
      crm_leadId: '1',
      crm_type: 'Contacted',
      crm_note: 'Initial contact via LinkedIn message',
      crm_timestamp: '2024-01-10T09:00:00Z',
      crm_userId: 'user1',
      crm_userName: 'Sarah Lee'
    },
    {
      crm_id: '2',
      crm_leadId: '1',
      crm_type: 'Call',
      crm_note: 'Follow-up call to discuss training needs',
      crm_timestamp: '2024-01-15T10:30:00Z',
      crm_userId: 'user1',
      crm_userName: 'Sarah Lee'
    },
    {
      crm_id: '3',
      crm_leadId: '2',
      crm_type: 'Email',
      crm_note: 'Sent training program brochure',
      crm_timestamp: '2024-01-18T14:00:00Z',
      crm_userId: 'user2',
      crm_userName: 'Michael Tan'
    },
    {
      crm_id: '4',
      crm_leadId: '2',
      crm_type: 'Meeting',
      crm_note: 'Face-to-face meeting to finalize training details',
      crm_timestamp: '2024-01-20T14:00:00Z',
      crm_userId: 'user2',
      crm_userName: 'Michael Tan'
    }
  ]
};
