// ============================================
// AIHQ Placement Portal - Mock Data
// AI-AUGMENTED BUSINESS ROLES (NOT engineering)
// ============================================

import {
  EmployerCompany,
  EmployerUser,
  RoleRequest,
  CandidateProfile,
  MatchRecord,
  LOIRecord,
  TrainingProgram,
  TrainingEnrollment,
  GrantCase,
  ActivityLog,
  Task,
  InternalNote,
  AuthUser,
} from './types';

// ============================================
// Employer Companies
// ============================================

export const mockCompanies: EmployerCompany[] = [
  {
    id: 'comp-001',
    name: 'TechVentures Sdn Bhd',
    industry: 'Technology',
    size_band: 'sme',
    location: 'Kuala Lumpur',
    primary_contact_id: 'emp-001',
    notes: 'Fast-growing tech company interested in AI-powered productivity tools',
    risk_flag: 'low',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'comp-002',
    name: 'Global Manufacturing Corp',
    industry: 'Manufacturing',
    size_band: 'enterprise',
    location: 'Penang',
    primary_contact_id: 'emp-003',
    notes: 'Looking to improve operational efficiency with AI workflow tools',
    risk_flag: 'medium',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-15T11:00:00Z',
  },
  {
    id: 'comp-003',
    name: 'FinServe Solutions',
    industry: 'Financial Services',
    size_band: 'sme',
    location: 'Johor Bahru',
    primary_contact_id: 'emp-005',
    risk_flag: 'low',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
  },
];

// ============================================
// Employer Users
// ============================================

export const mockEmployerUsers: EmployerUser[] = [
  {
    id: 'emp-001',
    company_id: 'comp-001',
    role: 'employer_owner',
    name: 'Ahmad Razak',
    email: 'ahmad@techventures.my',
    phone: '+60123456789',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'emp-002',
    company_id: 'comp-001',
    role: 'employer_hr',
    name: 'Sarah Lim',
    email: 'sarah@techventures.my',
    phone: '+60198765432',
    created_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'emp-003',
    company_id: 'comp-002',
    role: 'employer_owner',
    name: 'Tan Wei Ming',
    email: 'weiming@globalmanufacturing.com',
    phone: '+60145678901',
    created_at: '2024-02-01T09:00:00Z',
  },
  {
    id: 'emp-004',
    company_id: 'comp-002',
    role: 'employer_hr',
    name: 'Priya Nair',
    email: 'priya@globalmanufacturing.com',
    created_at: '2024-02-05T10:00:00Z',
  },
  {
    id: 'emp-005',
    company_id: 'comp-003',
    role: 'employer_owner',
    name: 'Lee Chong Wei',
    email: 'chongwei@finserve.my',
    phone: '+60167890123',
    created_at: '2024-02-20T10:00:00Z',
  },
];

// ============================================
// Role Requests - AI-AUGMENTED BUSINESS ROLES
// ============================================

