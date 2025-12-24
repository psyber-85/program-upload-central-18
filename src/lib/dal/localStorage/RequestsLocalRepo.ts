import { RequestsRepo } from '../interfaces/RequestsRepo';
import { 
  LeaveRequest, 
  ClaimRequest, 
  TrainingApplication,
  AnyRequest,
  RequestStatus
} from '../types';
import { delay, generateId, now, storageGet, storageSet } from '../utils';
import { seedLeaveRequests, seedClaimRequests, seedTrainingApplications } from '../seed/seedData';

const LEAVE_REQUESTS_KEY = 'leave_requests';
const CLAIM_REQUESTS_KEY = 'claim_requests';
const TRAINING_APPS_KEY = 'training_applications';

export class RequestsLocalRepo implements RequestsRepo {
  private getLeaveRequests(): LeaveRequest[] {
    return storageGet<LeaveRequest[]>(LEAVE_REQUESTS_KEY, seedLeaveRequests);
  }

  private saveLeaveRequests(requests: LeaveRequest[]): void {
    storageSet(LEAVE_REQUESTS_KEY, requests);
  }

  private getClaimRequests(): ClaimRequest[] {
    return storageGet<ClaimRequest[]>(CLAIM_REQUESTS_KEY, seedClaimRequests);
  }

  private saveClaimRequests(requests: ClaimRequest[]): void {
    storageSet(CLAIM_REQUESTS_KEY, requests);
  }

  private getTrainingApps(): TrainingApplication[] {
    return storageGet<TrainingApplication[]>(TRAINING_APPS_KEY, seedTrainingApplications);
  }

  private saveTrainingApps(apps: TrainingApplication[]): void {
    storageSet(TRAINING_APPS_KEY, apps);
  }

