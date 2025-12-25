// LocalStorage implementations for Placement System
import type {
  EmployerCompany, EmployerUser, PlacementUser, RoleOpening, CandidateProfile,
  CandidateSubmission, LOIRecord, SelectionRecord, ProgrammeTracker,
  ActivityLog, TaskItem, TalentRequest, RoleFilters, CandidateFilters, SubmissionFilters
} from '../types';
import type * as I from '../interfaces';

const PREFIX = 'placement_';

function getStore<T>(key: string): T[] {
  const data = localStorage.getItem(`${PREFIX}${key}`);
  return data ? JSON.parse(data) : [];
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Company Repository
export const companyLocalRepo: I.ICompanyRepo = {
  async getAll() { return getStore<EmployerCompany>('companies'); },
  async getById(id) { return getStore<EmployerCompany>('companies').find(c => c.id === id) || null; },
  async create(data) {
    const companies = getStore<EmployerCompany>('companies');
    const newCompany: EmployerCompany = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    companies.push(newCompany);
    setStore('companies', companies);
    return newCompany;
  },
  async update(id, data) {
    const companies = getStore<EmployerCompany>('companies');
    const idx = companies.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    companies[idx] = { ...companies[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('companies', companies);
    return companies[idx];
  }
};

// Employer User Repository
export const employerUserLocalRepo: I.IEmployerUserRepo = {
  async getByCompanyId(companyId) { return getStore<EmployerUser>('employerUsers').filter(u => u.companyId === companyId); },
  async getById(id) { return getStore<EmployerUser>('employerUsers').find(u => u.id === id) || null; },
  async getByEmail(email) { return getStore<EmployerUser>('employerUsers').find(u => u.email === email) || null; }
};

// Placement User Repository
export const placementUserLocalRepo: I.IPlacementUserRepo = {
  async getById(id) { return getStore<PlacementUser>('users').find(u => u.id === id) || null; },
  async getByEmail(email) { return getStore<PlacementUser>('users').find(u => u.email === email) || null; },
  async getOpsUsers() { return getStore<PlacementUser>('users').filter(u => u.role === 'AIHQ_OPS' || u.role === 'AIHQ_ADMIN'); }
};

// Role Repository
export const roleLocalRepo: I.IRoleRepo = {
  async getAll(filters?: RoleFilters) {
    let roles = getStore<RoleOpening>('roles');
    if (filters?.status?.length) roles = roles.filter(r => filters.status!.includes(r.status));
    if (filters?.companyId) roles = roles.filter(r => r.companyId === filters.companyId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      roles = roles.filter(r => r.title.toLowerCase().includes(s) || r.companyName.toLowerCase().includes(s));
    }
    return roles;
  },
  async getById(id) { return getStore<RoleOpening>('roles').find(r => r.id === id) || null; },
  async getByCompanyId(companyId) { return getStore<RoleOpening>('roles').filter(r => r.companyId === companyId); },
  async create(data) {
    const roles = getStore<RoleOpening>('roles');
    const newRole: RoleOpening = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    roles.push(newRole);
    setStore('roles', roles);
    return newRole;
  },
  async update(id, data) {
    const roles = getStore<RoleOpening>('roles');
    const idx = roles.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Role not found');
    roles[idx] = { ...roles[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('roles', roles);
    return roles[idx];
  }
};

// Candidate Repository
export const candidateLocalRepo: I.ICandidateRepo = {
  async getAll(filters?: CandidateFilters) {
    let candidates = getStore<CandidateProfile>('candidates');
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      candidates = candidates.filter(c => c.fullName.toLowerCase().includes(s) || c.skills.some(sk => sk.toLowerCase().includes(s)));
    }
    return candidates;
  },
  async getById(id) { return getStore<CandidateProfile>('candidates').find(c => c.id === id) || null; },
  async getEmployerSafeView(id) {
    const c = getStore<CandidateProfile>('candidates').find(c => c.id === id);
    if (!c) return null;
    const { fullName, email, phone, nric, dateOfBirth, ...safe } = c;
    return safe;
  }
};

// Submission Repository
export const submissionLocalRepo: I.ISubmissionRepo = {
  async getAll(filters?: SubmissionFilters) {
    let subs = getStore<CandidateSubmission>('submissions');
    if (filters?.roleId) subs = subs.filter(s => s.roleId === filters.roleId);
    if (filters?.candidateId) subs = subs.filter(s => s.candidateId === filters.candidateId);
    if (filters?.stage?.length) subs = subs.filter(s => filters.stage!.includes(s.stage));
    return subs;
  },
  async getById(id) { return getStore<CandidateSubmission>('submissions').find(s => s.id === id) || null; },
  async getByRoleId(roleId) { return getStore<CandidateSubmission>('submissions').filter(s => s.roleId === roleId); },
  async create(data) {
    const subs = getStore<CandidateSubmission>('submissions');
    const newSub: CandidateSubmission = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    subs.push(newSub);
    setStore('submissions', subs);
    return newSub;
  },
  async update(id, data) {
    const subs = getStore<CandidateSubmission>('submissions');
    const idx = subs.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Submission not found');
    subs[idx] = { ...subs[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('submissions', subs);
    return subs[idx];
  }
};

// LOI Repository
export const loiLocalRepo: I.ILOIRepo = {
  async getByRoleId(roleId) { return getStore<LOIRecord>('loiRecords').find(l => l.roleId === roleId) || null; },
  async create(data) {
    const records = getStore<LOIRecord>('loiRecords');
    const newRecord: LOIRecord = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    records.push(newRecord);
    setStore('loiRecords', records);
    return newRecord;
  },
  async update(id, data) {
    const records = getStore<LOIRecord>('loiRecords');
    const idx = records.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('LOI record not found');
    records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('loiRecords', records);
    return records[idx];
  }
};

// Selection Repository
export const selectionLocalRepo: I.ISelectionRepo = {
  async getByRoleId(roleId) { return getStore<SelectionRecord>('selectionRecords').find(s => s.roleId === roleId) || null; },
  async create(data) {
    const records = getStore<SelectionRecord>('selectionRecords');
    const newRecord: SelectionRecord = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    records.push(newRecord);
    setStore('selectionRecords', records);
    return newRecord;
  },
  async update(id, data) {
    const records = getStore<SelectionRecord>('selectionRecords');
    const idx = records.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Selection record not found');
    records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('selectionRecords', records);
    return records[idx];
  }
};

// Programme Repository
export const programmeLocalRepo: I.IProgrammeRepo = {
  async getBySelectionId(selectionId) { return getStore<ProgrammeTracker>('programmeTrackers').find(p => p.selectionId === selectionId) || null; },
  async getByCompanyId(companyId) { return getStore<ProgrammeTracker>('programmeTrackers').filter(p => p.companyId === companyId); },
  async create(data) {
    const trackers = getStore<ProgrammeTracker>('programmeTrackers');
    const newTracker: ProgrammeTracker = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    trackers.push(newTracker);
    setStore('programmeTrackers', trackers);
    return newTracker;
  },
  async update(id, data) {
    const trackers = getStore<ProgrammeTracker>('programmeTrackers');
    const idx = trackers.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Programme tracker not found');
    trackers[idx] = { ...trackers[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('programmeTrackers', trackers);
    return trackers[idx];
  }
};

// Activity Repository
export const activityLocalRepo: I.IActivityRepo = {
  async getByRoleId(roleId) { return getStore<ActivityLog>('activityLogs').filter(a => a.roleId === roleId); },
  async getByCompanyId(companyId) { return getStore<ActivityLog>('activityLogs').filter(a => a.companyId === companyId); },
  async create(data) {
    const logs = getStore<ActivityLog>('activityLogs');
    const newLog: ActivityLog = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    logs.push(newLog);
    setStore('activityLogs', logs);
    return newLog;
  }
};

// Task Repository
export const taskLocalRepo: I.ITaskRepo = {
  async getAll() { return getStore<TaskItem>('tasks'); },
  async getByAssignee(userId) { return getStore<TaskItem>('tasks').filter(t => t.assignedToId === userId); },
  async create(data) {
    const tasks = getStore<TaskItem>('tasks');
    const newTask: TaskItem = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    tasks.push(newTask);
    setStore('tasks', tasks);
    return newTask;
  },
  async update(id, data) {
    const tasks = getStore<TaskItem>('tasks');
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('tasks', tasks);
    return tasks[idx];
  }
};

// Talent Request Repository
export const talentRequestLocalRepo: I.ITalentRequestRepo = {
  async getAll() { return getStore<TalentRequest>('talentRequests'); },
  async create(data) {
    const requests = getStore<TalentRequest>('talentRequests');
    const newRequest: TalentRequest = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    requests.push(newRequest);
    setStore('talentRequests', requests);
    return newRequest;
  },
  async update(id, data) {
    const requests = getStore<TalentRequest>('talentRequests');
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Talent request not found');
    requests[idx] = { ...requests[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('talentRequests', requests);
    return requests[idx];
  }
};
