import { Badge } from '@/components/ui/badge';
import type { RoleStatus, SubmissionStage, LOIStatus, CompanyStatus } from '@/lib/placement/types';

// Role Status
const roleStatusConfig: Record<RoleStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  OPEN: { label: 'Open', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  INTERVIEWING: { label: 'Interviewing', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SELECTING: { label: 'Selecting', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  SELECTED: { label: 'Selected', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  PLACED: { label: 'Placed', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CLOSED: { label: 'Closed', className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400' },
};

// Submission Stage
const stageConfig: Record<SubmissionStage, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SHORTLISTED: { label: 'Shortlisted', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  INTERVIEW_REQUESTED: { label: 'Interview Requested', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  INTERVIEWED: { label: 'Interviewed', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  OFFERED: { label: 'Offered', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  SELECTED: { label: 'Selected', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

// LOI Status
const loiStatusConfig: Record<LOIStatus, { label: string; className: string }> = {
  NOT_REQUESTED: { label: 'Not Required', className: 'bg-muted text-muted-foreground' },
  REQUESTED: { label: 'Requested', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  DOWNLOADED: { label: 'Downloaded', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  UPLOADED_SIGNED: { label: 'Pending Review', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  VERIFIED: { label: 'Verified', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

// Company Status
const companyStatusConfig: Record<CompanyStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  SUSPENDED: { label: 'Suspended', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

interface StatusBadgeProps {
  type: 'role' | 'stage' | 'loi' | 'company';
  value: string;
  className?: string;
}

export function StatusBadge({ type, value, className = '' }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;

  switch (type) {
    case 'role':
      config = roleStatusConfig[value as RoleStatus];
      break;
    case 'stage':
      config = stageConfig[value as SubmissionStage];
      break;
    case 'loi':
      config = loiStatusConfig[value as LOIStatus];
      break;
    case 'company':
      config = companyStatusConfig[value as CompanyStatus];
      break;
  }

  if (!config) {
    return <Badge variant="outline" className={className}>{value}</Badge>;
  }

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
