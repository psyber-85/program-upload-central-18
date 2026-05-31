// Patch 1.4 §8 — derives staff next action from (kind, status, sub_state).
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { RequestRow } from '@/lib/internal-hub/repos/requestRepo';

export function getNextAction(row: RequestRow): { label: string; href: string } | null {
  const id = row.id;
  if (row.status === 'NeedsCorrection') return { label: 'Fix Request', href: `/staff/requests/${id}` };
  if (row.status === 'Rejected') return { label: 'View Outcome', href: `/staff/requests/${id}` };
  if (row.status === 'Approved') {
    if (row.kind === 'Training' && row.sub_state === 'ApplicationApproved') {
      return { label: 'Mark Completed', href: `/staff/requests/${id}` };
    }
    if (row.kind === 'Training' && row.sub_state === 'TrainingCompleted') {
      return { label: 'Submit Training Claim', href: `/staff/requests/${id}` };
    }
    if (row.kind === 'MC') return { label: 'View', href: `/staff/requests/${id}` };
    return { label: 'View Outcome', href: `/staff/requests/${id}` };
  }
  if (row.status === 'Submitted') {
    if (row.kind === 'MC' && !row.payload?.proof_waived) {
      // Most MC will already have proof at submit time. If missing flag is set, prompt upload.
    }
    return { label: 'View', href: `/staff/requests/${id}` };
  }
  return { label: 'View', href: `/staff/requests/${id}` };
}

const NextActionButton: React.FC<{ row: RequestRow }> = ({ row }) => {
  const action = getNextAction(row);
  if (!action) return null;
  return (
    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
      <Link to={action.href}>{action.label}</Link>
    </Button>
  );
};

export default NextActionButton;
