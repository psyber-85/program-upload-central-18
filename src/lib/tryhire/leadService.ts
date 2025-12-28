import { HiringInterestPayload, SubmissionResult } from './types';

// Generate simple UUID
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Check if mailto mode is enabled (fallback)
const isMailtoMode = (): boolean => {
  // In Vite, we'd use import.meta.env but for simplicity, default to false
  return false;
};

// Generate mailto link as fallback
const generateMailtoLink = (payload: HiringInterestPayload): string => {
  const subject = encodeURIComponent(`TryHire Hiring Interest - ${payload.companyName}`);
  const body = encodeURIComponent(`
Company Name: ${payload.companyName}
Contact Person: ${payload.contactPerson}
Email: ${payload.email}
Role(s): ${payload.roles}
Headcount: ${payload.headcount}
Timeline: ${payload.timeline}
Notes: ${payload.notes || 'N/A'}
  `.trim());
  
  return `mailto:hello@theaihq.net?subject=${subject}&body=${body}`;
};

/**
 * Submit hiring interest form
 * Currently stores in memory/logs. Ready for Supabase integration.
 */
export async function submitHiringInterest(
  payload: HiringInterestPayload
): Promise<SubmissionResult> {
  // Mailto fallback mode
  if (isMailtoMode()) {
    const mailtoLink = generateMailtoLink(payload);
    window.location.href = mailtoLink;
    return { ok: true, id: 'mailto' };
  }

  try {
    // Generate ID for tracking
    const id = generateId();
    
    // TODO: Replace with Supabase insert
    // const { data, error } = await supabase
    //   .from('hiring_interest')
    //   .insert({
    //     company_name: payload.companyName,
    //     contact_person: payload.contactPerson,
    //     email: payload.email,
    //     roles: payload.roles,
    //     headcount: payload.headcount,
    //     timeline: payload.timeline,
    //     genuine_need: payload.genuineNeed,
    //     notes: payload.notes,
    //   })
    //   .select('id')
    //   .single();
    
    // For now, log to console (dev only)
    console.log('[TryHire] Hiring interest submitted:', { id, ...payload });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { ok: true, id };
  } catch (error) {
    console.error('[TryHire] Submission error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Submission failed' 
    };
  }
}
