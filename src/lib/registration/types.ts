export interface RegistrationRound {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: 'active' | 'archived' | 'upcoming';
  created_at: string;
  updated_at: string;
}

export interface RegistrationProgram {
  id: string;
  round_id: string;
  title: string;
  pricing?: number | null;
  product_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  program_id: string;
  name: string;
  email: string;
  phone?: string | null;
  org?: string | null;
  role?: string | null;
  payment?: string | null;
  product_type?: string | null;
  registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  status_reason?: string | null;
  created_at: string;
  updated_at: string;
}
