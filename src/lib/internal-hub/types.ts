// Doc 0.1 + 0.2 type model — frontend-first, local-data-backed.

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
  // Admin-only / payroll-impacting (Doc 0.1 §12, §15)
  baseSalary: number;
  epfRate: number; // percent
  socsoRate: number; // percent
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
