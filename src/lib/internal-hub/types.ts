// Doc 0.1 + 0.2 + 1.1 + 1.2 type model — frontend-first, local-data-backed.

export type HubRole = 'Admin' | 'Staff';
export type StaffStatus = 'Active' | 'Inactive';
export type BusinessArm = 'Training' | 'Solutions' | 'Admin/General';
export type OnboardingState = 'NotStarted' | 'InProgress' | 'Complete';

export interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  role: HubRole;
  jobTitle: string;
  businessArm: BusinessArm;
  joinDate: string; // ISO date
  status: StaffStatus;
  // Admin-only / payroll-impacting (Doc 0.1 §12, §15 + Patch 002 §5)
  baseSalary: number;
  epfRate: number; // percent — employee EPF
  socsoRate: number; // percent — employee SOCSO
  eisRate: number; // percent — employee EIS (Patch 002)
  employerEpfRate?: number; // optional defaults; falls back at calc time
  employerSocsoRate?: number;
  employerEisRate?: number;
  // Insurance (Doc 0.1 §13)
  insuranceCovered: boolean;
  insuranceStartDate?: string;
  insurancePolicyLink?: string;
  // Admin-only (Doc 0.1 §14)
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistOwner = 'admin' | 'staff';
export type ChecklistStatus = 'pending' | 'staff-checked' | 'admin-verified' | 'complete';

export interface ChecklistItem {
  key: string;
  label: string;
  owner: ChecklistOwner;
  status: ChecklistStatus;
  link?: string;
  completedAt?: string;
  verifiedBy?: string;
}

export interface OnboardingChecklist {
  staffId: string;
  items: ChecklistItem[];
}

// Doc 0.2 §12
export type ToolKey =
  | 'GoogleEmail'
  | 'GoogleDrive'
  | 'Notion'
  | 'ChatGPT'
  | 'Gemini'
  | 'YouTubeTraining'
  | 'AIHQSocial'
  | 'Other';

export type ToolAccessStatus =
  | 'NotNeeded'
  | 'Pending'
  | 'Granted'
  | 'Removed'
  | 'NeedsReview';

export interface ToolAccessItem {
  staffId: string;
  tool: ToolKey;
  label: string;
  link?: string;
  owner?: string;
  status: ToolAccessStatus;
  usageNote?: string;
  offboardingNote?: string;
  // NEVER: password, credentials, recovery codes (Doc 0.2 §13)
}

export interface OffboardingChecklist {
  staffId: string;
  startedAt: string;
  items: ChecklistItem[];
}

export type WelcomeEmailStatus = 'queued' | 'sent' | 'resent' | 'failed';

export interface WelcomeEmailEvent {
  staffId: string;
  status: WelcomeEmailStatus;
  queuedAt: string;
  sentAt?: string;
}

export const TOOL_LABELS: Record<ToolKey, string> = {
  GoogleEmail: 'Google / Company Email',
  GoogleDrive: 'Google Drive',
  Notion: 'Notion',
  ChatGPT: 'ChatGPT / OpenAI',
  Gemini: 'Gemini',
  YouTubeTraining: 'YouTube Training',
  AIHQSocial: 'AIHQ Social Media',
  Other: 'Other',
};

export const TOOL_STATUS_LABELS: Record<ToolAccessStatus, string> = {
  NotNeeded: 'Not Needed',
  Pending: 'Pending',
  Granted: 'Granted',
  Removed: 'Removed',
  NeedsReview: 'Needs Review',
};

// ============================================================
// Doc 1.2 — Notices
// ============================================================
export type NoticeType =
  | 'AdminBroadcast'
  | 'SystemNotification'
  | 'ResourceUpdate'
  | 'PayrollNotice'
  | 'AccessNotice'
  | 'DeadlineReminder'
  | 'GeneralAnnouncement';

export type NoticeImportance = 'Normal' | 'Important' | 'AcknowledgmentRequired';

export type NoticeAudience =
  | { kind: 'Everyone' }
  | { kind: 'Admin' }
  | { kind: 'Arm'; arm: BusinessArm }
  | { kind: 'Individual'; staffId: string };

export interface NoticeLink {
  label: string;
  url: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: NoticeType;
  importance: NoticeImportance;
  audience: NoticeAudience;
  links: NoticeLink[];
  createdBy: string; // staffId
  createdAt: string;
  publishedAt: string;
  emailRequired: boolean; // Doc 1.2 §12 — all admin broadcasts = true
  archived: boolean;
  editedAt?: string;
}

