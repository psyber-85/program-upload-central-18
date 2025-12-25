// ============================================
// AIHQ Placement System - Type Definitions
// Completely isolated from Staff Portal types
// ============================================

// ============================================
// AUTH TYPES
// ============================================

export type PlacementUserRole = 'COMPANY_ADMIN' | 'HIRING_MANAGER' | 'AIHQ_OPS' | 'AIHQ_ADMIN';

export interface PlacementSession {
  userId: string;
  role: PlacementUserRole;
  companyId?: string;
  companyName?: string;
  userName: string;
  email: string;
}

export interface PlacementUser {
  id: string;
  email: string;
  name: string;
  role: PlacementUserRole;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EMPLOYER / COMPANY TYPES
// ============================================

export type CompanyStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface EmployerCompany {
  id: string;
  name: string;
  industry: string;
  size: string; // e.g., "50-100", "100-500"
  website?: string;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerUser {
  id: string;
  companyId: string;
  email: string;
  name: string;
  role: 'COMPANY_ADMIN' | 'HIRING_MANAGER';
  phone?: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ROLE TYPES
// ============================================

export type RoleStatus = 
  | 'DRAFT'           // Employer creating role
  | 'OPEN'            // Published, Ops can assign candidates
  | 'INTERVIEWING'    // Candidates being interviewed
  | 'SELECTING'       // Final selection in progress
  | 'SELECTED'        // Candidate selected, pending placement
  | 'PLACED'          // Placement complete
  | 'CLOSED';         // Role closed (filled or cancelled)

export type WorkArrangement = 'ONSITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';

export interface RoleOpening {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  department?: string;
  description: string;
  requirements: string[];
  niceToHave?: string[];
  salaryMin?: number;
  salaryMax?: number;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  location: string;
  headcount: number;
  status: RoleStatus;
  createdById: string;
  createdByName: string;
  loiStatus: LOIStatus;
  loiSignedAt?: string;
  loiDocumentUrl?: string;
  selectedCandidateId?: string;
  placedAt?: string;
  closedAt?: string;
  closedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CANDIDATE TYPES
// ============================================

export type CandidateAvailability = 'IMMEDIATE' | 'TWO_WEEKS' | 'ONE_MONTH' | 'LONGER';

export interface CandidateProfile {
  id: string;
  // Personal info (internal only)
  fullName: string;
  email: string;
  phone: string;
  nric: string; // Internal only
  dateOfBirth?: string;
  
  // Professional info (employer-safe)
  displayName: string; // Anonymized version for employers
  currentRole?: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  certifications?: string[];
  summary: string;
  
  // Documents
  cvUrl?: string;
  cvEmployerSafeUrl?: string; // Redacted version
  
  // Status
  availability: CandidateAvailability;
  expectedSalary?: number;
  preferredLocations?: string[];
  preferredWorkArrangements?: WorkArrangement[];
  
  // Metadata
  source: string; // e.g., "Career Fair", "Referral", "Training Programme"
  programmeId?: string;
  programmeName?: string;
  notes?: string; // Internal notes
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SUBMISSION / PIPELINE TYPES
// ============================================

export type SubmissionStage = 
  | 'SUBMITTED'           // Ops submitted candidate to role
  | 'SHORTLISTED'         // Employer shortlisted (requires LOI)
  | 'INTERVIEW_REQUESTED' // Employer requested interview (requires LOI)
  | 'INTERVIEW_SCHEDULED' // Interview scheduled
  | 'INTERVIEWED'         // Interview completed
  | 'OFFERED'             // Offer made
  | 'SELECTED'            // Final selection
  | 'REJECTED'            // Rejected at any stage
  | 'WITHDRAWN';          // Candidate withdrew

export interface CandidateSubmission {
  id: string;
  roleId: string;
  candidateId: string;
  
  // Denormalized for display
  roleName: string;
  companyName: string;
  candidateDisplayName: string;
  
  // Pipeline state
  stage: SubmissionStage;
  stageHistory: StageChange[];
  
  // Employer feedback
  employerRating?: number; // 1-5
  employerNotes?: string;
  
  // Interview details
  interviewScheduledAt?: string;
  interviewNotes?: string;
  interviewerName?: string;
  
  // Rejection details
  rejectedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  
  // Selection details
  selectedAt?: string;
  offerDetails?: string;
  
  submittedById: string;
  submittedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageChange {
  from: SubmissionStage;
  to: SubmissionStage;
  changedAt: string;
  changedById: string;
  changedByName: string;
  notes?: string;
}

// ============================================
// LOI (LETTER OF INTENT) TYPES
// ============================================

export type LOIStatus = 
  | 'NOT_REQUESTED'   // No LOI action yet
  | 'REQUESTED'       // System prompted employer
  | 'DOWNLOADED'      // Employer downloaded template
  | 'UPLOADED_SIGNED' // Employer uploaded signed LOI
  | 'VERIFIED';       // Ops verified the LOI

export interface LOIRecord {
  id: string;
  roleId: string;
  companyId: string;
  
  status: LOIStatus;
  
  // Template
  templateDownloadedAt?: string;
  templateDownloadedById?: string;
  
  // Signed upload
  signedDocumentUrl?: string;
  uploadedAt?: string;
  uploadedById?: string;
  uploadedByName?: string;
  
  // Verification
  verifiedAt?: string;
  verifiedById?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SELECTION & PROGRAMME TYPES
// ============================================

export interface SelectionRecord {
  id: string;
  roleId: string;
  submissionId: string;
  candidateId: string;
  companyId: string;
  
  // Denormalized
  roleName: string;
  companyName: string;
  candidateName: string;
  
  selectedAt: string;
  selectedById: string;
  selectedByName: string;
  
  // Offer details
  offeredSalary?: number;
  startDate?: string;
  offerNotes?: string;
  
  // Status
  placementConfirmed: boolean;
  placementConfirmedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type TrainingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProgrammeTracker {
  id: string;
  selectionId: string;
  roleId: string;
  candidateId: string;
  companyId: string;
  
  // Training info
  programmeName: string;
  programmeDescription?: string;
  startDate?: string;
  endDate?: string;
  
  // Progress
  trainingStatus: TrainingStatus;
  completionPercentage: number;
  milestones: TrainingMilestone[];
  
  // Grant support
  grantApplied: boolean;
  grantStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  grantAmount?: number;
  grantNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface TrainingMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

// ============================================
// ACTIVITY & TASK TYPES
// ============================================

export type ActivityType = 
  | 'ROLE_CREATED'
  | 'ROLE_PUBLISHED'
  | 'ROLE_STATUS_CHANGED'
  | 'CANDIDATE_SUBMITTED'
  | 'CANDIDATE_SHORTLISTED'
  | 'INTERVIEW_REQUESTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'CANDIDATE_SELECTED'
  | 'CANDIDATE_REJECTED'
  | 'LOI_DOWNLOADED'
  | 'LOI_UPLOADED'
  | 'LOI_VERIFIED'
  | 'PLACEMENT_CONFIRMED'
  | 'NOTE_ADDED'
  | 'OTHER';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  
  // Context
  roleId?: string;
  candidateId?: string;
  submissionId?: string;
  companyId?: string;
  
  // Actor
  actorId: string;
  actorName: string;
  actorRole: PlacementUserRole;
  
  // Content
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  
  createdAt: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  
  // Context
  roleId?: string;
  candidateId?: string;
  submissionId?: string;
  companyId?: string;
  
  // Assignment
  assignedToId?: string;
  assignedToName?: string;
  createdById: string;
  createdByName: string;
  
  // Status
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FORM / REQUEST TYPES
// ============================================

export interface TalentRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  roleTitle: string;
  roleDescription: string;
  headcount: number;
  urgency: 'ASAP' | 'ONE_MONTH' | 'THREE_MONTHS' | 'EXPLORING';
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STATS / DASHBOARD TYPES
// ============================================

export interface PlacementStats {
  totalCompanies: number;
  activeRoles: number;
  totalCandidates: number;
  totalSubmissions: number;
  pendingLOIs: number;
  placementsThisMonth: number;
  placementsTotal: number;
}

export interface EmployerDashboardStats {
  activeRoles: number;
  totalSubmissions: number;
  interviewsScheduled: number;
  pendingLOIs: number;
  placements: number;
}

// ============================================
// FILTER / QUERY TYPES
// ============================================

export interface RoleFilters {
  status?: RoleStatus[];
  companyId?: string;
  search?: string;
}

export interface CandidateFilters {
  skills?: string[];
  availability?: CandidateAvailability[];
  yearsExperienceMin?: number;
  yearsExperienceMax?: number;
  search?: string;
}

export interface SubmissionFilters {
  roleId?: string;
  candidateId?: string;
  stage?: SubmissionStage[];
  companyId?: string;
}