  // ============================================
  // LEAVE REQUESTS
  // ============================================

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    await delay();
    return this.getLeaveRequests().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    await delay();
    return this.getLeaveRequests()
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    await delay();
    return this.getLeaveRequests().find(r => r.id === id) || null;
  }

  async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<LeaveRequest> {
    await delay();
    const requests = this.getLeaveRequests();
    
    const newRequest: LeaveRequest = {
      ...request,
      id: generateId(),
      status: 'Pending',
      createdAt: now(),
      updatedAt: now(),
    };
    
    requests.push(newRequest);
    this.saveLeaveRequests(requests);
    
    return newRequest;
  }

  async updateLeaveRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<LeaveRequest | null> {
    await delay();
    const requests = this.getLeaveRequests();
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    requests[index] = {
      ...requests[index],
      status,
      adminComment,
      updatedAt: now(),
    };
    
    this.saveLeaveRequests(requests);
    return requests[index];
  }

  // ============================================
  // CLAIM REQUESTS
  // ============================================

  async getAllClaimRequests(): Promise<ClaimRequest[]> {
    await delay();
    return this.getClaimRequests().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getClaimRequestsByUser(userId: string): Promise<ClaimRequest[]> {
    await delay();
    return this.getClaimRequests()
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getClaimRequestById(id: string): Promise<ClaimRequest | null> {
    await delay();
    return this.getClaimRequests().find(r => r.id === id) || null;
  }

  async createClaimRequest(request: Omit<ClaimRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'autoApproved'>): Promise<ClaimRequest> {
    await delay();
    const requests = this.getClaimRequests();
    
    const autoApproved = request.amount <= 30;
    
    const newRequest: ClaimRequest = {
      ...request,
      id: generateId(),
      status: autoApproved ? 'Approved' : 'Pending',
      autoApproved,
      createdAt: now(),
      updatedAt: now(),
    };
    
    requests.push(newRequest);
    this.saveClaimRequests(requests);
    
    return newRequest;
  }

  async updateClaimRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<ClaimRequest | null> {
    await delay();
    const requests = this.getClaimRequests();
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    requests[index] = {
      ...requests[index],
      status,
      adminComment,
      updatedAt: now(),
    };
    
    this.saveClaimRequests(requests);
    return requests[index];
  }

  async markClaimIncludedInPayroll(id: string, month: string): Promise<ClaimRequest | null> {
    await delay();
    const requests = this.getClaimRequests();
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    requests[index] = {
      ...requests[index],
      includedInPayrollMonth: month,
      updatedAt: now(),
    };
    
    this.saveClaimRequests(requests);
    return requests[index];
  }

  async getApprovedClaimsForPayroll(beforeMonth: string): Promise<ClaimRequest[]> {
    await delay();
    return this.getClaimRequests().filter(r => 
      r.status === 'Approved' && 
      !r.includedInPayrollMonth &&
      r.createdAt.slice(0, 7) < beforeMonth
    );
  }

  // ============================================
  // TRAINING APPLICATIONS
  // ============================================

  async getAllTrainingApplications(): Promise<TrainingApplication[]> {
    await delay();
    return this.getTrainingApps().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTrainingApplicationsByUser(userId: string): Promise<TrainingApplication[]> {
    await delay();
    return this.getTrainingApps()
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTrainingApplicationById(id: string): Promise<TrainingApplication | null> {
    await delay();
    return this.getTrainingApps().find(a => a.id === id) || null;
  }

  async createTrainingApplication(app: Omit<TrainingApplication, 'id' | 'createdAt' | 'status'>): Promise<TrainingApplication> {
    await delay();
    const apps = this.getTrainingApps();
    
    const newApp: TrainingApplication = {
      ...app,
      id: generateId(),
      status: 'Submitted',
      createdAt: now(),
    };
    
    apps.push(newApp);
    this.saveTrainingApps(apps);
    
    return newApp;
  }

  async approveTrainingApplication(id: string): Promise<TrainingApplication | null> {
    await delay();
    const apps = this.getTrainingApps();
    const index = apps.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }
    
    apps[index] = {
      ...apps[index],
      status: 'Approved',
      approvedAt: now(),
    };
    
    this.saveTrainingApps(apps);
    return apps[index];
  }

  async rejectTrainingApplication(id: string): Promise<TrainingApplication | null> {
    await delay();
    const apps = this.getTrainingApps();
    const index = apps.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }
    
    apps[index] = {
      ...apps[index],
      status: 'Rejected',
    };
    
    this.saveTrainingApps(apps);
    return apps[index];
  }

  async markTrainingCompleted(id: string): Promise<TrainingApplication | null> {
    await delay();
    const apps = this.getTrainingApps();
    const index = apps.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }
    
    apps[index] = {
      ...apps[index],
      status: 'Completed',
      completedAt: now(),
    };
    
    this.saveTrainingApps(apps);
    return apps[index];
  }

  async markTrainingClaimed(id: string): Promise<TrainingApplication | null> {
    await delay();
    const apps = this.getTrainingApps();
    const index = apps.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }
    
    apps[index] = {
      ...apps[index],
      status: 'Claimed',
      claimedAt: now(),
    };
    
    this.saveTrainingApps(apps);
    return apps[index];
  }

  // ============================================
  // COMBINED QUERIES
  // ============================================

  async getAllRequestsByUser(userId: string): Promise<AnyRequest[]> {
    await delay();
    const leave = await this.getLeaveRequestsByUser(userId);
    const claims = await this.getClaimRequestsByUser(userId);
    
    return [...leave, ...claims].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPendingApprovals(): Promise<{
    leave: LeaveRequest[];
    claims: ClaimRequest[];
    training: TrainingApplication[];
  }> {
    await delay();
    
    const leave = this.getLeaveRequests().filter(r => r.status === 'Pending');
    const claims = this.getClaimRequests().filter(r => r.status === 'Pending' && r.amount > 30);
    const training = this.getTrainingApps().filter(a => a.status === 'Submitted');
    
    return { leave, claims, training };
  }

  async getRecentRequestsByUser(userId: string, limit: number = 5): Promise<AnyRequest[]> {
    const all = await this.getAllRequestsByUser(userId);
    return all.slice(0, limit);
  }
}

export const requestsLocalRepo = new RequestsLocalRepo();
