// Patch 1.4 §7 — Activity timeline rendering.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestEventsRepo, type RequestEventType } from '@/lib/internal-hub/repos/requestEventsRepo';
import {
  CheckCircle2, XCircle, AlertCircle, FileUp, RotateCcw, Send, Trophy,
  ShieldCheck, Wallet, Clock,
} from 'lucide-react';

const LABELS: Record<RequestEventType, string> = {
  Submitted: 'Submitted',
  AutoApproved: 'Auto-Approved',
  AdminReviewed: 'Admin Reviewed',
  NeedsCorrection: 'Needs Correction',
  Resubmitted: 'Staff Resubmitted',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Completed: 'Completed',
  IncludedInPayroll: 'Included in Payroll',
  AttachmentAdded: 'Attachment Added',
  ProofWaived: 'Proof Waived',
  TrainingCompleted: 'Training Completed',
};

const ICONS: Record<RequestEventType, React.ComponentType<{ className?: string }>> = {
  Submitted: Send,
  AutoApproved: CheckCircle2,
  AdminReviewed: Clock,
  NeedsCorrection: AlertCircle,
  Resubmitted: RotateCcw,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Completed: Trophy,
  IncludedInPayroll: Wallet,
  AttachmentAdded: FileUp,
  ProofWaived: ShieldCheck,
  TrainingCompleted: Trophy,
};

const RequestTimeline: React.FC<{ requestId: string }> = ({ requestId }) => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['ih-request-events', requestId],
    queryFn: () => requestEventsRepo.list(requestId),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading timeline…</p>;
  if (events.length === 0) return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>;

  return (
    <ol className="relative border-l border-border ml-3 space-y-3">
      {events.map((e) => {
        const Icon = ICONS[e.event_type as RequestEventType] ?? Clock;
        return (
          <li key={e.id} className="ml-4">
            <span className="absolute -left-2.5 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
              <Icon className="h-3 w-3 text-foreground" />
            </span>
            <div className="text-sm font-medium text-foreground">
              {LABELS[e.event_type as RequestEventType] ?? e.event_type}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
            {e.note && <div className="text-xs text-foreground mt-0.5">{e.note}</div>}
          </li>
        );
      })}
    </ol>
  );
};

export default RequestTimeline;
