
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProspectInsert = Database['public']['Tables']['prospects']['Insert'];
type ProspectUpdate = Database['public']['Tables']['prospects']['Update'];
type ProspectRow = Database['public']['Tables']['prospects']['Row'];
type ProgramRow = Database['public']['Tables']['programs']['Row'];
type HRContactInsert = Database['public']['Tables']['hr_contacts']['Insert'];
type CallInsert = Database['public']['Tables']['prospect_calls']['Insert'];

// Product ID to Program Title translation mapping
const PRODUCT_ID_TRANSLATIONS: Record<string, string> = {
  'business-writing-ai': 'Business Writing with AI: 2-Day Masterclass',
  'ai-ready-leader': 'The AI-Ready Leader: Win the Future with Strategic Action',
  'chatgpt-skill-boost': 'ChatGPT Skill Boost (Intermediate)',
  'ai-chatgpt-hr': 'AI and ChatGPT for HR Professionals - 2 Day Masterclass'
};

// Function to normalize payment values
const normalizePayment = (payment: string): string | null => {
  if (!payment || payment.trim() === '') return null;
  
  const normalized = payment.toLowerCase().trim();
  
  switch (normalized) {
    case 'hrdc':
    case 'hrdf':
    case 'human resource development corporation':
      return 'HRDC';
    case 'individual':
    case 'self':
    case 'personal':
    case 'private':
      return 'Individual';
    default:
      return payment;
  }
};

export const supabaseProspectService = {
  // Programs
  async getPrograms() {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('title');
    
    return { data, error };
  },

  // Prospects
  async getProspects() {
    const { data, error } = await supabase
      .from('prospects')
      .select(`
        *,
        prospect_calls(*),
        hr_contacts(*)
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async addProspect(prospectData: {
    program_id: string;
    name: string;
    email: string;
    phone?: string | null;
    org?: string | null;
    role?: string | null;
    payment_status?: string | null;
    product_type?: string | null;
    product_id?: string | null;
    registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  }) {
    const insertData: ProspectInsert = {
      program_id: prospectData.program_id,
      name: prospectData.name,
      email: prospectData.email,
      phone: prospectData.phone,
      org: prospectData.org,
      role: prospectData.role,
      payment_status: normalizePayment(prospectData.payment_status || ''),
      product_type: prospectData.product_type,
      product_id: prospectData.product_id,
      registration_status: prospectData.registration_status
    };

    const { data, error } = await supabase
      .from('prospects')
      .insert(insertData)
      .select();
    
    return { data, error };
  },

  async updateProspectStatus(prospectId: string, status: string, reason?: string) {
    const { error } = await supabase
      .from('prospects')
      .update({
        registration_status: status,
        status_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', prospectId);
    
    return { error };
  },

  // Calls
  async addCall(prospectId: string, callData: { call_date: string; notes?: string }) {
    const insertData: CallInsert = {
      prospect_id: prospectId,
      call_date: callData.call_date,
      notes: callData.notes || null
    };

    const { data, error } = await supabase
      .from('prospect_calls')
      .insert(insertData)
      .select();
    
    return { data, error };
  },

  async getCallsForProspect(prospectId: string) {
    const { data, error } = await supabase
      .from('prospect_calls')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('call_date', { ascending: false });
    
    return { data, error };
  },

  // HR Contacts
  async addHRContact(prospectId: string, hrData: { name: string; email: string; phone?: string }) {
    // First, remove existing HR contact for this prospect
    await supabase
      .from('hr_contacts')
      .delete()
      .eq('prospect_id', prospectId);
    
    const insertData: HRContactInsert = {
      prospect_id: prospectId,
      name: hrData.name,
      email: hrData.email,
      phone: hrData.phone || null
    };

    const { data, error } = await supabase
      .from('hr_contacts')
      .insert(insertData)
      .select();
    
    return { data, error };
  },

  async notifyHR(prospectId: string) {
    const { error } = await supabase
      .from('hr_contacts')
      .update({
        email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('prospect_id', prospectId);
    
    return { error };
  },

  // Bulk upload
  async bulkUploadProspects(prospects: Array<{
    program_id: string;
    name: string;
    email: string;
    phone?: string | null;
    org?: string | null;
    role?: string | null;
    payment_status?: string | null;
    product_type?: string | null;
    product_id?: string | null;
    registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  }>) {
    const prospectsToInsert: ProspectInsert[] = prospects.map(prospect => ({
      program_id: prospect.program_id,
      name: prospect.name,
      email: prospect.email,
      phone: prospect.phone,
      org: prospect.org,
      role: prospect.role,
      payment_status: normalizePayment(prospect.payment_status || ''),
      product_type: prospect.product_type,
      product_id: prospect.product_id,
      registration_status: prospect.registration_status
    }));

    const { data, error } = await supabase
      .from('prospects')
      .insert(prospectsToInsert)
      .select();
    
    return { data, error };
  },

  // Program summary data
  async getProgramSummary() {
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*');
    
    if (programsError) return { data: null, error: programsError };

    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select('program_id, registration_status');
    
    if (prospectsError) return { data: null, error: prospectsError };

    const summary = programs?.map(program => {
      const programProspects = prospects?.filter(p => p.program_id === program.id) || [];
      return {
        program_title: program.title,
        total_prospects: programProspects.length,
        approved: programProspects.filter(p => p.registration_status === 'Approved').length,
        pending: programProspects.filter(p => p.registration_status === 'Pending').length,
        rejected: programProspects.filter(p => p.registration_status === 'Rejected').length,
        postponed: programProspects.filter(p => p.registration_status === 'Postponed').length,
        on_hold: programProspects.filter(p => p.registration_status === 'On Hold').length
      };
    });
    
    return { data: summary, error: null };
  },

  // Helper function to translate product_id to program title
  translateProductId: (productId: string): string => {
    return PRODUCT_ID_TRANSLATIONS[productId] || productId;
  }
};
