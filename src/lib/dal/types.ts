// ============================================
// AIHQ Staff Portal - Data Types
// ============================================

// Roles
export type AppRole = 'admin' | 'staff';

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  businessArm: 'Training' | 'Solutions';
  joinDate: string; // ISO date
  isActive: boolean;
  salaryBase: number;
  epfRate: number; // percentage, e.g., 11
  socsoRate: number; // percentage
  avatarUrl?: string;
}

// Session
export interface Session {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

// ============================================
// REQUESTS
// ============================================

export type RequestType = 'Leave' | 'Claim' | 'Training';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'AL' | 'SL' | 'Custom';

export interface RequestBase {
  id: string;
  type: RequestType;
  userId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

export interface LeaveRequest extends RequestBase {
  type: 'Leave';
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  reason: string;
  customLeaveType?: string;
}

export interface ReceiptMeta {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface ClaimRequest extends RequestBase {
  type: 'Claim';
  amount: number;
  category: string;
  description: string;
  receiptMeta?: ReceiptMeta;
  autoApproved: boolean;
  includedInPayrollMonth?: string; // 'YYYY-MM'
  linkedTrainingAppId?: string;
}

export type TrainingApplicationStatus = 
  | 'Submitted' 
  | 'Approved' 
  | 'Rejected' 
  | 'Completed' 
  | 'Claimed';

export interface TrainingApplication {
  id: string;
  userId: string;
  courseName: string;
  provider: string;
  cost: number;
  link?: string;
  justification: string;
  status: TrainingApplicationStatus;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  claimedAt?: string;
  includedInPayrollMonth?: string; // 'YYYY-MM'
}

export interface TrainingEntitlement {
  userId: string;
  eligibleFrom: string; // ISO date (joinDate + 1 year)
  annualAmount: number; // default 1500
  usedAmount: number;
  overrideEligible?: boolean;
  overrideBalance?: number;
}

// Leave balances
export interface LeaveBalance {
  userId: string;
  year: number;
  alTotal: number; // Annual Leave total (default 14)
  alUsed: number;
  alCarryForward: number; // max 7
  slTotal: number; // Sick Leave total (default 10)
  slUsed: number;
}

// Union type for all requests
export type AnyRequest = LeaveRequest | ClaimRequest;

// ============================================
// INVOICES & BILLS (Entries)
// ============================================

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';
export type BillStatus = 'Draft' | 'Paid';
export type BusinessArm = 'Training' | 'Solutions';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  createdBy: string;
  invoiceNumber: string; // INVxxxxx
  businessArm: BusinessArm;
  clientName?: string;
  issueDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  total: number;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  createdBy: string;
  vendorName: string;
  category: string;
  amount: number;
  dueDate?: string;
  status: BillStatus;
  paidDate?: string;
  attachmentMeta?: ReceiptMeta;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PAYROLL
// ============================================

export type PayrollRunStatus = 'Draft' | 'Finalized';

export interface PayrollRun {
  id: string;
  month: string; // 'YYYY-MM'
  status: PayrollRunStatus;
  createdAt: string;
  finalizedAt?: string;
}

export interface PayrollItem {
  id: string;
  runId: string;
  userId: string;
  userName: string;
  baseSalary: number;
  epf: number;
  socso: number;
  claimsTotal: number;
  trainingClaimsTotal: number;
  netPay: number;
}

export interface Payslip {
  id: string;
  runId: string;
  userId: string;
  month: string; // 'YYYY-MM'
  baseSalary: number;
  epf: number;
  socso: number;
  claimsTotal: number;
  trainingClaimsTotal: number;
  netPay: number;
  createdAt: string;
}

// ============================================
// DOCUMENTS
// ============================================

export interface DocLink {
  id: string;
  title: string;
  category: string;
  url: string;
  description?: string;
  createdAt: string;
}

// ============================================
// APP SETTINGS
// ============================================

export interface AppSettings {
  invoiceCounter: number; // current counter for invoice numbering
  invoiceCounterYear: number; // resets yearly
}

// ============================================
// STATS (calculated, not stored)
// ============================================

export interface MonthlyStats {
  month: string; // 'YYYY-MM'
  revenue: number;
  revenueTraining: number;
  revenueSolutions: number;
  expenses: number;
  expensesPayroll: number;
  expensesBills: number;
}

export interface CompanyStats {
  currentMonth: MonthlyStats;
  trend: MonthlyStats[]; // last 6 months
}
