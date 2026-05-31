// Patch 1.3 — Operating surface item types.
// Pure presentation/aggregation. No business logic.

export type ActionKind =
  | 'Acknowledge'
  | 'FixRequest'
  | 'ViewOutcome'
  | 'CompleteTask'
  | 'ViewPayslip'
  | 'OpenResource'
  | 'UploadProof'
  | 'Review'
  | 'ReviewPayroll'
  | 'OpenStaff'
  | 'GrantAccess'
  | 'ViewIssue'
  | 'OpenNotice';

export type Priority = 'urgent' | 'normal' | 'info';

export interface PendingItem {
  id: string;
  type:
    | 'AckNotice'
    | 'NeedsCorrection'
    | 'OnboardingTask'
    | 'NotionAccess'
    | 'PayslipReady'
    | 'RequestOutcome';
  title: string;
  description?: string;
  priority: Priority;
  createdAt?: string;
  primaryAction: ActionKind;
  href: string;
}

export type WorkbenchItemType =
  | 'Requests'
  | 'MC'
  | 'Claims'
  | 'Training'
  | 'Onboarding'
  | 'Offboarding'
  | 'Payroll'
  | 'Notices'
  | 'Access'
  | 'SystemIssues';

export interface WorkbenchItem {
  id: string;
  type: WorkbenchItemType;
  title: string;
  staffName?: string;
  staffId?: string;
  recordRef?: string;
  priority: Priority;
  createdAt?: string;
  status: string;
  primaryAction: ActionKind;
  href: string;
  source: WorkbenchItemType; // module source for filtering
}

export const ACTION_LABELS: Record<ActionKind, string> = {
  Acknowledge: 'Acknowledge',
  FixRequest: 'Fix Request',
  ViewOutcome: 'View Outcome',
  CompleteTask: 'Complete Task',
  ViewPayslip: 'View Payslip',
  OpenResource: 'Open Resource',
  UploadProof: 'Upload Proof',
  Review: 'Review',
  ReviewPayroll: 'Review Payroll',
  OpenStaff: 'Open Staff',
  GrantAccess: 'Grant Access',
  ViewIssue: 'View Issue',
  OpenNotice: 'Open Notice',
};
