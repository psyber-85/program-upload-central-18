import { 
  LeaveRequest, 
  ClaimRequest, 
  TrainingApplication,
  AnyRequest,
  RequestStatus,
  RequestType
} from '../types';

export interface RequestsRepo {
  // ============================================
  // LEAVE REQUESTS
  // ============================================
  
  // Get all leave requests (admin)
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  
  // Get leave requests by user
  getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]>;
  
  // Get leave request by ID
  getLeaveRequestById(id: string): Promise<LeaveRequest | null>;
  
  // Create leave request
  createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<LeaveRequest>;
  
  // Update leave request status (admin)
  updateLeaveRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<LeaveRequest | null>;
  
  // ============================================
  // CLAIM REQUESTS
  // ============================================
  
  // Get all claim requests (admin)
  getAllClaimRequests(): Promise<ClaimRequest[]>;
  
  // Get claim requests by user
  getClaimRequestsByUser(userId: string): Promise<ClaimRequest[]>;
  
  // Get claim request by ID
  getClaimRequestById(id: string): Promise<ClaimRequest | null>;
  
  // Create claim request
  createClaimRequest(request: Omit<ClaimRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'autoApproved'>): Promise<ClaimRequest>;
  
  // Update claim request status (admin)
  updateClaimRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<ClaimRequest | null>;
  
  // Mark claim as included in payroll
  markClaimIncludedInPayroll(id: string, month: string): Promise<ClaimRequest | null>;
  
  // Get approved claims for payroll (not yet included)
  getApprovedClaimsForPayroll(beforeMonth: string): Promise<ClaimRequest[]>;
  
  // ============================================
  // TRAINING APPLICATIONS
  // ============================================
  
  // Get all training applications (admin)
  getAllTrainingApplications(): Promise<TrainingApplication[]>;
  
  // Get training applications by user
  getTrainingApplicationsByUser(userId: string): Promise<TrainingApplication[]>;
  
  // Get training application by ID
  getTrainingApplicationById(id: string): Promise<TrainingApplication | null>;
  
  // Create training application
  createTrainingApplication(app: Omit<TrainingApplication, 'id' | 'createdAt' | 'status'>): Promise<TrainingApplication>;
  
  // Approve training application (admin)
  approveTrainingApplication(id: string): Promise<TrainingApplication | null>;
  
  // Reject training application (admin)
  rejectTrainingApplication(id: string): Promise<TrainingApplication | null>;
  
  // Mark training as completed (staff)
  markTrainingCompleted(id: string): Promise<TrainingApplication | null>;
  
  // Mark training as claimed (after claim submitted)
  markTrainingClaimed(id: string): Promise<TrainingApplication | null>;
  
  // ============================================
  // COMBINED QUERIES
  // ============================================
  
  // Get all requests for user (combined)
  getAllRequestsByUser(userId: string): Promise<AnyRequest[]>;
  
  // Get pending requests for approval (admin)
  getPendingApprovals(): Promise<{
    leave: LeaveRequest[];
    claims: ClaimRequest[]; // only claims > 30
    training: TrainingApplication[];
  }>;
  
  // Get recent requests for user
  getRecentRequestsByUser(userId: string, limit?: number): Promise<AnyRequest[]>;
}
