
import { CrmData } from './types';

export const mockCrmData: CrmData = {
  crm_campaigns: [
    {
      crm_id: '1',
      crm_name: 'Q1 2024 Enterprise Outreach',
      crm_objective: 'Target large enterprises for training partnerships',
      crm_startDate: '2024-01-01',
      crm_endDate: '2024-03-31',
      crm_notes: 'Focus on manufacturing and tech companies'
    },
    {
      crm_id: '2',
      crm_name: 'Digital Skills Initiative',
      crm_objective: 'Promote digital transformation training programs',
      crm_startDate: '2024-02-15',
      crm_endDate: '2024-05-15',
      crm_notes: 'Emphasize AI and automation training'
    },
    {
      crm_id: '3',
      crm_name: 'SME Development Program',
      crm_objective: 'Support small and medium enterprises with skills development',
      crm_startDate: '2024-03-01',
      crm_endDate: '2024-06-30',
      crm_notes: 'Focus on leadership and management training'
    }
  ],
  crm_leads: [
    {
      crm_id: '1',
      crm_campaignId: '1',
      crm_name: 'Ahmad Rahman',
      crm_email: 'ahmad.rahman@techcorp.my',
      crm_number: '+60123456789',
      crm_jobRole: 'HR Director',
      crm_org: 'TechCorp Malaysia',
      crm_industry: 'Technology',
      crm_leadSource: 'LinkedIn',
      crm_state: 'Selangor',
      crm_lastContacted: '2024-01-15T10:30:00Z',
      crm_nextFollowUp: '2024-01-22',
      crm_potentialDealSize: 150000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'A',
      crm_status: 'Future',
      crm_ownerName: 'Sarah Lee',
      crm_notes: 'Very interested in AI training programs'
    },
    {
      crm_id: '2',
      crm_campaignId: '1',
      crm_name: 'Siti Nurhaliza',
      crm_email: 'siti.n@manufacturing.my',
      crm_number: '+60187654321',
      crm_jobRole: 'Training Manager',
      crm_org: 'Malaysia Manufacturing Sdn Bhd',
      crm_industry: 'Manufacturing',
      crm_leadSource: 'Cold Call',
      crm_state: 'Johor',
      crm_lastContacted: '2024-01-10T14:15:00Z',
      crm_nextFollowUp: '2024-01-25',
      crm_potentialDealSize: 200000,
      crm_confirmedDealSize: 75000,
      crm_leadScore: 'B',
      crm_status: 'Success',
      crm_ownerName: 'John Tan',
      crm_notes: 'Confirmed partnership for Q2 programs'
    },
    {
      crm_id: '3',
      crm_campaignId: '2',
      crm_name: 'Raj Kumar',
      crm_email: 'raj.kumar@digitalhub.my',
      crm_number: '+60198765432',
      crm_jobRole: 'CEO',
      crm_org: 'Digital Hub Solutions',
      crm_industry: 'Digital Services',
      crm_leadSource: 'Referral',
      crm_state: 'Kuala Lumpur',
      crm_lastContacted: '2024-02-20T09:00:00Z',
      crm_nextFollowUp: '2024-02-27',
      crm_potentialDealSize: 300000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'A',
      crm_status: 'Future',
      crm_ownerName: 'Sarah Lee',
      crm_notes: 'Interested in comprehensive digital transformation training'
    },
    {
      crm_id: '4',
      crm_campaignId: '3',
      crm_name: 'Lim Wei Ming',
      crm_email: 'weiming@smallbiz.my',
      crm_number: '+60176543210',
      crm_jobRole: 'Owner',
      crm_org: 'Small Business Solutions',
      crm_industry: 'Consulting',
      crm_leadSource: 'Website',
      crm_state: 'Penang',
      crm_lastContacted: '2024-03-05T16:45:00Z',
      crm_nextFollowUp: '2024-03-12',
      crm_potentialDealSize: 50000,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'C',
      crm_status: 'Future',
      crm_ownerName: 'Maria Wong',
      crm_notes: 'Budget constraints but very interested'
    }
  ],
  crm_lead_activities: [
    {
      crm_id: '1',
      crm_leadId: '1',
      crm_type: 'Call',
      crm_note: 'Initial discussion about training needs',
      crm_timestamp: '2024-01-15T10:30:00Z',
      crm_userId: '1',
      crm_userName: 'Sarah Lee'
    },
    {
      crm_id: '2',
      crm_leadId: '2',
      crm_type: 'Email',
      crm_note: 'Sent proposal for manufacturing training programs',
      crm_timestamp: '2024-01-12T08:15:00Z',
      crm_userId: '2',
      crm_userName: 'John Tan'
    },
    {
      crm_id: '3',
      crm_leadId: '2',
      crm_type: 'Contacted',
      crm_note: 'Follow-up call - confirmed interest and budget',
      crm_timestamp: '2024-01-18T11:00:00Z',
      crm_userId: '2',
      crm_userName: 'John Tan'
    }
  ]
};
