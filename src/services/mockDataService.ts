
// Mock data service for registration tracker
export interface MockProgram {
  id: string;
  title: string;
}

export interface MockProspect {
  id: string;
  program_id: string;
  name: string;
  email: string;
  phone: string | null;
  org: string | null;
  role: string | null;
  payment_status: string | null;
  product_type: string | null;
  registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  status_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockHRContact {
  id: string;
  prospect_id: string;
  name: string;
  email: string;
  phone?: string | null;
  email_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockCall {
  id: string;
  prospect_id: string;
  call_date: string;
  notes?: string | null;
  created_at: string;
}

// Mock programs data
const mockPrograms: MockProgram[] = [
  {
    id: 'prog-1',
    title: 'Business Writing with AI: 2-Day Masterclass'
  },
  {
    id: 'prog-2',
    title: 'The AI-Ready Leader: Win the Future with Strategic Action'
  },
  {
    id: 'prog-3',
    title: 'ChatGPT Skill Boost (Intermediate)'
  },
  {
    id: 'prog-4',
    title: 'AI and ChatGPT for HR Professionals - 2 Day Masterclass'
  }
];

// Mock prospects data
let mockProspects: MockProspect[] = [
  {
    id: 'prospect-1',
    program_id: 'prog-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1234567890',
    org: 'Tech Corp',
    role: 'Marketing Manager',
    payment_status: 'HRDC',
    product_type: 'masterclass',
    registration_status: 'Approved',
    status_reason: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'prospect-2',
    program_id: 'prog-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@business.com',
    phone: '+1234567891',
    org: 'Business Solutions',
    role: 'HR Director',
    payment_status: 'Individual',
    product_type: 'masterclass',
    registration_status: 'Pending',
    status_reason: null,
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'prospect-3',
    program_id: 'prog-3',
    name: 'Mike Davis',
    email: 'mike.davis@startup.com',
    phone: '+1234567892',
    org: 'Innovation Startup',
    role: 'CEO',
    payment_status: 'Paid',
    product_type: 'masterclass',
    registration_status: 'Rejected',
    status_reason: 'Program capacity exceeded',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T16:45:00Z'
  },
  {
    id: 'prospect-4',
    program_id: 'prog-4',
    name: 'Lisa Chen',
    email: 'lisa.chen@enterprise.com',
    phone: null,
    org: 'Enterprise Solutions',
    role: 'Learning & Development Manager',
    payment_status: 'Pending',
    product_type: 'masterclass',
    registration_status: 'On Hold',
    status_reason: 'Waiting for budget approval',
    created_at: '2024-01-18T11:20:00Z',
    updated_at: '2024-01-18T11:20:00Z'
  },
  {
    id: 'prospect-5',
    program_id: 'prog-1',
    name: 'David Wilson',
    email: 'david.wilson@consulting.com',
    phone: '+1234567893',
    org: 'Wilson Consulting',
    role: 'Senior Consultant',
    payment_status: 'HRDC',
    product_type: 'masterclass',
    registration_status: 'Postponed',
    status_reason: 'Requested to move to next batch',
    created_at: '2024-01-19T13:45:00Z',
    updated_at: '2024-01-19T13:45:00Z'
  }
];

// Mock HR contacts data
let mockHRContacts: MockHRContact[] = [
  {
    id: 'hr-1',
    prospect_id: 'prospect-1',
    name: 'Jane HR Manager',
    email: 'jane.hr@company.com',
    phone: '+1234567894',
    email_sent_at: '2024-01-16T10:30:00Z',
    created_at: '2024-01-15T15:00:00Z',
    updated_at: '2024-01-16T10:30:00Z'
  },
  {
    id: 'hr-2',
    prospect_id: 'prospect-2',
    name: 'Bob HR Director',
    email: 'bob.hr@business.com',
    phone: '+1234567895',
    email_sent_at: null,
    created_at: '2024-01-16T16:00:00Z',
    updated_at: '2024-01-16T16:00:00Z'
  }
];

// Mock calls data
let mockCalls: MockCall[] = [
  {
    id: 'call-1',
    prospect_id: 'prospect-1',
    call_date: '2024-01-15T14:00:00Z',
    notes: 'Initial contact made. Very interested in the program.',
    created_at: '2024-01-15T14:00:00Z'
  },
  {
    id: 'call-2',
    prospect_id: 'prospect-1',
    call_date: '2024-01-18T10:00:00Z',
    notes: 'Follow-up call. Confirmed attendance.',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: 'call-3',
    prospect_id: 'prospect-3',
    call_date: '2024-01-17T15:30:00Z',
    notes: 'Discussed program details and requirements.',
    created_at: '2024-01-17T15:30:00Z'
  }
];

// Utility function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockDataService = {
  // Programs
  async getPrograms() {
    await delay(200);
    return { data: mockPrograms, error: null };
  },

  // Prospects
  async getProspects() {
    await delay(300);
    // Include related data like calls and HR contacts
    const prospectsWithRelations = mockProspects.map(prospect => ({
      ...prospect,
      prospect_calls: mockCalls.filter(call => call.prospect_id === prospect.id),
      hr_contacts: mockHRContacts.filter(hr => hr.prospect_id === prospect.id)
    }));
    return { data: prospectsWithRelations, error: null };
  },

  async addProspect(prospectData: Omit<MockProspect, 'id' | 'created_at' | 'updated_at'>) {
    await delay(500);
    const newProspect: MockProspect = {
      ...prospectData,
      id: `prospect-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProspects.push(newProspect);
    return { data: [newProspect], error: null };
  },

  async updateProspectStatus(prospectId: string, status: string, reason?: string) {
    await delay(300);
    const prospect = mockProspects.find(p => p.id === prospectId);
    if (prospect) {
      prospect.registration_status = status as MockProspect['registration_status'];
      prospect.status_reason = reason || null;
      prospect.updated_at = new Date().toISOString();
    }
    return { error: null };
  },

  // Calls
  async addCall(prospectId: string, callData: { call_date: string; notes?: string }) {
    await delay(400);
    const newCall: MockCall = {
      id: `call-${Date.now()}`,
      prospect_id: prospectId,
      call_date: callData.call_date,
      notes: callData.notes || null,
      created_at: new Date().toISOString()
    };
    mockCalls.push(newCall);
    return { data: [newCall], error: null };
  },

  async getCallsForProspect(prospectId: string) {
    await delay(200);
    const calls = mockCalls.filter(call => call.prospect_id === prospectId);
    return { data: calls, error: null };
  },

  // HR Contacts
  async addHRContact(prospectId: string, hrData: { name: string; email: string; phone?: string }) {
    await delay(400);
    // Remove existing HR contact for this prospect
    mockHRContacts = mockHRContacts.filter(hr => hr.prospect_id !== prospectId);
    
    const newHRContact: MockHRContact = {
      id: `hr-${Date.now()}`,
      prospect_id: prospectId,
      name: hrData.name,
      email: hrData.email,
      phone: hrData.phone || null,
      email_sent_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockHRContacts.push(newHRContact);
    return { data: [newHRContact], error: null };
  },

  async notifyHR(prospectId: string) {
    await delay(600);
    const hrContact = mockHRContacts.find(hr => hr.prospect_id === prospectId);
    if (hrContact) {
      hrContact.email_sent_at = new Date().toISOString();
      hrContact.updated_at = new Date().toISOString();
    }
    return { error: null };
  },

  // Bulk upload
  async bulkUploadProspects(prospects: Omit<MockProspect, 'id' | 'created_at' | 'updated_at'>[]) {
    await delay(1000);
    const newProspects = prospects.map((prospect, index) => ({
      ...prospect,
      id: `prospect-bulk-${Date.now()}-${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    mockProspects.push(...newProspects);
    return { data: newProspects, error: null };
  },

  // Program summary data
  async getProgramSummary() {
    await delay(250);
    const summary = mockPrograms.map(program => {
      const programProspects = mockProspects.filter(p => p.program_id === program.id);
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
  }
};