export const mockRoleRequests: RoleRequest[] = [
  {
    id: 'role-001',
    company_id: 'comp-001',
    title: 'Operations Executive (AI-enabled)',
    department: 'Operations',
    problem_statement: 'We need someone to streamline our customer support workflows using AI tools like ChatGPT, automate routine responses, and improve response times through better documentation and SOPs.',
    ai_skill_level_required: 'L2',
    timeline: 'normal',
    status: 'MATCHING',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'role-002',
    company_id: 'comp-001',
    title: 'Business Analyst (AI-enabled)',
    department: 'Business Intelligence',
    problem_statement: 'Looking for someone to create AI-powered reports and dashboards, automate data analysis workflows, and help the team adopt productivity tools for better decision-making.',
    ai_skill_level_required: 'L3',
    timeline: 'urgent',
    status: 'INTERVIEWING',
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },
  {
    id: 'role-003',
    company_id: 'comp-002',
    title: 'Process Automation Specialist',
    department: 'Production',
    problem_statement: 'Need to implement AI-assisted workflow automation using no-code tools to reduce manual data entry and improve reporting efficiency.',
    ai_skill_level_required: 'L3',
    timeline: 'normal',
    status: 'REVIEWING',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-18T12:00:00Z',
  },
  {
    id: 'role-004',
    company_id: 'comp-002',
    title: 'Customer Support Ops (AI-enabled)',
    department: 'Customer Service',
    problem_statement: 'Implement AI-powered customer service workflows, create smart response templates, and train the team on using AI tools for faster resolution.',
    ai_skill_level_required: 'L2',
    timeline: 'flexible',
    status: 'SCOPING',
    created_at: '2024-03-20T08:00:00Z',
    updated_at: '2024-03-20T08:00:00Z',
  },
  {
    id: 'role-005',
    company_id: 'comp-003',
    title: 'Admin / PMO Coordinator (AI-enabled)',
    department: 'Operations',
    problem_statement: 'Need someone to use AI tools for regulatory document summarization, compliance tracking, and administrative workflow automation.',
    ai_skill_level_required: 'L2',
    timeline: 'normal',
    status: 'LOI_PENDING',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
  },
  {
    id: 'role-006',
    company_id: 'comp-003',
    title: 'Marketing Ops (AI-enabled)',
    department: 'Marketing',
    problem_statement: 'Use AI tools to analyze customer feedback, automate content creation workflows, and improve campaign targeting through data-driven insights.',
    ai_skill_level_required: 'L3',
    timeline: 'urgent',
    status: 'PLACED',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  // Additional scenarios for safe exit demonstration
  {
    id: 'role-007',
    company_id: 'comp-001',
    title: 'Knowledge Management Specialist (AI-enabled)',
    department: 'HR',
    problem_statement: 'Create AI-powered documentation systems, automate knowledge base updates, and improve information retrieval for the team.',
    ai_skill_level_required: 'L2',
    timeline: 'normal',
    status: 'CLOSED',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-02-28T10:00:00Z',
  },
];

// ============================================
// Candidates - WORKPLACE AI SKILLS (NOT engineering)
// ============================================

export const mockCandidates: CandidateProfile[] = [
  {
    id: 'cand-001',
    display_name: 'Muhammad Hafiz',
    headline: 'Operations Productivity Specialist',
    ai_skill_level: 'L2',
    key_capabilities: ['Workflow Automation', 'SOP Development', 'AI-Powered Documentation', 'Prompt Engineering'],
    availability: 'immediate',
    location: 'Kuala Lumpur',
    salary_range_display: 'RM 5,000 - 7,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed AI Workflow Foundations Program',
    placement_readiness: true,
    public_summary: 'Experienced in implementing AI-powered productivity solutions for customer service teams. Creates effective SOPs and automates routine workflows.',
    internal_summary: 'Strong performer in training. Good communication skills. Prefers hybrid work.',
    tags: ['workflow-automation', 'documentation', 'customer-service'],
    is_briefed_on_program: true,
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'cand-002',
    display_name: 'Siti Nurhaliza',
    headline: 'Business Analyst & AI Workflow Specialist',
    ai_skill_level: 'L3',
    key_capabilities: ['Business Analysis', 'Report Automation', 'Data Visualization', 'No-Code Tools', 'AI Prompting'],
    availability: 'two_weeks',
    location: 'Selangor',
    salary_range_display: 'RM 8,000 - 12,000',
    status: 'PROPOSED_TO_EMPLOYER',
    training_status_summary: 'Completed AI Workflow Automation Program with distinction',
    placement_readiness: true,
    public_summary: 'Skilled in building automated reporting workflows and AI-powered dashboards. Trains teams on productivity tool adoption.',
    internal_summary: 'Top performer. Looking for challenging projects. Has competing offers.',
    tags: ['business-analysis', 'automation', 'reporting'],
    is_briefed_on_program: true,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-03-18T11:00:00Z',
  },
  {
    id: 'cand-003',
    display_name: 'Raj Kumar',
    headline: 'AI Adoption Lead & Team Trainer',
    ai_skill_level: 'L4',
    key_capabilities: ['Team Training', 'AI Governance', 'Use Case Definition', 'Vendor Coordination', 'Change Management'],
    availability: 'one_month',
    location: 'Penang',
    salary_range_display: 'RM 15,000 - 20,000',
    status: 'INTERVIEWING',
    training_status_summary: 'AI Adoption Leadership Certification',
    placement_readiness: true,
    public_summary: 'Senior professional with 8+ years experience leading AI adoption initiatives across organizations. Specializes in defining use cases and training teams.',
    internal_summary: 'Very experienced. Selective about companies. Needs meaningful work.',
    tags: ['leadership', 'training', 'governance'],
    is_briefed_on_program: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
  },
  {
    id: 'cand-004',
    display_name: 'Jessica Wong',
    headline: 'AI Workplace Power User',
    ai_skill_level: 'L2',
    key_capabilities: ['ChatGPT Workflows', 'Meeting Notes Automation', 'Email Templates', 'Process Documentation'],
    availability: 'immediate',
    location: 'Kuala Lumpur',
    status: 'TRAINING_IN_PROGRESS',
    training_status_summary: 'Week 3 of AI Workplace Productivity Program',
    placement_readiness: false,
    public_summary: 'Admin professional transitioning to AI-enabled productivity roles, currently in training.',
    internal_summary: 'Making good progress. Needs another 3 weeks to be placement ready.',
    tags: ['productivity', 'documentation', 'transitioning'],
    is_briefed_on_program: true,
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-03-22T09:00:00Z',
  },
  {
    id: 'cand-005',
    display_name: 'Amir Hassan',
    headline: 'Process Automation Coordinator',
    ai_skill_level: 'L3',
    key_capabilities: ['No-Code Automation', 'CRM Workflows', 'Integration Design', 'Team Onboarding'],
    availability: 'flexible',
    location: 'Johor Bahru',
    salary_range_display: 'RM 10,000 - 14,000',
    status: 'LOI_SIGNED',
    training_status_summary: 'Completed AI Workflow Automation Program',
    placement_readiness: true,
    public_summary: 'Specialist in building no-code automation workflows and integrating AI tools with existing business systems.',
    internal_summary: 'Signed LOI with FinServe. Training coordination in progress.',
    tags: ['no-code', 'automation', 'integration'],
    is_briefed_on_program: true,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
  },
  {
    id: 'cand-006',
    display_name: 'Chen Mei Ling',
    headline: 'Customer Service AI Specialist',
    ai_skill_level: 'L3',
    key_capabilities: ['Smart Templates', 'Response Automation', 'Ticket Categorization', 'Team Training'],
    availability: 'two_weeks',
    location: 'Kuala Lumpur',
    salary_range_display: 'RM 9,000 - 12,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed AI Customer Service Program',
    placement_readiness: true,
    public_summary: 'Specialist in implementing AI-powered customer service workflows and training teams on efficient response handling.',
    internal_summary: 'Strong skills in creating smart templates. Good team player.',
    tags: ['customer-service', 'templates', 'training'],
    is_briefed_on_program: true,
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },
  {
    id: 'cand-007',
    display_name: 'Faizal Rahman',
    headline: 'Workflow Automation Coordinator',
    ai_skill_level: 'L3',
    key_capabilities: ['Process Mapping', 'Automation Design', 'Reporting Workflows', 'Documentation Systems'],
    availability: 'immediate',
    location: 'Penang',
    salary_range_display: 'RM 8,000 - 11,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed Workflow Automation Program',
    placement_readiness: true,
    public_summary: 'Experienced in designing and implementing automated workflows for manufacturing operations using no-code tools.',
    internal_summary: 'Great fit for manufacturing roles. Previous factory admin experience.',
    tags: ['manufacturing', 'automation', 'workflows'],
    is_briefed_on_program: true,
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-03-18T10:00:00Z',
  },
  {
    id: 'cand-008',
    display_name: 'Nurul Aina',
    headline: 'AI Content & Documentation Specialist',
    ai_skill_level: 'L2',
    key_capabilities: ['Content Automation', 'Training Materials', 'AI-Assisted Writing', 'Knowledge Management'],
    availability: 'immediate',
    location: 'Selangor',
    status: 'NEW_INTAKE',
    placement_readiness: false,
    public_summary: 'Content creator transitioning to AI-enabled documentation roles.',
    internal_summary: 'Just completed intake assessment. Recommend for L2 training program.',
    tags: ['content', 'documentation', 'writing'],
    is_briefed_on_program: false,
    created_at: '2024-03-20T08:00:00Z',
    updated_at: '2024-03-20T08:00:00Z',
  },
];

// ============================================
// Matches - Including safe exit scenarios
// ============================================

export const mockMatches: MatchRecord[] = [
  {
    id: 'match-001',
    role_request_id: 'role-001',
    candidate_id: 'cand-001',
    match_status: 'EMPLOYER_REVIEWING',
    employer_interest: 'pending',
    next_action: 'Awaiting employer review',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'match-002',
    role_request_id: 'role-001',
    candidate_id: 'cand-006',
    match_status: 'PROPOSED',
    employer_interest: 'pending',
    next_action: 'Share with employer',
    created_at: '2024-03-16T09:00:00Z',
    updated_at: '2024-03-16T09:00:00Z',
  },
  {
    id: 'match-003',
    role_request_id: 'role-002',
    candidate_id: 'cand-002',
    match_status: 'INTERVIEW_SCHEDULED',
    employer_interest: 'yes',
    interview_status: 'Scheduled for March 28, 2024',
    next_action: 'Prepare candidate for interview',
    created_at: '2024-03-10T11:00:00Z',
    updated_at: '2024-03-22T12:00:00Z',
  },
  {
    id: 'match-004',
    role_request_id: 'role-003',
    candidate_id: 'cand-007',
    match_status: 'PROPOSED',
    employer_interest: 'pending',
    next_action: 'Share profile with Global Manufacturing',
    created_at: '2024-03-18T10:00:00Z',
    updated_at: '2024-03-18T10:00:00Z',
  },
  {
    id: 'match-005',
    role_request_id: 'role-005',
    candidate_id: 'cand-005',
    match_status: 'PROCEEDING_TO_LOI',
    employer_interest: 'yes',
    next_action: 'Generate LOI draft',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
  },
  // Safe exit scenario - NOT_PROCEEDING_FIT
  {
    id: 'match-006',
    role_request_id: 'role-007',
    candidate_id: 'cand-004',
    match_status: 'NOT_PROCEEDING_FIT',
    employer_interest: 'no',
    next_action: 'Closed - employer chose not to proceed',
    close_reason: {
      type: 'not_proceeding_fit',
      notes: 'Skills alignment did not meet expectations. AIHQ proposing alternatives.',
    },
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-28T10:00:00Z',
  },
];

// ============================================
// LOI Records
// ============================================

export const mockLOIRecords: LOIRecord[] = [
  {
    id: 'loi-001',
    role_request_id: 'role-005',
    candidate_id: 'cand-005',
    company_id: 'comp-003',
    status: 'PENDING_SIGNATURE',
    generated_at: '2024-03-20T10:00:00Z',
    file_url_placeholder: '/placeholder-loi.pdf',
    employer_acknowledged: false,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-22T11:00:00Z',
  },
  {
    id: 'loi-002',
    role_request_id: 'role-006',
    candidate_id: 'cand-005',
    company_id: 'comp-003',
    status: 'SIGNED',
    generated_at: '2024-02-15T09:00:00Z',
    signed_at: '2024-02-20T10:00:00Z',
    file_url_placeholder: '/placeholder-loi-signed.pdf',
    employer_acknowledged: true,
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
];

// ============================================
// Training Programs - WORKPLACE AI FOCUSED
// ============================================

export const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: 'prog-001',
    name: 'AI Workplace Productivity Foundations',
    description: 'Introduction to using AI tools for daily work tasks, email automation, and documentation',
    duration_weeks: 4,
    modules: ['AI Tool Basics', 'Prompt Engineering', 'Safe AI Usage', 'Workflow Integration'],
    target_levels: { from: 'L1', to: 'L2' },
    delivery_mode: 'hybrid',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'prog-002',
    name: 'AI Workflow Automation Program',
    description: 'Building automated workflows using no-code tools and AI integrations',
    duration_weeks: 8,
    modules: ['No-Code Platforms', 'Integration Design', 'Automation Best Practices', 'Measurable Productivity Gains'],
    target_levels: { from: 'L2', to: 'L3' },
    delivery_mode: 'online',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'prog-003',
    name: 'AI Adoption Leadership Program',
    description: 'Leading AI adoption in teams, defining use cases, and setting governance',
    duration_weeks: 12,
    modules: ['Use Case Definition', 'Team Training', 'AI Governance', 'Vendor Coordination', 'Change Management'],
    target_levels: { from: 'L3', to: 'L4' },
    delivery_mode: 'in_person',
    created_at: '2024-01-01T08:00:00Z',
  },
];

