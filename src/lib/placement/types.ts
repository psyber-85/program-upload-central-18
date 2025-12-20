// ============================================
// AIHQ Placement Portal - Type Definitions
// ============================================

// User Roles
export type UserRole = 
  | 'employer_owner'
  | 'employer_hr'
  | 'aihq_admin'
  | 'aihq_placement_ops'
  | 'aihq_training_ops'
  | 'talent_user';

export const EMPLOYER_ROLES: UserRole[] = ['employer_owner', 'employer_hr'];
export const AIHQ_ROLES: UserRole[] = ['aihq_admin', 'aihq_placement_ops', 'aihq_training_ops'];

// AI Skill Levels
export type AISkillLevel = 'L1' | 'L2' | 'L3' | 'L4';

export const AI_SKILL_LEVELS: Record<AISkillLevel, { label: string; description: string }> = {
  L1: { label: 'AI Aware', description: 'Basic understanding of AI concepts and tools' },
  L2: { label: 'AI User', description: 'Proficient in using AI tools for daily tasks' },
  L3: { label: 'AI Builder', description: 'Can build and customize AI solutions' },
  L4: { label: 'AI Architect', description: 'Expert in designing AI systems and strategy' },
};

// ============================================
// Employer Entities
// ============================================

export interface EmployerCompany {
  id: string;
  name: string;
  industry: string;
  size_band: 'startup' | 'sme' | 'enterprise';
  location: string;
  primary_contact_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerUser {
  id: string;
  company_id: string;
  role: 'employer_owner' | 'employer_hr';
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

// ============================================
// Role Request (NOT "Job Post")
// ============================================

export type RoleRequestStatus = 
  | 'SCOPING'
  | 'REVIEWING'
  | 'MATCHING'
  | 'INTERVIEWING'
  | 'LOI_PENDING'
  | 'PLACED'
  | 'CLOSED';

export type RoleRequestTimeline = 'urgent' | 'normal' | 'flexible';

export interface RoleRequest {
  id: string;
  company_id: string;
  title: string;
  department: string;
  problem_statement: string;
  ai_skill_level_required: AISkillLevel;
  timeline: RoleRequestTimeline;
  status: RoleRequestStatus;
  created_at: string;
  updated_at: string;
}

// ============================================
// Candidate Entities
// ============================================

export type CandidateStatus =
  | 'NEW_INTAKE'
  | 'ASSESSMENT_PENDING'
  | 'TRAINING_IN_PROGRESS'
  | 'PLACEMENT_READY'
  | 'PROPOSED_TO_EMPLOYER'
  | 'INTERVIEWING'
  | 'LOI_PENDING'
  | 'LOI_SIGNED'
  | 'TRAINING_SCHEDULED'
  | 'TRAINING_COMPLETED'
  | 'PLACED'
  | 'CLOSED';

export interface CandidateProfile {
  id: string;
  display_name: string;
  headline: string;
  ai_skill_level: AISkillLevel;
  key_capabilities: string[];
  availability: 'immediate' | 'two_weeks' | 'one_month' | 'flexible';
  location: string;
  salary_range_display?: string;
  status: CandidateStatus;
  training_status_summary?: string;
  placement_readiness: boolean;
  public_summary: string;
  internal_summary?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Match & Pipeline
// ============================================

export type MatchStatus =
  | 'PROPOSED'
  | 'EMPLOYER_REVIEWING'
  | 'INTERVIEW_REQUESTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'EMPLOYER_INTERESTED'
  | 'PROCEEDING_TO_LOI'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface MatchRecord {
  id: string;
  role_request_id: string;
  candidate_id: string;
  match_status: MatchStatus;
  employer_interest: 'yes' | 'no' | 'pending';
  interview_status?: string;
  next_action?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// LOI (Letter of Intent)
// ============================================

export type LOIStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'UPLOADED';

export interface LOIRecord {
  id: string;
  role_request_id: string;
  candidate_id: string;
  company_id: string;
  status: LOIStatus;
  generated_at?: string;
  signed_at?: string;
  file_url_placeholder?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Training
// ============================================

export type TrainingDeliveryMode = 'online' | 'in_person' | 'hybrid';

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  modules: string[];
  target_levels: { from: AISkillLevel; to: AISkillLevel };
  delivery_mode: TrainingDeliveryMode;
  created_at: string;
}

export type TrainingEnrollmentStatus = 
  | 'ENROLLED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DROPPED';

export interface TrainingEnrollment {
  id: string;
  candidate_id: string;
  program_id: string;
  start_date: string;
  status: TrainingEnrollmentStatus;
  progress_percent: number;
  expected_completion_date: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Grant Case
// ============================================

export type GrantCaseStatus = 
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface GrantCase {
  id: string;
  company_id: string;
  candidate_id: string;
  status: GrantCaseStatus;
  notes?: string;
  last_updated: string;
  created_at: string;
}

// ============================================
// Activity & Tasks
// ============================================

export type ActivityEntityType = 
  | 'role_request'
  | 'candidate'
  | 'match'
  | 'loi'
  | 'training'
  | 'grant'
  | 'company';

export interface ActivityLog {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  assignee: string;
  due_date: string;
  status: TaskStatus;
  title: string;
  description?: string;
  related_entity_type?: ActivityEntityType;
  related_entity_id?: string;
  template_type?: string;
  created_at: string;
}

// ============================================
// Internal Notes
// ============================================

export interface InternalNote {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  author: string;
  created_at: string;
  content: string;
  internal_only: boolean;
}

// ============================================
// Auth User (for demo login)
// ============================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id?: string;
  company_name?: string;
}

// ============================================
// Permissions
// ============================================

export type Permission =
  | 'view_own_company'
  | 'view_all_companies'
  | 'create_role_request'
  | 'view_curated_candidates'
  | 'view_all_candidates'
  | 'manage_matches'
  | 'view_internal_notes'
  | 'manage_training'
  | 'manage_grants'
  | 'manage_templates'
  | 'view_analytics';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  employer_owner: [
    'view_own_company',
    'create_role_request',
    'view_curated_candidates',
  ],
  employer_hr: [
    'view_own_company',
    'view_curated_candidates',
  ],
  aihq_admin: [
    'view_own_company',
    'view_all_companies',
    'create_role_request',
    'view_curated_candidates',
    'view_all_candidates',
    'manage_matches',
    'view_internal_notes',
    'manage_training',
    'manage_grants',
    'manage_templates',
    'view_analytics',
  ],
  aihq_placement_ops: [
    'view_all_companies',
    'create_role_request',
    'view_curated_candidates',
    'view_all_candidates',
    'manage_matches',
    'view_internal_notes',
    'manage_grants',
    'view_analytics',
  ],
  aihq_training_ops: [
    'view_all_companies',
    'view_curated_candidates',
    'view_all_candidates',
    'view_internal_notes',
    'manage_training',
    'view_analytics',
  ],
  talent_user: [],
};
