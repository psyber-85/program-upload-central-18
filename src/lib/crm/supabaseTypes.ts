
// Database type mappings for Supabase CRM tables
export interface DbCrmCampaign {
  id: string;
  user_id: string;
  name: string;
  objective?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbCrmLead {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  email: string;
  number: string;
  job_role: string;
  org: string;
  industry: string;
  lead_source: string;
  state: string;
  last_contacted?: string;
  next_follow_up?: string;
  potential_deal_size: number;
  confirmed_deal_size: number;
  lead_score: 'A' | 'B' | 'C' | 'D' | 'E';
  status: 'Success' | 'Lost' | 'Future';
  owner_id?: string;
  owner_name: string;
  notes?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbCrmLeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  type: 'Contacted' | 'Call' | 'Email';
  note: string;
  timestamp: string;
  user_name: string;
  created_at: string;
}