// ============================================
// Training Enrollments
// ============================================

export const mockTrainingEnrollments: TrainingEnrollment[] = [
  {
    id: 'enroll-001',
    candidate_id: 'cand-004',
    program_id: 'prog-001',
    start_date: '2024-03-01T08:00:00Z',
    status: 'IN_PROGRESS',
    progress_percent: 75,
    expected_completion_date: '2024-03-29T17:00:00Z',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-22T09:00:00Z',
  },
  {
    id: 'enroll-002',
    candidate_id: 'cand-001',
    program_id: 'prog-001',
    start_date: '2024-01-15T08:00:00Z',
    status: 'COMPLETED',
    progress_percent: 100,
    expected_completion_date: '2024-02-12T17:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-02-12T17:00:00Z',
  },
  {
    id: 'enroll-003',
    candidate_id: 'cand-002',
    program_id: 'prog-002',
    start_date: '2024-01-01T08:00:00Z',
    status: 'COMPLETED',
    progress_percent: 100,
    expected_completion_date: '2024-02-26T17:00:00Z',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-02-26T17:00:00Z',
  },
];

// ============================================
// Grant Cases
// ============================================

export const mockGrantCases: GrantCase[] = [
  {
    id: 'grant-001',
    company_id: 'comp-001',
    candidate_id: 'cand-001',
    status: 'SUBMITTED',
    notes: 'HRD Corp application submitted. Awaiting approval.',
    last_updated: '2024-03-15T10:00:00Z',
    created_at: '2024-03-10T09:00:00Z',
  },
  {
    id: 'grant-002',
    company_id: 'comp-003',
    candidate_id: 'cand-005',
    status: 'APPROVED',
    notes: 'Grant approved. Training coordination can proceed.',
    last_updated: '2024-02-28T11:00:00Z',
    created_at: '2024-02-01T08:00:00Z',
  },
];

