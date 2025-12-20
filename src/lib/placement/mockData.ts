// ============================================
// AIHQ Placement Portal - Mock Data
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
    notes: 'Fast-growing tech company interested in AI transformation',
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
    notes: 'Looking to digitize operations with AI',
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
// Role Requests
// ============================================

export const mockRoleRequests: RoleRequest[] = [
  {
    id: 'role-001',
    company_id: 'comp-001',
    title: 'AI Operations Specialist',
    department: 'Operations',
    problem_statement: 'We need someone to automate our customer support workflows using AI chatbots and improve response times.',
    ai_skill_level_required: 'L2',
    timeline: 'normal',
    status: 'MATCHING',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'role-002',
    company_id: 'comp-001',
    title: 'Data Analytics Lead',
    department: 'Business Intelligence',
    problem_statement: 'Looking for someone to build AI-powered dashboards and predictive models for sales forecasting.',
    ai_skill_level_required: 'L3',
    timeline: 'urgent',
    status: 'INTERVIEWING',
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },
  {
    id: 'role-003',
    company_id: 'comp-002',
    title: 'AI Process Engineer',
    department: 'Production',
    problem_statement: 'Need to implement predictive maintenance using AI to reduce equipment downtime.',
    ai_skill_level_required: 'L3',
    timeline: 'normal',
    status: 'REVIEWING',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-18T12:00:00Z',
  },
  {
    id: 'role-004',
    company_id: 'comp-002',
    title: 'Quality Assurance AI Specialist',
    department: 'Quality',
    problem_statement: 'Implement computer vision for automated quality inspection on production line.',
    ai_skill_level_required: 'L4',
    timeline: 'flexible',
    status: 'SCOPING',
    created_at: '2024-03-20T08:00:00Z',
    updated_at: '2024-03-20T08:00:00Z',
  },
  {
    id: 'role-005',
    company_id: 'comp-003',
    title: 'AI Compliance Analyst',
    department: 'Compliance',
    problem_statement: 'Need someone to use AI for regulatory document analysis and compliance monitoring.',
    ai_skill_level_required: 'L2',
    timeline: 'normal',
    status: 'LOI_PENDING',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
  },
  {
    id: 'role-006',
    company_id: 'comp-003',
    title: 'Customer Insights Manager',
    department: 'Marketing',
    problem_statement: 'Build AI models to analyze customer behavior and personalize marketing campaigns.',
    ai_skill_level_required: 'L3',
    timeline: 'urgent',
    status: 'PLACED',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
];

// ============================================
// Candidates
// ============================================

export const mockCandidates: CandidateProfile[] = [
  {
    id: 'cand-001',
    display_name: 'Muhammad Hafiz',
    headline: 'AI Operations & Automation Specialist',
    ai_skill_level: 'L2',
    key_capabilities: ['Process Automation', 'Chatbot Development', 'Workflow Design'],
    availability: 'immediate',
    location: 'Kuala Lumpur',
    salary_range_display: 'RM 5,000 - 7,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed AI Operations Program',
    placement_readiness: true,
    public_summary: 'Experienced in implementing AI-powered automation solutions for customer service teams.',
    internal_summary: 'Strong performer in training. Good communication skills. Prefers hybrid work.',
    tags: ['automation', 'chatbots', 'customer-service'],
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'cand-002',
    display_name: 'Siti Nurhaliza',
    headline: 'Data Scientist & ML Engineer',
    ai_skill_level: 'L3',
    key_capabilities: ['Machine Learning', 'Python', 'Data Visualization', 'Predictive Analytics'],
    availability: 'two_weeks',
    location: 'Selangor',
    salary_range_display: 'RM 8,000 - 12,000',
    status: 'PROPOSED_TO_EMPLOYER',
    training_status_summary: 'Completed Advanced ML Program with distinction',
    placement_readiness: true,
    public_summary: 'Skilled data scientist with experience in building ML models for business applications.',
    internal_summary: 'Top performer. Looking for challenging projects. Has competing offers.',
    tags: ['machine-learning', 'python', 'analytics'],
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-03-18T11:00:00Z',
  },
  {
    id: 'cand-003',
    display_name: 'Raj Kumar',
    headline: 'AI Solutions Architect',
    ai_skill_level: 'L4',
    key_capabilities: ['Solution Architecture', 'Cloud AI', 'Computer Vision', 'MLOps'],
    availability: 'one_month',
    location: 'Penang',
    salary_range_display: 'RM 15,000 - 20,000',
    status: 'INTERVIEWING',
    training_status_summary: 'AI Architect Certification',
    placement_readiness: true,
    public_summary: 'Senior AI architect with 8+ years experience designing enterprise AI systems.',
    internal_summary: 'Very experienced. Selective about companies. Needs meaningful work.',
    tags: ['architecture', 'enterprise', 'cloud'],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
  },
  {
    id: 'cand-004',
    display_name: 'Jessica Wong',
    headline: 'AI Business Analyst',
    ai_skill_level: 'L2',
    key_capabilities: ['Business Analysis', 'AI Tools', 'Process Mapping', 'Stakeholder Management'],
    availability: 'immediate',
    location: 'Kuala Lumpur',
    status: 'TRAINING_IN_PROGRESS',
    training_status_summary: 'Week 3 of AI Fundamentals Program',
    placement_readiness: false,
    public_summary: 'Business analyst transitioning to AI, currently in training.',
    internal_summary: 'Making good progress. Needs another 3 weeks to be placement ready.',
    tags: ['business-analysis', 'transitioning'],
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-03-22T09:00:00Z',
  },
  {
    id: 'cand-005',
    display_name: 'Amir Hassan',
    headline: 'AI Product Manager',
    ai_skill_level: 'L3',
    key_capabilities: ['Product Management', 'AI Strategy', 'Roadmap Planning', 'Agile'],
    availability: 'flexible',
    location: 'Johor Bahru',
    salary_range_display: 'RM 10,000 - 14,000',
    status: 'LOI_SIGNED',
    training_status_summary: 'Completed AI Product Management Program',
    placement_readiness: true,
    public_summary: 'Product manager specializing in AI product development and go-to-market strategy.',
    internal_summary: 'Signed LOI with FinServe. Starting in 2 weeks.',
    tags: ['product-management', 'strategy'],
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
  },
  {
    id: 'cand-006',
    display_name: 'Chen Mei Ling',
    headline: 'NLP & Conversational AI Developer',
    ai_skill_level: 'L3',
    key_capabilities: ['NLP', 'Chatbots', 'LLM Fine-tuning', 'Python'],
    availability: 'two_weeks',
    location: 'Kuala Lumpur',
    salary_range_display: 'RM 9,000 - 12,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed NLP Specialization',
    placement_readiness: true,
    public_summary: 'Specialist in building conversational AI and NLP solutions.',
    internal_summary: 'Strong technical skills. Introverted but effective communicator in writing.',
    tags: ['nlp', 'chatbots', 'llm'],
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },
  {
    id: 'cand-007',
    display_name: 'Faizal Rahman',
    headline: 'Industrial AI Engineer',
    ai_skill_level: 'L3',
    key_capabilities: ['Industrial IoT', 'Predictive Maintenance', 'Computer Vision', 'Edge AI'],
    availability: 'immediate',
    location: 'Penang',
    salary_range_display: 'RM 8,000 - 11,000',
    status: 'PLACEMENT_READY',
    training_status_summary: 'Completed Industrial AI Program',
    placement_readiness: true,
    public_summary: 'Engineer with expertise in AI for manufacturing and industrial applications.',
    internal_summary: 'Great fit for manufacturing roles. Previous factory experience.',
    tags: ['industrial', 'manufacturing', 'iot'],
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-03-18T10:00:00Z',
  },
  {
    id: 'cand-008',
    display_name: 'Nurul Aina',
    headline: 'AI Trainer & Content Developer',
    ai_skill_level: 'L2',
    key_capabilities: ['Training Design', 'Content Creation', 'AI Tools', 'Presentation'],
    availability: 'immediate',
    location: 'Selangor',
    status: 'NEW_INTAKE',
    placement_readiness: false,
    public_summary: 'Educator transitioning to AI training roles.',
    internal_summary: 'Just completed intake assessment. Recommend for L2 training program.',
    tags: ['training', 'education'],
    created_at: '2024-03-20T08:00:00Z',
    updated_at: '2024-03-20T08:00:00Z',
  },
];

// ============================================
// Matches
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
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
];

