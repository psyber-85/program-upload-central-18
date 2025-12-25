// Repository interfaces for Placement System
import type {
  EmployerCompany, EmployerUser, PlacementUser, RoleOpening, CandidateProfile,
  CandidateSubmission, LOIRecord, SelectionRecord, ProgrammeTracker, GrantSupportCase,
  ActivityLog, TaskItem, TalentRequest, RoleFilters, CandidateFilters, SubmissionFilters
} from '../types';

export interface ICompanyRepo {
  getAll(): Promise<EmployerCompany[]>;
  getById(id: string): Promise<EmployerCompany | null>;
  getUsers(companyId: string): Promise<EmployerUser[]>;
  create(company: Omit<EmployerCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployerCompany>;
  update(id: string, data: Partial<EmployerCompany>): Promise<EmployerCompany>;
}

export interface IEmployerUserRepo {
  getByCompanyId(companyId: string): Promise<EmployerUser[]>;
  getById(id: string): Promise<EmployerUser | null>;
  getByEmail(email: string): Promise<EmployerUser | null>;
}

export interface IPlacementUserRepo {
  getById(id: string): Promise<PlacementUser | null>;
  getByEmail(email: string): Promise<PlacementUser | null>;
  getOpsUsers(): Promise<PlacementUser[]>;
}

export interface IRoleRepo {
  getAll(filters?: RoleFilters): Promise<RoleOpening[]>;
  getById(id: string): Promise<RoleOpening | null>;
  getByCompanyId(companyId: string): Promise<RoleOpening[]>;
  create(role: Omit<RoleOpening, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleOpening>;
  update(id: string, data: Partial<RoleOpening>): Promise<RoleOpening>;
}

export interface ICandidateRepo {
  getAll(filters?: CandidateFilters): Promise<CandidateProfile[]>;
  getById(id: string): Promise<CandidateProfile | null>;
  getEmployerSafeView(id: string): Promise<Partial<CandidateProfile> | null>;
}

export interface ISubmissionRepo {
  getAll(filters?: SubmissionFilters): Promise<CandidateSubmission[]>;
  getById(id: string): Promise<CandidateSubmission | null>;
  getByRoleId(roleId: string): Promise<CandidateSubmission[]>;
  create(submission: Omit<CandidateSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<CandidateSubmission>;
  update(id: string, data: Partial<CandidateSubmission>): Promise<CandidateSubmission>;
}

export interface ILOIRepo {
  getByRoleId(roleId: string): Promise<LOIRecord | null>;
  create(record: Omit<LOIRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LOIRecord>;
  update(id: string, data: Partial<LOIRecord>): Promise<LOIRecord>;
  updateStatus(roleId: string, status: import('../types').LOIStatus): Promise<void>;
}

export interface ISelectionRepo {
  getByRoleId(roleId: string): Promise<SelectionRecord | null>;
  create(record: Omit<SelectionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SelectionRecord>;
  update(id: string, data: Partial<SelectionRecord>): Promise<SelectionRecord>;
}

export interface IProgrammeRepo {
  getBySelectionId(selectionId: string): Promise<ProgrammeTracker | null>;
  getByCompanyId(companyId: string): Promise<ProgrammeTracker[]>;
  getAll(): Promise<ProgrammeTracker[]>;
  create(tracker: Omit<ProgrammeTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgrammeTracker>;
  update(id: string, data: Partial<ProgrammeTracker>): Promise<ProgrammeTracker>;
}

export interface IGrantRepo {
  getAll(): Promise<GrantSupportCase[]>;
  getByRoleId(roleId: string): Promise<GrantSupportCase | null>;
  getByCompanyId(companyId: string): Promise<GrantSupportCase[]>;
  create(grant: Omit<GrantSupportCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<GrantSupportCase>;
  update(id: string, data: Partial<GrantSupportCase>): Promise<GrantSupportCase>;
}

export interface IActivityRepo {
  getByRoleId(roleId: string): Promise<ActivityLog[]>;
  getByCompanyId(companyId: string): Promise<ActivityLog[]>;
  create(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;
}

export interface ITaskRepo {
  getAll(): Promise<TaskItem[]>;
  getByAssignee(userId: string): Promise<TaskItem[]>;
  create(task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskItem>;
  update(id: string, data: Partial<TaskItem>): Promise<TaskItem>;
}

export interface ITalentRequestRepo {
  getAll(): Promise<TalentRequest[]>;
  create(request: Omit<TalentRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TalentRequest>;
  update(id: string, data: Partial<TalentRequest>): Promise<TalentRequest>;
}