// ============================================
// Activity Logs
// ============================================

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act-001',
    entity_type: 'role_request',
    entity_id: 'role-001',
    timestamp: '2024-03-15T10:00:00Z',
    actor: 'AIHQ Placement Team',
    action: 'Matched candidates',
    details: '2 candidates matched to role',
  },
  {
    id: 'act-002',
    entity_type: 'match',
    entity_id: 'match-003',
    timestamp: '2024-03-22T12:00:00Z',
    actor: 'Sarah Lim',
    action: 'Interview scheduled',
    details: 'Interview confirmed for March 28',
  },
  {
    id: 'act-003',
    entity_type: 'loi',
    entity_id: 'loi-001',
    timestamp: '2024-03-20T10:00:00Z',
    actor: 'AIHQ Placement Team',
    action: 'LOI generated',
    details: 'Draft LOI created and sent to employer',
  },
  {
    id: 'act-004',
    entity_type: 'match',
    entity_id: 'match-006',
    timestamp: '2024-02-28T10:00:00Z',
    actor: 'TechVentures HR',
    action: 'Not proceeding',
    details: 'Employer chose not to proceed - AIHQ coordinating alternatives',
  },
];

// ============================================
// Tasks
// ============================================

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    assignee: 'Placement Team',
    due_date: '2024-03-25T17:00:00Z',
    status: 'pending',
    title: 'Follow up with TechVentures on candidate review',
    description: 'Check if employer has reviewed the proposed candidates',
    related_entity_type: 'role_request',
    related_entity_id: 'role-001',
    created_at: '2024-03-18T09:00:00Z',
  },
  {
    id: 'task-002',
    assignee: 'Placement Team',
    due_date: '2024-03-26T17:00:00Z',
    status: 'pending',
    title: 'Prepare Siti Nurhaliza for interview',
    description: 'Send interview prep materials and brief candidate',
    related_entity_type: 'match',
    related_entity_id: 'match-003',
    created_at: '2024-03-22T10:00:00Z',
  },
  {
    id: 'task-003',
    assignee: 'Placement Team',
    due_date: '2024-03-24T17:00:00Z',
    status: 'in_progress',
    title: 'Send LOI reminder to FinServe',
    description: 'Follow up on LOI signature - remind employer that LOI enables training coordination',
    related_entity_type: 'loi',
    related_entity_id: 'loi-001',
    created_at: '2024-03-22T11:00:00Z',
  },
];

