// Patch 1.3 §9–§12 — Admin Workbench aggregator.
import type { StaffProfile, PayrollRunStatus } from '../types';
import type { RequestDetail } from '../repos/requestSummaryRepo';
import type { SystemIssue } from '../repos/systemIssuesRepo';
import { onboardingRepo } from '../repos/onboardingRepo';
import { offboardingRepo } from '../repos/offboardingRepo';
import { toolAccessRepo } from '../repos/toolAccessRepo';
import { isNotionUnlocked, checklistProgress } from '../lifecycle';
import type { WorkbenchItem, WorkbenchItemType } from './types';

interface BuildInput {
  pendingApprovals: RequestDetail[];
  staff: StaffProfile[];
  systemIssues: SystemIssue[];
  payrollMonth: string;
  payrollStatus: PayrollRunStatus | 'NotPrepared';
  totalAcksRequired?: number;
  totalAcksReceived?: number;
}

function kindToType(kind: RequestDetail['rawKind']): WorkbenchItemType {
  if (kind === 'MC') return 'MC';
  if (kind === 'Claim') return 'Claims';
  if (kind === 'Training') return 'Training';
  return 'Requests'; // Leave + Benefit roll into Requests bucket
}

export function buildWorkbenchItems(input: BuildInput): WorkbenchItem[] {
  const { pendingApprovals, staff, systemIssues, payrollMonth, payrollStatus, totalAcksRequired, totalAcksReceived } = input;
  const items: WorkbenchItem[] = [];
  const staffById = new Map(staff.map((s) => [s.id, s]));

  // Pending approvals (split by source for filtering)
  for (const r of pendingApprovals) {
    const t = kindToType(r.rawKind);
    const s = staffById.get(r.staffId);
    items.push({
      id: `req:${r.id}`,
      type: t,
      source: t,
      title: `${r.rawKind} request`,
      staffName: s?.fullName,
      staffId: r.staffId,
      recordRef: r.id.slice(0, 8),
      priority: 'urgent',
      createdAt: r.date,
      status: 'Submitted',
      primaryAction: 'Review',
      href: `/staff/admin/approvals?req=${r.id}`,
    });
  }

  // Onboarding / Offboarding / Notion access (per active staff)
  // Patch 1.7 — onboarding/offboarding repos are still per-device (localStorage);
  // only emit items when the local checklist shows actual progress (>0 items
  // touched) so we don't surface phantom rows for staff this device has never
  // opened. Full Supabase migration is deferred to a later patch.
  for (const s of staff) {
    if (s.status !== 'Active') continue;
    const ob = onboardingRepo.get(s.id);
    const p = checklistProgress(ob.items);
    if (p.done < p.total && p.done > 0) {
      items.push({
        id: `onb:${s.id}`,
        type: 'Onboarding',
        source: 'Onboarding',
        title: 'Onboarding incomplete',
        staffName: s.fullName,
        staffId: s.id,
        priority: 'normal',
        status: `${p.done}/${p.total}`,
        primaryAction: 'OpenStaff',
        href: `/staff/admin/staff/${s.id}`,
      });
    }
    const offb = offboardingRepo.get(s.id);
    if (offb) {
      const op = checklistProgress(offb.items);
      if (op.done < op.total) {
        items.push({
          id: `off:${s.id}`,
          type: 'Offboarding',
          source: 'Offboarding',
          title: 'Offboarding incomplete',
          staffName: s.fullName,
          staffId: s.id,
          priority: 'urgent',
          status: `${op.done}/${op.total}`,
          primaryAction: 'OpenStaff',
          href: `/staff/admin/staff/${s.id}`,
        });
      }
    }
    if (isNotionUnlocked(s.joinDate)) {
      const tools = toolAccessRepo.get(s.id);
      const notion = tools.find((t) => t.tool === 'Notion');
      if (notion && notion.status === 'Pending') {
        items.push({
          id: `notion:${s.id}`,
          type: 'Access',
          source: 'Access',
          title: 'Notion access eligible',
          staffName: s.fullName,
          staffId: s.id,
          priority: 'normal',
          status: 'Pending',
          primaryAction: 'GrantAccess',
          href: `/staff/admin/staff/${s.id}`,
        });
      }
    }
  }

  // Payroll status
  if (payrollStatus === 'Draft' || payrollStatus === 'ReadyForReview') {
    items.push({
      id: `payroll:${payrollMonth}`,
      type: 'Payroll',
      source: 'Payroll',
      title: payrollStatus === 'ReadyForReview' ? `Payroll ready for review — ${payrollMonth}` : `Payroll draft — ${payrollMonth}`,
      priority: payrollStatus === 'ReadyForReview' ? 'urgent' : 'normal',
      status: payrollStatus === 'ReadyForReview' ? 'Ready for Review' : 'Draft',
      primaryAction: 'ReviewPayroll',
      href: '/staff/admin/payroll',
    });
  } else if (payrollStatus === 'NotPrepared') {
    const day = new Date().getUTCDate();
    if (day >= 25) {
      items.push({
        id: `payroll-reminder:${payrollMonth}`,
        type: 'Payroll',
        source: 'Payroll',
        title: `Payroll not started — ${payrollMonth}`,
        priority: 'urgent',
        status: 'Not Prepared',
        primaryAction: 'ReviewPayroll',
        href: '/staff/admin/payroll',
      });
    }
  }

  // Unacknowledged notices summary (optional)
  if (typeof totalAcksRequired === 'number' && typeof totalAcksReceived === 'number') {
    const ackGap = totalAcksRequired - totalAcksReceived;
    if (ackGap > 0) {
      items.push({
        id: `acks:${payrollMonth}`,
        type: 'Notices',
        source: 'Notices',
        title: `${ackGap} acknowledgment${ackGap === 1 ? '' : 's'} outstanding`,
        priority: 'normal',
        status: `${totalAcksReceived}/${totalAcksRequired}`,
        primaryAction: 'OpenNotice',
        href: '/staff/notices',
      });
    }
  }

  // System Issues (unresolved)
  for (const i of systemIssues) {
    items.push({
      id: `issue:${i.id}`,
      type: 'SystemIssues',
      source: 'SystemIssues',
      title: i.summary,
      priority: 'urgent',
      createdAt: i.createdAt,
      status: 'Open',
      primaryAction: 'ViewIssue',
      href: '/staff/admin/system-issues',
    });
  }

  const rank: Record<WorkbenchItem['priority'], number> = { urgent: 0, normal: 1, info: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

export const WORKBENCH_TYPE_LABELS: Record<WorkbenchItemType, string> = {
  Requests: 'Requests',
  MC: 'MC / Leave',
  Claims: 'Claims',
  Training: 'Training',
  Onboarding: 'Onboarding',
  Offboarding: 'Offboarding',
  Payroll: 'Payroll',
  Notices: 'Notices',
  Access: 'Access',
  SystemIssues: 'System Issues',
};
