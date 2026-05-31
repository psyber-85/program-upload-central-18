// Patch 1.3 §5–§8 — Staff My Pending Items aggregator.
// Pure functions over already-fetched data. No new business logic.

import type { Notice, NoticeAck, Payslip, OnboardingChecklist, ToolAccessItem, StaffProfile } from '../types';
import type { RequestDetail } from '../repos/requestSummaryRepo';
import { isNotionUnlocked } from '../lifecycle';
import type { PendingItem } from './types';

interface BuildInput {
  staff: StaffProfile;
  notices: Notice[];
  acks: Map<string, NoticeAck>;
  needsCorrection: RequestDetail[];
  recentDecided: RequestDetail[]; // Approved/Rejected, recent
  onboarding?: OnboardingChecklist;
  toolAccess?: ToolAccessItem[];
  latestPayslip?: Payslip;
}

const STORAGE_VIEWED_KEY = 'ih-pending-viewed';

function getViewedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_VIEWED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markViewed(itemId: string) {
  const set = getViewedSet();
  set.add(itemId);
  try {
    localStorage.setItem(STORAGE_VIEWED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function buildPendingItems(input: BuildInput): PendingItem[] {
  const { staff, notices, acks, needsCorrection, recentDecided, onboarding, toolAccess, latestPayslip } = input;
  const viewed = getViewedSet();
  const items: PendingItem[] = [];

  // 1. Ack-required notices
  for (const n of notices) {
    if (n.importance === 'AcknowledgmentRequired' && !acks.has(n.id)) {
      items.push({
        id: `ack:${n.id}`,
        type: 'AckNotice',
        title: n.title,
        description: 'Acknowledgment required',
        priority: 'urgent',
        createdAt: n.publishedAt,
        primaryAction: 'Acknowledge',
        href: `/staff/notices/${n.id}`,
      });
    }
  }

  // 2. Needs Correction
  for (const r of needsCorrection) {
    items.push({
      id: `fix:${r.id}`,
      type: 'NeedsCorrection',
      title: `${r.type} request needs correction`,
      description: 'Update and resubmit',
      priority: 'urgent',
      createdAt: r.date,
      primaryAction: 'FixRequest',
      href: `/staff/requests`,
    });
  }

  // 3. Payslip ready (not yet viewed)
  if (latestPayslip && (latestPayslip.availability === 'Available' || latestPayslip.availability === 'Generated')) {
    const key = `payslip:${latestPayslip.id}`;
    if (!viewed.has(key)) {
      items.push({
        id: key,
        type: 'PayslipReady',
        title: `Payslip available — ${latestPayslip.month}`,
        description: 'Tap to view your latest payslip',
        priority: 'normal',
        createdAt: latestPayslip.finalizedAt,
        primaryAction: 'ViewPayslip',
        href: `/staff/payslips/${latestPayslip.id}`,
      });
    }
  }

  // 4. Onboarding starter tasks incomplete (staff-owned)
  if (onboarding) {
    const incomplete = onboarding.items.filter(
      (i) => i.owner === 'staff' && i.status !== 'complete' && i.status !== 'admin-verified',
    );
    if (incomplete.length > 0) {
      items.push({
        id: `onboarding:${staff.id}`,
        type: 'OnboardingTask',
        title: `${incomplete.length} onboarding task${incomplete.length === 1 ? '' : 's'} to complete`,
        description: incomplete.slice(0, 2).map((i) => i.label).join(', ') + (incomplete.length > 2 ? '…' : ''),
        priority: 'normal',
        primaryAction: 'CompleteTask',
        href: '/staff/profile',
      });
    }
  }

  // 5. Notion access eligible but not granted
  if (toolAccess && isNotionUnlocked(staff.joinDate)) {
    const notion = toolAccess.find((t) => t.tool === 'Notion');
    if (notion && notion.status === 'Pending') {
      items.push({
        id: `notion:${staff.id}`,
        type: 'NotionAccess',
        title: 'Notion access available',
        description: 'You are eligible. Open Resources to continue.',
        priority: 'info',
        primaryAction: 'OpenResource',
        href: '/staff/resources',
      });
    }
  }

  // 6. Outcome not yet viewed (recent decided)
  for (const r of recentDecided) {
    const key = `outcome:${r.id}`;
    if (!viewed.has(key)) {
      items.push({
        id: key,
        type: 'RequestOutcome',
        title: `${r.type} ${r.rawStatus === 'Approved' ? 'approved' : 'rejected'}`,
        description: 'View outcome',
        priority: 'info',
        createdAt: r.date,
        primaryAction: 'ViewOutcome',
        href: `/staff/requests`,
      });
    }
  }

  // Order: urgent first, then normal, then info — stable within groups.
  const rank: Record<PendingItem['priority'], number> = { urgent: 0, normal: 1, info: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
