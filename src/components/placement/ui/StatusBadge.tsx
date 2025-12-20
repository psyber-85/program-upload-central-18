import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  RoleRequestStatus, 
  CandidateStatus, 
  LOIStatus, 
  MatchStatus,
  GrantCaseStatus,
  TrainingEnrollmentStatus 
} from '@/lib/placement/types';

type StatusType = 
  | RoleRequestStatus 
  | CandidateStatus 
  | LOIStatus 
  | MatchStatus 
  | GrantCaseStatus
  | TrainingEnrollmentStatus;

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Role Request statuses
  SCOPING: { label: 'Scoping', variant: 'secondary' },
  REVIEWING: { label: 'Reviewing', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  MATCHING: { label: 'Matching', variant: 'outline', className: 'border-amber-500 text-amber-600' },
  INTERVIEWING: { label: 'Interviewing', variant: 'outline', className: 'border-purple-500 text-purple-600' },
  LOI_PENDING: { label: 'LOI Pending', variant: 'outline', className: 'border-orange-500 text-orange-600' },
  PLACED: { label: 'Placed', variant: 'default', className: 'bg-green-600' },
  CLOSED: { label: 'Closed', variant: 'secondary' },

  // Candidate statuses
  NEW_INTAKE: { label: 'New Intake', variant: 'secondary' },
  ASSESSMENT_PENDING: { label: 'Assessment Pending', variant: 'outline' },
  TRAINING_IN_PROGRESS: { label: 'In Training', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  PLACEMENT_READY: { label: 'Placement Ready', variant: 'default', className: 'bg-green-600' },
  PROPOSED_TO_EMPLOYER: { label: 'Proposed', variant: 'outline', className: 'border-amber-500 text-amber-600' },
  LOI_SIGNED: { label: 'LOI Signed', variant: 'default', className: 'bg-green-600' },
  TRAINING_SCHEDULED: { label: 'Training Scheduled', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  TRAINING_COMPLETED: { label: 'Training Complete', variant: 'default', className: 'bg-green-600' },

  // LOI statuses
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PENDING_REVIEW: { label: 'Pending Review', variant: 'outline', className: 'border-amber-500 text-amber-600' },
  PENDING_SIGNATURE: { label: 'Pending Signature', variant: 'outline', className: 'border-orange-500 text-orange-600' },
  SIGNED: { label: 'Signed', variant: 'default', className: 'bg-green-600' },
  UPLOADED: { label: 'Uploaded', variant: 'default', className: 'bg-green-600' },
  HOLD: { label: 'On Hold', variant: 'outline', className: 'border-slate-500 text-slate-600' },
  NOT_PROCEEDING: { label: 'Not Proceeding', variant: 'secondary' },

  // Match statuses
  PROPOSED: { label: 'Proposed', variant: 'secondary' },
  EMPLOYER_REVIEWING: { label: 'Employer Reviewing', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  INTERVIEW_REQUESTED: { label: 'Interview Requested', variant: 'outline', className: 'border-amber-500 text-amber-600' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', variant: 'outline', className: 'border-purple-500 text-purple-600' },
  INTERVIEW_COMPLETED: { label: 'Interview Done', variant: 'outline', className: 'border-green-500 text-green-600' },
  EMPLOYER_INTERESTED: { label: 'Interested', variant: 'default', className: 'bg-green-600' },
  PROCEEDING_TO_LOI: { label: 'Proceeding to LOI', variant: 'default', className: 'bg-green-600' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary' },
  
  // Safe exit statuses - calm, non-punitive styling
  NOT_PROCEEDING_FIT: { label: 'Not Proceeding', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  WITHDRAWN_BY_EMPLOYER: { label: 'Closed', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  TRAINING_COMPLETED_NOT_HIRED: { label: 'Training Complete', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  CLOSED_NO_HIRE: { label: 'Closed', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  CLOSED_REPLACED_BY_ALTERNATIVE: { label: 'Replaced', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },

  // Grant statuses
  PENDING: { label: 'Pending', variant: 'secondary' },
  SUBMITTED: { label: 'Submitted', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  APPROVED: { label: 'Approved', variant: 'default', className: 'bg-green-600' },
  REJECTED_GRANT: { label: 'Rejected', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'default' },

  // Training statuses
  ENROLLED: { label: 'Enrolled', variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  DROPPED: { label: 'Dropped', variant: 'destructive' },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = statusConfigs[status] || { label: status, variant: 'secondary' as const };
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        size === 'sm' && 'text-xs px-2 py-0',
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}
