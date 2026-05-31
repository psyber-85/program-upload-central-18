import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarPlus, FileHeart, FileText, GraduationCap, Heart, MoreHorizontal, Receipt, Mail,
  Megaphone, ClipboardCheck, UserPlus, Banknote, BarChart3, BookOpen,
} from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import {
  noticeRepo, resourceRepo, requestSummaryRepo, payslipRepo, onboardingRepo, staffRepo,
  payrollRepo, financeSnapshotRepo,
} from '@/lib/internal-hub';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { checklistProgress } from '@/lib/internal-hub/lifecycle';
import { IT_SUPPORT_EMAIL, PAYROLL_STATUS_LABELS, FINANCE_STATUS_LABELS } from '@/lib/internal-hub/types';
import SummaryCard from '@/components/internal-hub/home/SummaryCard';
import QuickActionsGrid, { QuickActionItem } from '@/components/internal-hub/home/QuickActionsGrid';
import LatestNoticesPreview from '@/components/internal-hub/home/LatestNoticesPreview';
import MyRecentRequestsPreview from '@/components/internal-hub/home/MyRecentRequestsPreview';
import MyPayslipsPreview from '@/components/internal-hub/home/MyPayslipsPreview';
import SectionsGrid from '@/components/internal-hub/home/SectionsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StaffHome = () => {
  const { currentStaff } = useHub();
  const [tick] = useState(0);
  void tick;

  const isAdmin = canAccessAdminArea(currentStaff);

  // Admin needs full staff list for the onboarding-in-progress metric; staff don't.
  const { data: allStaff = [] } = useQuery({
    queryKey: ['ih-staff-list'],
    queryFn: () => staffRepo.list(),
    enabled: isAdmin,
  });
  const { data: noticesAll = [] } = useQuery({
    queryKey: ['ih-notices', { includeArchived: false }],
    queryFn: () => noticeRepo.list(false),
    enabled: !!currentStaff,
  });
  const notices = useMemo(() => noticesAll.slice(0, 3), [noticesAll]);
  const { data: readSet = new Set<string>() } = useQuery({
    queryKey: ['ih-notice-reads', currentStaff?.id],
    queryFn: () => noticeRepo.listReadsForStaff(currentStaff!.id),
    enabled: !!currentStaff,
  });
  const { data: ackMap = new Map<string, unknown>() } = useQuery({
    queryKey: ['ih-notice-acks', currentStaff?.id],
    queryFn: () => noticeRepo.listAcksForStaff(currentStaff!.id),
    enabled: !!currentStaff,
  });
  const { data: requests = [] } = useQuery({
    queryKey: ['ih-requests-recent', currentStaff?.id],
    queryFn: () => requestSummaryRepo.listForStaff(currentStaff!.id, 3),
    enabled: !!currentStaff,
  });
  const { data: myPendingRequests = 0 } = useQuery({
    queryKey: ['ih-requests-pending-self', currentStaff?.id],
    queryFn: () => requestSummaryRepo.pendingCountForStaff(currentStaff!.id),
    enabled: !!currentStaff,
  });
  const { data: pendingApprovals = 0 } = useQuery({
    queryKey: ['ih-requests-pending-all'],
    queryFn: () => requestSummaryRepo.pendingApprovalCount(),
    enabled: isAdmin,
  });
  const { data: payslips = [] } = useQuery({
    queryKey: ['ih-payslips-recent', currentStaff?.id],
    queryFn: () => payslipRepo.listForStaff(currentStaff!.id, 2),
    enabled: !!currentStaff,
  });
  const { data: payrollStatusRaw = 'NotPrepared' } = useQuery({
    queryKey: ['ih-payroll-status', /* month */ undefined],
    queryFn: () => {
      const d = new Date();
      const m = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      return payrollRepo.statusFor(m);
    },
    enabled: !!currentStaff,
  });

  // Doc 3.1 §7 — idempotent payroll reminder (admin, after the 25th).
  useEffect(() => {
    if (!currentStaff || !isAdmin) return;
    const d = new Date();
    const m = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    void payrollRepo.ensureReminderForMonth(m, currentStaff.id);
  }, [currentStaff?.id, isAdmin]);

  if (!currentStaff) return null;

  const unread = noticesAll.filter((n) => !readSet.has(n.id)).length;
  const ackPending = noticesAll.filter((n) => n.importance === 'AcknowledgmentRequired' && !ackMap.has(n.id)).length;

  // Admin metrics
  const inProgressOnboardings = isAdmin
    ? allStaff.filter((s) => {
        const c = onboardingRepo.get(s.id);
        const p = checklistProgress(c.items);
        return p.done > 0 && p.done < p.total;
      }).length
    : 0;

  const month = (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  })();
  const payrollStatus = PAYROLL_STATUS_LABELS[payrollStatusRaw];
  const financeStatusRaw = financeSnapshotRepo.statusFor(month);
  const financeStatus = financeStatusRaw === 'NotStarted' ? 'Not Started' : FINANCE_STATUS_LABELS[financeStatusRaw];
  const latestPayslip = payslips[0];

  const summaries = isAdmin
    ? [
        { title: 'Pending Approvals', value: pendingApprovals, tone: pendingApprovals > 0 ? 'attention' : 'muted', to: '/staff/admin/approvals' },
        { title: 'Staff Onboarding', value: inProgressOnboardings, caption: 'in progress', tone: 'default', to: '/staff/admin/staff' },
        { title: 'Payroll', value: payrollStatus, caption: month, tone: 'muted', to: '/staff/admin/payroll' },
        { title: 'Finance Snapshot', value: financeStatus, caption: month, tone: 'muted', to: '/staff/admin/finance' },
      ] as const
    : [
        { title: 'My Pending Actions', value: ackPending + myPendingRequests, tone: ackPending + myPendingRequests > 0 ? 'attention' : 'success', caption: ackPending + myPendingRequests === 0 ? "You're all caught up." : undefined, to: '/staff/notices' },
        { title: 'My Requests', value: myPendingRequests, caption: 'pending', tone: 'muted', to: '/staff/requests' },
        { title: 'Notices / Ack', value: unread, caption: ackPending > 0 ? `${ackPending} ack required` : undefined, tone: ackPending > 0 ? 'attention' : 'muted', to: '/staff/notices' },
        { title: 'Payslip Status', value: latestPayslip ? latestPayslip.availability : 'No payslip', tone: 'muted', to: '/staff/payslips' },
      ] as const;

  const staffActions: QuickActionItem[] = [
    { label: 'Apply Leave', icon: CalendarPlus, to: '/staff/requests?type=leave' },
    { label: 'Upload MC', icon: FileHeart, to: '/staff/requests?type=mc' },
    { label: 'Submit Claim', icon: Receipt, to: '/staff/requests?type=claim' },
    { label: 'Apply Training Fund', icon: GraduationCap, to: '/staff/requests?type=training' },
    { label: 'Insurance / Benefit', icon: Heart, to: '/staff/requests?type=insurance' },
    { label: 'Other Request', icon: MoreHorizontal, to: '/staff/requests?type=other' },
    { label: 'View Payslips', icon: Receipt, to: '/staff/payslips' },
    { label: 'Email IT Support', icon: Mail, href: `mailto:${IT_SUPPORT_EMAIL}` },
  ];

  const adminActions: QuickActionItem[] = [
    { label: 'Broadcast Notice', icon: Megaphone, to: '/staff/admin/notices/new' },
    { label: 'Review Approvals', icon: ClipboardCheck, to: '/staff/admin/approvals' },
    { label: 'Add Staff', icon: UserPlus, to: '/staff/admin/staff/new' },
    { label: 'View Payroll', icon: Banknote, to: '/staff/admin/payroll' },
    { label: 'Finance Snapshot', icon: BarChart3, to: '/staff/admin/finance' },
    { label: 'Manage Resources', icon: BookOpen, to: '/staff/admin/resources' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Welcome header */}
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {currentStaff.fullName.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening at AIHQ.</p>
      </header>

      {/* 2. Operational summary cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaries.map((s) => (
          <SummaryCard
            key={s.title}
            title={s.title}
            value={s.value}
            caption={s.caption}
            tone={s.tone as any}
            to={s.to}
          />
        ))}
      </section>

      {/* 3. Quick Actions */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Quick Actions</h2>
        <QuickActionsGrid items={isAdmin ? [...adminActions, ...staffActions] : staffActions} />
      </section>

      {/* 4. Latest Notices preview */}
      <LatestNoticesPreview
        notices={notices}
        readSet={readSet}
      />

      {/* 5–6. Requests + Payslips previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MyRecentRequestsPreview items={requests} />
        <MyPayslipsPreview items={payslips} disabled={!isAdmin && currentStaff.status !== 'Active'} />
      </div>

      {/* 7. Sections */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Sections</h2>
        <SectionsGrid isAdmin={isAdmin} />
      </section>

    </div>
  );
};

export default StaffHome;