// ============================================
// Internal Notes
// ============================================

export const mockInternalNotes: InternalNote[] = [
  {
    id: 'note-001',
    entity_type: 'candidate',
    entity_id: 'cand-002',
    author: 'AIHQ Training',
    created_at: '2024-02-26T17:00:00Z',
    content: 'Completed training with top marks. Strong in workflow automation. Highly recommended.',
    internal_only: true,
  },
  {
    id: 'note-002',
    entity_type: 'company',
    entity_id: 'comp-001',
    author: 'AIHQ Placement',
    created_at: '2024-03-01T10:00:00Z',
    content: 'CEO is very hands-on. Prefers candidates who can start immediately. Good programme alignment.',
    internal_only: true,
  },
  {
    id: 'note-003',
    entity_type: 'role_request',
    entity_id: 'role-002',
    author: 'AIHQ Placement',
    created_at: '2024-03-20T11:00:00Z',
    content: 'Urgent role. Employer values practical automation skills over certifications.',
    internal_only: true,
  },
  {
    id: 'note-004',
    entity_type: 'company',
    entity_id: 'comp-002',
    author: 'AIHQ Placement',
    created_at: '2024-03-15T11:00:00Z',
    content: 'Medium bypass risk - employer has requested direct contact details twice. Remind of programme value.',
    internal_only: true,
  },
];