export interface NoticeReadState {
  noticeId: string;
  staffId: string;
  readAt: string;
}

export interface NoticeAck {
  noticeId: string;
  staffId: string;
  acknowledgedAt: string;
}

/** Doc 1.2 §12 — audit log entry created on every admin broadcast. */
export interface BroadcastLogEntry {
  id: string;
  noticeId: string;
  createdBy: string; // staffId
  createdAt: string;
  audience: NoticeAudience;
  recipientCount: number; // snapshot at broadcast time
  emailRequired: true;
  emailSentAt?: string; // reserved for future email integration
}

export const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  AdminBroadcast: 'Admin Broadcast',
  SystemNotification: 'System',
  ResourceUpdate: 'Resource Update',
  PayrollNotice: 'Payroll',
  AccessNotice: 'Access',
  DeadlineReminder: 'Deadline',
  GeneralAnnouncement: 'Announcement',
};

export const NOTICE_IMPORTANCE_LABELS: Record<NoticeImportance, string> = {
  Normal: 'Normal',
  Important: 'Important',
  AcknowledgmentRequired: 'Acknowledgment Required',
};

// ============================================================
// Doc 1.2 — Resources
// ============================================================
export type ResourceCategory =
  | 'YouTubeTraining'
  | 'NotionKB'
  | 'CompanyTools'
  | 'Policies'
  | 'Benefits'
  | 'ITSupport'
  | 'OnboardingMaterials';

export type ResourceStatus = 'Active' | 'Archived';

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  link: string; // may be mailto: for IT support
  description?: string;
  audience: NoticeAudience;
  owner?: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  external?: boolean;
}

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  YouTubeTraining: 'YouTube Training',
  NotionKB: 'Notion KB',
  CompanyTools: 'Company Tools',
  Policies: 'Policies / SOP',
  Benefits: 'Benefits',
  ITSupport: 'IT Support',
  OnboardingMaterials: 'Onboarding Materials',
};

// ============================================================
// Doc 1.1 — Preview shapes (workflows owned by Cards 2/3)
// ============================================================
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Submitted';
export interface RequestSummary {
  id: string;
  staffId: string;
  type: 'Leave' | 'MC' | 'Claim' | 'TrainingFund' | 'Insurance' | 'Other';
  status: RequestStatus;
  date: string;
}

export type PayslipStatus = 'Ready' | 'NotAvailable';
export interface PayslipSummary {
  id: string;
  staffId: string;
  month: string; // e.g. "2026-04"
  status: PayslipStatus;
}

export const IT_SUPPORT_EMAIL = 'wani@theaihq.net';

// ============================================================
// Doc 3.1 — Payroll Preparation & Finalization
// ============================================================
export type PayrollRunStatus =
  | 'NotPrepared'
  | 'Draft'
  | 'ReadyForReview'
  | 'Finalized'
  | 'Locked';

export type PayrollItemRowStatus = 'Complete' | 'Incomplete';

export type ClaimInclusionState =
  | 'NotIncluded'
  | 'QueuedForPayroll'
  | 'IncludedInPayroll';

export interface ManualAdjustment {
  amount: number; // may be positive or negative (Doc 3.1 §21)
  reason: string; // required
}

export type PayrollMissingField = 'baseSalary' | 'epfRate' | 'socsoRate' | 'eisRate';

export interface PayrollItem {
  staffId: string;
  staffName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  // Employee statutory (Patch 002 §4)
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  totalEmployeeDeductions: number;
  // Employer statutory (Patch 002 §4)
  employerEpf: number;
  employerSocso: number;
  employerEis: number;
  totalEmployerContribution: number;
  // Additions (Patch 002 §11)
  claimsTotal: number;
  trainingClaimsTotal: number;
  bonusTotal: number;
  otherAdditionTotal: number;
  adjustment: ManualAdjustment | null;
  netPay: number;
  rowStatus: PayrollItemRowStatus;
  missingFields: PayrollMissingField[];
  includedClaimIds: string[];
  includedTrainingClaimIds: string[];
  notes?: string;
}