// ============================================
// Training Programs
// ============================================

export const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: 'prog-001',
    name: 'AI Fundamentals',
    description: 'Introduction to AI concepts and practical applications',
    duration_weeks: 4,
    modules: ['AI Overview', 'Machine Learning Basics', 'AI Tools', 'Use Cases'],
    target_levels: { from: 'L1', to: 'L2' },
    delivery_mode: 'hybrid',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'prog-002',
    name: 'Advanced Machine Learning',
    description: 'Deep dive into ML algorithms and model building',
    duration_weeks: 8,
    modules: ['Supervised Learning', 'Unsupervised Learning', 'Deep Learning', 'Model Deployment'],
    target_levels: { from: 'L2', to: 'L3' },
    delivery_mode: 'online',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'prog-003',
    name: 'AI Architecture Masterclass',
    description: 'Enterprise AI system design and implementation',
    duration_weeks: 12,
    modules: ['System Design', 'Cloud AI', 'MLOps', 'Security', 'Governance'],
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
    notes: 'Grant approved. Training can commence.',
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
    description: 'Follow up on LOI signature',
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
    content: 'Completed training with top marks. Highly recommended for senior roles.',
    internal_only: true,
  },
  {
    id: 'note-002',
    entity_type: 'company',
    entity_id: 'comp-001',
    author: 'AIHQ Placement',
    created_at: '2024-03-01T10:00:00Z',
    content: 'CEO is very hands-on. Prefers candidates who can start immediately.',
    internal_only: true,
  },
  {
    id: 'note-003',
    entity_type: 'role_request',
    entity_id: 'role-002',
    author: 'AIHQ Placement',
    created_at: '2024-03-20T11:00:00Z',
    content: 'Urgent role. Employer willing to offer signing bonus for right candidate.',
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
