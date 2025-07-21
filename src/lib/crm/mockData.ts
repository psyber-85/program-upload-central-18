
import { CRMData } from './types';

export const mockCRMData: CRMData = {
  crm_campaigns: [
    {
      crm_id: 'c1',
      crm_name: 'Q3 Enterprise Outreach',
      crm_objective: 'Target enterprise clients for Q3 sales push',
      crm_startDate: '2025-07-01',
      crm_endDate: '2025-09-30',
      crm_notes: 'Focus on tech companies with 100+ employees',
      crm_created_at: '2025-07-01T09:00:00Z',
      crm_updated_at: '2025-07-10T14:22:00Z'
    },
    {
      crm_id: 'c2',
      crm_name: 'SME Digital Transformation',
      crm_objective: 'Help SMEs adopt digital solutions',
      crm_startDate: '2025-08-01',
      crm_endDate: '2025-10-31',
      crm_notes: 'Target manufacturing and retail sectors',
      crm_created_at: '2025-08-01T10:00:00Z',
      crm_updated_at: '2025-08-01T10:00:00Z'
    }
  ],
  crm_leads: [
    {
      crm_id: 'l1',
      crm_campaignId: 'c1',
      crm_name: 'Ali Tan',
      crm_number: '+60-12-3456789',
      crm_jobRole: 'CTO',
      crm_org: 'InnoTech Solutions',
      crm_industry: 'Technology',
      crm_state: 'Selangor',
      crm_leadSource: 'LinkedIn',
      crm_lastContacted: '2025-07-20T10:00:00Z',
      crm_nextFollowUp: '2025-07-25',
      crm_potentialDealSize: 150000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'A',
      crm_status: 'Future',
      crm_ownerId: 'u1',
      crm_ownerName: 'John Doe',
      crm_notes: 'Interested in API integration solutions',
      crm_created_at: '2025-07-15T09:00:00Z',
      crm_updated_at: '2025-07-20T10:00:00Z'
    },
    {
      crm_id: 'l2',
      crm_campaignId: 'c1',
      crm_name: 'Sarah Lim',
      crm_number: '+60-19-8765432',
      crm_jobRole: 'IT Director',
      crm_org: 'MegaCorp Industries',
      crm_industry: 'Manufacturing',
      crm_state: 'Penang',
      crm_leadSource: 'Trade Show',
      crm_lastContacted: '2025-07-18T14:30:00Z',
      crm_nextFollowUp: '2025-07-28',
      crm_potentialDealSize: 200000,
      crm_confirmedDealSize: 50000,
      crm_leadScore: 'B',
      crm_status: 'Success',
      crm_ownerId: 'u2',
      crm_ownerName: 'Jane Smith',
      crm_notes: 'Signed initial contract, discussing expansion',
      crm_convertedAt: '2025-07-22T16:00:00Z',
      crm_created_at: '2025-07-12T11:00:00Z',
      crm_updated_at: '2025-07-22T16:00:00Z'
    },
    {
      crm_id: 'l3',
      crm_campaignId: 'c2',
      crm_name: 'Ahmad Rahman',
      crm_number: '+60-16-2345678',
      crm_jobRole: 'Operations Manager',
      crm_org: 'KL Retail Chain',
      crm_industry: 'Retail',
      crm_state: 'Kuala Lumpur',
      crm_leadSource: 'Cold Email',
      crm_lastContacted: '2025-08-05T09:15:00Z',
      crm_nextFollowUp: '2025-08-12',
      crm_potentialDealSize: 75000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'C',
      crm_status: 'Future',
      crm_ownerId: 'u1',
      crm_ownerName: 'John Doe',
      crm_notes: 'Interested in inventory management system',
      crm_created_at: '2025-08-01T08:00:00Z',
      crm_updated_at: '2025-08-05T09:15:00Z'
    }
  ],
  crm_lead_activities: [
    {
      crm_id: 'a1',
      crm_leadId: 'l1',
      crm_type: 'Contacted',
      crm_note: 'Initial discovery call - discussed current tech stack',
      crm_timestamp: '2025-07-20T10:00:00Z',
      crm_userId: 'u1',
      crm_userName: 'John Doe'
    },
    {
      crm_id: 'a2',
      crm_leadId: 'l1',
      crm_type: 'Email',
      crm_note: 'Sent technical proposal and pricing details',
      crm_timestamp: '2025-07-21T15:30:00Z',
      crm_userId: 'u1',
      crm_userName: 'John Doe'
    },
    {
      crm_id: 'a3',
      crm_leadId: 'l2',
      crm_type: 'Meeting',
      crm_note: 'Demo presentation - very positive feedback',
      crm_timestamp: '2025-07-18T14:30:00Z',
      crm_userId: 'u2',
      crm_userName: 'Jane Smith'
    },
    {
      crm_id: 'a4',
      crm_leadId: 'l2',
      crm_type: 'Contract',
      crm_note: 'Signed initial contract for Phase 1',
      crm_timestamp: '2025-07-22T16:00:00Z',
      crm_userId: 'u2',
      crm_userName: 'Jane Smith'
    }
  ]
};
