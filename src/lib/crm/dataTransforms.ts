
import { CrmCampaign, CrmLead, CrmLeadActivity } from './types';
import { DbCrmCampaign, DbCrmLead, DbCrmLeadActivity } from './supabaseTypes';

// Transform database records to frontend types
export const transformDbCampaign = (dbCampaign: DbCrmCampaign): CrmCampaign => ({
  crm_id: dbCampaign.id,
  crm_name: dbCampaign.name,
  crm_objective: dbCampaign.objective,
  crm_startDate: dbCampaign.start_date,
  crm_endDate: dbCampaign.end_date,
  crm_notes: dbCampaign.notes,
});

export const transformDbLead = (dbLead: DbCrmLead): CrmLead => ({
  crm_id: dbLead.id,
  crm_campaignId: dbLead.campaign_id,
  crm_name: dbLead.name,
  crm_email: dbLead.email,
  crm_number: dbLead.number,
  crm_jobRole: dbLead.job_role,
  crm_org: dbLead.org,
  crm_industry: dbLead.industry,
  crm_leadSource: dbLead.lead_source,
  crm_state: dbLead.state,
  crm_lastContacted: dbLead.last_contacted,
  crm_nextFollowUp: dbLead.next_follow_up,
  crm_potentialDealSize: Number(dbLead.potential_deal_size),
  crm_confirmedDealSize: Number(dbLead.confirmed_deal_size),
  crm_leadScore: dbLead.lead_score,
  crm_status: dbLead.status,
  crm_ownerId: dbLead.owner_id,
  crm_ownerName: dbLead.owner_name,
  crm_notes: dbLead.notes,
  crm_convertedAt: dbLead.converted_at,
});

export const transformDbActivity = (dbActivity: DbCrmLeadActivity): CrmLeadActivity => ({
  crm_id: dbActivity.id,
  crm_leadId: dbActivity.lead_id,
  crm_type: dbActivity.type,
  crm_note: dbActivity.note,
  crm_timestamp: dbActivity.timestamp,
  crm_userId: dbActivity.user_id,
  crm_userName: dbActivity.user_name,
});

// Transform frontend types to database records
export const transformCampaignForDb = (campaign: Omit<CrmCampaign, 'crm_id'>, userId: string): Omit<DbCrmCampaign, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  name: campaign.crm_name,
  objective: campaign.crm_objective || null,
  start_date: campaign.crm_startDate || null,
  end_date: campaign.crm_endDate || null,
  notes: campaign.crm_notes || null,
});

export const transformLeadForDb = (lead: Omit<CrmLead, 'crm_id'>, userId: string): Omit<DbCrmLead, 'id' | 'created_at' | 'updated_at'> => ({
  campaign_id: lead.crm_campaignId,
  user_id: userId,
  name: lead.crm_name,
  email: lead.crm_email,
  number: lead.crm_number || '',
  job_role: lead.crm_jobRole || '',
  org: lead.crm_org || '',
  industry: lead.crm_industry || '',
  lead_source: lead.crm_leadSource || '',
  state: lead.crm_state || '',
  last_contacted: lead.crm_lastContacted || null,
  next_follow_up: lead.crm_nextFollowUp || null,
  potential_deal_size: lead.crm_potentialDealSize,
  confirmed_deal_size: lead.crm_confirmedDealSize,
  lead_score: lead.crm_leadScore || 'B',
  status: lead.crm_status || 'Future',
  owner_id: lead.crm_ownerId || null,
  owner_name: lead.crm_ownerName || '',
  notes: lead.crm_notes || null,
  converted_at: lead.crm_convertedAt || null,
});

export const transformActivityForDb = (activity: Omit<CrmLeadActivity, 'crm_id' | 'crm_leadId'>, leadId: string, userId: string): Omit<DbCrmLeadActivity, 'id' | 'created_at'> => ({
  lead_id: leadId,
  user_id: userId,
  type: activity.crm_type,
  note: activity.crm_note,
  timestamp: activity.crm_timestamp,
  user_name: activity.crm_userName,
});