// ============================================
// Demo Auth Users
// ============================================

export const mockAuthUsers: AuthUser[] = [
  // Employer users
  {
    id: 'emp-001',
    name: 'Ahmad Razak',
    email: 'ahmad@techventures.my',
    role: 'employer_owner',
    company_id: 'comp-001',
    company_name: 'TechVentures Sdn Bhd',
  },
  {
    id: 'emp-002',
    name: 'Sarah Lim',
    email: 'sarah@techventures.my',
    role: 'employer_hr',
    company_id: 'comp-001',
    company_name: 'TechVentures Sdn Bhd',
  },
  {
    id: 'emp-003',
    name: 'Tan Wei Ming',
    email: 'weiming@globalmanufacturing.com',
    role: 'employer_owner',
    company_id: 'comp-002',
    company_name: 'Global Manufacturing Corp',
  },
  // AIHQ users
  {
    id: 'aihq-001',
    name: 'Admin User',
    email: 'admin@aihq.net',
    role: 'aihq_admin',
  },
  {
    id: 'aihq-002',
    name: 'Placement Manager',
    email: 'placement@aihq.net',
    role: 'aihq_placement_ops',
  },
  {
    id: 'aihq-003',
    name: 'Training Coordinator',
    email: 'training@aihq.net',
    role: 'aihq_training_ops',
  },
];
