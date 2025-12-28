import { supabase } from '@/integrations/supabase/client';
import { 
  LeaveRequest, 
  ClaimRequest, 
  TrainingApplication,
  AnyRequest,
  RequestStatus,
  LeaveType,
  TrainingApplicationStatus
} from '../types';
import { RequestsRepo } from '../interfaces/RequestsRepo';

class RequestsSupabaseRepo implements RequestsRepo {

  // ============================================
  // LEAVE REQUESTS
  // ============================================

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('sp_leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapLeaveRequest);
  }

  async getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('sp_leave_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapLeaveRequest);
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('sp_leave_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapLeaveRequest(data);
  }

  async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('sp_leave_requests')
      .insert({
        user_id: request.userId,
        leave_type: request.leaveType,
        start_date: request.startDate,
        end_date: request.endDate,
        half_day: request.halfDay,
        reason: request.reason,
        custom_leave_type: request.customLeaveType,
        attachment_url: request.attachmentUrl,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapLeaveRequest(data);
  }

  async updateLeaveRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<LeaveRequest | null> {
    const { error } = await supabase
      .from('sp_leave_requests')
      .update({ 
        status, 
        admin_comment: adminComment 
      })
      .eq('id', id);

    if (error) return null;

    return this.getLeaveRequestById(id);
  }

  // ============================================
  // CLAIM REQUESTS
  // ============================================

  async getAllClaimRequests(): Promise<ClaimRequest[]> {
    const { data, error } = await supabase
      .from('sp_claim_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapClaimRequest);
  }

  async getClaimRequestsByUser(userId: string): Promise<ClaimRequest[]> {
    const { data, error } = await supabase
      .from('sp_claim_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapClaimRequest);
  }

  async getClaimRequestById(id: string): Promise<ClaimRequest | null> {
    const { data, error } = await supabase
      .from('sp_claim_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapClaimRequest(data);
  }

  async createClaimRequest(request: Omit<ClaimRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'autoApproved'>): Promise<ClaimRequest> {
    const autoApproved = request.amount <= 30;

    const { data, error } = await supabase
      .from('sp_claim_requests')
      .insert({
        user_id: request.userId,
        amount: request.amount,
        category: request.category,
        description: request.description,
        receipt_file_name: request.receiptMeta?.fileName,
        receipt_file_size: request.receiptMeta?.fileSize,
        receipt_file_type: request.receiptMeta?.fileType,
        receipt_uploaded_at: request.receiptMeta?.uploadedAt,
        auto_approved: autoApproved,
        linked_training_app_id: request.linkedTrainingAppId,
        attachment_url: request.attachmentUrl,
        status: autoApproved ? 'Approved' : 'Pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapClaimRequest(data);
  }

  async updateClaimRequestStatus(id: string, status: RequestStatus, adminComment?: string): Promise<ClaimRequest | null> {
    const { error } = await supabase
      .from('sp_claim_requests')
      .update({ 
        status, 
        admin_comment: adminComment 
      })
      .eq('id', id);

    if (error) return null;

    return this.getClaimRequestById(id);
  }

  async markClaimIncludedInPayroll(id: string, month: string): Promise<ClaimRequest | null> {
    const { error } = await supabase
      .from('sp_claim_requests')
      .update({ included_in_payroll_month: month })
      .eq('id', id);

    if (error) return null;

    return this.getClaimRequestById(id);
  }

  async getApprovedClaimsForPayroll(beforeMonth: string): Promise<ClaimRequest[]> {
    const { data, error } = await supabase
      .from('sp_claim_requests')
      .select('*')
      .eq('status', 'Approved')
      .is('included_in_payroll_month', null)
      .order('created_at');

    if (error || !data) return [];

    return data.map(this.mapClaimRequest);
  }

  // ============================================
  // TRAINING APPLICATIONS
  // ============================================

  async getAllTrainingApplications(): Promise<TrainingApplication[]> {
    const { data, error } = await supabase
      .from('sp_training_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapTrainingApplication);
  }

  async getTrainingApplicationsByUser(userId: string): Promise<TrainingApplication[]> {
    const { data, error } = await supabase
      .from('sp_training_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapTrainingApplication);
  }

  async getTrainingApplicationById(id: string): Promise<TrainingApplication | null> {
    const { data, error } = await supabase
      .from('sp_training_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapTrainingApplication(data);
  }

  async createTrainingApplication(app: Omit<TrainingApplication, 'id' | 'createdAt' | 'status'>): Promise<TrainingApplication> {
    const { data, error } = await supabase
      .from('sp_training_applications')
      .insert({
        user_id: app.userId,
        course_name: app.courseName,
        provider: app.provider,
        cost: app.cost,
        link: app.link,
        justification: app.justification,
        attachment_url: app.attachmentUrl,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapTrainingApplication(data);
  }

  async approveTrainingApplication(id: string): Promise<TrainingApplication | null> {
    const { error } = await supabase
      .from('sp_training_applications')
      .update({ 
        status: 'Approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return null;

    return this.getTrainingApplicationById(id);
  }

  async rejectTrainingApplication(id: string): Promise<TrainingApplication | null> {
    const { error } = await supabase
      .from('sp_training_applications')
      .update({ status: 'Rejected' })
      .eq('id', id);

    if (error) return null;

    return this.getTrainingApplicationById(id);
  }

  async markTrainingCompleted(id: string): Promise<TrainingApplication | null> {
    const { error } = await supabase
      .from('sp_training_applications')
      .update({ 
        status: 'Completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return null;

    return this.getTrainingApplicationById(id);
  }

  async markTrainingClaimed(id: string): Promise<TrainingApplication | null> {
    const { error } = await supabase
      .from('sp_training_applications')
      .update({ 
        status: 'Claimed',
        claimed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return null;

    return this.getTrainingApplicationById(id);
  }

  // ============================================
  // COMBINED QUERIES
  // ============================================

  async getAllRequestsByUser(userId: string): Promise<AnyRequest[]> {
    const [leave, claims] = await Promise.all([
      this.getLeaveRequestsByUser(userId),
      this.getClaimRequestsByUser(userId),
    ]);

    return [...leave, ...claims].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPendingApprovals(): Promise<{
    leave: LeaveRequest[];
    claims: ClaimRequest[];
    training: TrainingApplication[];
  }> {
    const [allLeave, allClaims, allTraining] = await Promise.all([
      this.getAllLeaveRequests(),
      this.getAllClaimRequests(),
      this.getAllTrainingApplications(),
    ]);

    return {
      leave: allLeave.filter(r => r.status === 'Pending'),
      claims: allClaims.filter(r => r.status === 'Pending' && r.amount > 30),
      training: allTraining.filter(r => r.status === 'Submitted'),
    };
  }

  async getRecentRequestsByUser(userId: string, limit: number = 5): Promise<AnyRequest[]> {
    const all = await this.getAllRequestsByUser(userId);
    return all.slice(0, limit);
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapLeaveRequest(data: Record<string, unknown>): LeaveRequest {
    return {
      id: data.id as string,
      type: 'Leave',
      userId: data.user_id as string,
      status: data.status as RequestStatus,
      leaveType: data.leave_type as LeaveType,
      startDate: data.start_date as string,
      endDate: data.end_date as string,
      halfDay: (data.half_day as boolean) ?? false,
      reason: (data.reason as string) || '',
      customLeaveType: data.custom_leave_type as string | undefined,
      attachmentUrl: data.attachment_url as string | undefined,
      adminComment: data.admin_comment as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapClaimRequest(data: Record<string, unknown>): ClaimRequest {
    return {
      id: data.id as string,
      type: 'Claim',
      userId: data.user_id as string,
      status: data.status as RequestStatus,
      amount: Number(data.amount) || 0,
      category: data.category as string,
      description: (data.description as string) || '',
      receiptMeta: data.receipt_file_name ? {
        fileName: data.receipt_file_name as string,
        fileSize: data.receipt_file_size as number,
        fileType: data.receipt_file_type as string,
        uploadedAt: data.receipt_uploaded_at as string,
      } : undefined,
      autoApproved: (data.auto_approved as boolean) ?? false,
      includedInPayrollMonth: data.included_in_payroll_month as string | undefined,
      linkedTrainingAppId: data.linked_training_app_id as string | undefined,
      attachmentUrl: data.attachment_url as string | undefined,
      adminComment: data.admin_comment as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapTrainingApplication(data: Record<string, unknown>): TrainingApplication {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      courseName: data.course_name as string,
      provider: data.provider as string,
      cost: Number(data.cost) || 0,
      link: data.link as string | undefined,
      justification: (data.justification as string) || '',
      status: data.status as TrainingApplicationStatus,
      attachmentUrl: data.attachment_url as string | undefined,
      createdAt: data.created_at as string,
      approvedAt: data.approved_at as string | undefined,
      completedAt: data.completed_at as string | undefined,
      claimedAt: data.claimed_at as string | undefined,
      includedInPayrollMonth: data.included_in_payroll_month as string | undefined,
    };
  }
}

export const requestsSupabaseRepo = new RequestsSupabaseRepo();