export interface PayrollRun {
  id: string;
  month: string; // YYYY-MM
  status: PayrollRunStatus;
  items: PayrollItem[];
  adminNotes?: string;
  createdAt: string;
  preparedAt?: string;
  finalizedAt?: string;
  finalizedBy?: string;
  lockedAt?: string;
}

export type ClaimType = 'Claim' | 'TrainingClaim';

export interface ApprovedClaim {
  id: string;
  staffId: string;
  type: ClaimType;
  amount: number;
  description?: string;
  approvedAt: string; // ISO date
  inclusionState: ClaimInclusionState;
  includedInPayrollRunId?: string;
  includedInMonth?: string;
}

export const PAYROLL_STATUS_LABELS: Record<PayrollRunStatus, string> = {
  NotPrepared: 'Not Prepared',
  Draft: 'Draft',
  ReadyForReview: 'Ready for Review',
  Finalized: 'Finalized',
  Locked: 'Locked',
};

export const PAYROLL_MISSING_FIELD_LABELS: Record<PayrollMissingField, string> = {
  baseSalary: 'Base salary',
  epfRate: 'EPF rate',
  socsoRate: 'SOCSO rate',
  eisRate: 'EIS rate',
};

// ============================================================
// Doc 3.2 — Payslips
// ============================================================
export type PayslipAvailability =
  | 'NotGenerated'
  | 'Generated'
  | 'Available'
  | 'Error';

export interface Payslip {
  id: string;
  payrollRunId: string;
  staffId: string;
  staffName: string;
  month: string;
  baseSalary: number;
  // Employee statutory (Patch 002 §12)
  epf: number;
  socso: number;
  eis: number;
  totalEmployeeDeductions: number;
  // Employer statutory (Patch 002 §15)
  employerEpf: number;
  employerSocso: number;
  employerEis: number;
  totalEmployerContribution: number;
  // Additions (Patch 002 §11)
  claimsTotal: number;
  trainingClaimsTotal: number;
  bonusTotal: number;
  otherAdditionTotal: number;
  adjustment: ManualAdjustment | null;
  netPay: number;
  finalizedAt: string;
  availability: PayslipAvailability;
  pdfRef?: string;
  correctionRef?: string;
}

export interface PayslipDownloadLogEntry {
  id: string;
  payslipId: string;
  actorId: string;
  actorRole: HubRole;
  downloadedAt: string;
}

export const PAYSLIP_AVAILABILITY_LABELS: Record<PayslipAvailability, string> = {
  NotGenerated: 'Not Generated',
  Generated: 'Generated',
  Available: 'Available',
  Error: 'Error',
};

export const CONFIDENTIAL_PAYSLIP_LABEL = 'Confidential payroll document';

// ============================================================
// Doc 3.3 — Admin Finance Snapshot
// ============================================================
export type FinanceLineCategory =
  | 'Income'
  | 'Expense'
  | 'TransferAdjustment'
  | 'Other';

export interface FinanceLineItem {
  id: string;
  snapshotId: string;
  category: FinanceLineCategory;
  amount: number;
  note: string;
  link?: string;
  createdAt: string;
  createdBy: string;
  isCorrection?: boolean;
}

export type FinanceSnapshotStatus = 'Draft' | 'Reviewed' | 'Locked';

export interface FinanceSnapshot {
  id: string;
  month: string; // YYYY-MM
  status: FinanceSnapshotStatus;
  openingBalance?: number;
  closingBalance?: number;
  payrollTotal: number;
  claimsTotal: number;
  trainingClaimsTotal: number;
  /** @deprecated Patch 002 §22 — use employeeStatutoryTotal / employerStatutoryTotal instead. */
  epfSocsoTotal: number;
  employeeStatutoryTotal: number;
  employerStatutoryTotal: number;
  epfTotal: number;
  socsoTotal: number;
  eisTotal: number;
  bonusTotal: number;
  manualAdjustmentTotal: number;
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const FINANCE_CATEGORY_LABELS: Record<FinanceLineCategory, string> = {
  Income: 'Income',
  Expense: 'Expense',
  TransferAdjustment: 'Transfer / Adjustment',
  Other: 'Other',
};

export const FINANCE_STATUS_LABELS: Record<FinanceSnapshotStatus, string> = {
  Draft: 'Draft',
  Reviewed: 'Reviewed',
  Locked: 'Locked',
};

export const FINANCE_SNAPSHOT_DISCLAIMER =
  'Internal monthly reference — not accounting, tax, or bank reconciliation.';
