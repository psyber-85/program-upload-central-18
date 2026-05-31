// Patch 1.4 — Unified status badge with MC label override (§16).
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { RequestStatusDb, RequestKind, RequestSubState } from '@/lib/internal-hub/repos/requestRepo';

interface Props {
  status: RequestStatusDb;
  kind: RequestKind;
  subState?: RequestSubState;
}

export function statusLabel(status: RequestStatusDb, kind: RequestKind, subState?: RequestSubState): string {
  if (subState === 'TrainingCompleted') return 'Awaiting Claim';
  if (subState === 'ApplicationApproved') return 'Application Approved';
  if (kind === 'MC' && status === 'Approved') return 'Accepted / Recorded';
  if (status === 'NeedsCorrection') return 'Needs Correction';
  return status;
}

const variantFor = (status: RequestStatusDb) => {
  if (status === 'Approved') return 'default';
  if (status === 'Rejected' || status === 'Cancelled') return 'destructive';
  if (status === 'NeedsCorrection') return 'destructive';
  return 'secondary';
};

const RequestStatusBadge: React.FC<Props> = ({ status, kind, subState }) => {
  return <Badge variant={variantFor(status)}>{statusLabel(status, kind, subState)}</Badge>;
};

export default RequestStatusBadge;
