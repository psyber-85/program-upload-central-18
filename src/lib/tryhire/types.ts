// TryHire Types

export interface HiringInterestPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  roles: string;
  headcount: HeadcountOption;
  timeline: TimelineOption;
  genuineNeed: boolean;
  notes?: string;
}

export type HeadcountOption = '1-5' | '5-10' | '10-30' | '30+';
export type TimelineOption = 'immediate' | '1-3-months' | 'exploring';

export interface SubmissionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// TODO: Future Supabase table schema
// CREATE TABLE hiring_interest (
//   id uuid primary key default gen_random_uuid(),
//   created_at timestamptz default now(),
//   company_name text not null,
//   contact_person text not null,
//   email text not null,
//   roles text not null,
//   headcount text not null,
//   timeline text not null,
//   genuine_need boolean not null,
//   notes text
// );
