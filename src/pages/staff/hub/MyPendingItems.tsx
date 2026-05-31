// Patch 1.3 §5 — Full My Pending Items page.
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHub } from '@/lib/internal-hub/HubContext';
import { noticeRepo, requestSummaryRepo, payslipRepo } from '@/lib/internal-hub';
import { onboardingRepo } from '@/lib/internal-hub/repos/onboardingRepo';
import { toolAccessRepo } from '@/lib/internal-hub/repos/toolAccessRepo';
import { buildPendingItems } from '@/lib/internal-hub/workbench/pendingItems';
import PendingItemsPreview from '@/components/internal-hub/home/PendingItemsPreview';

const MyPendingItems = () => {
  const { currentStaff } = useHub();
  const staffId = currentStaff?.id;

  const { data: notices = [] } = useQuery({
    queryKey: ['ih-notices', { includeArchived: false }],
    queryFn: () => noticeRepo.list(false),
    enabled: !!staffId,
  });
  const { data: acks = new Map() } = useQuery({
    queryKey: ['ih-notice-acks', staffId],
    queryFn: () => noticeRepo.listAcksForStaff(staffId!),
    enabled: !!staffId,
  });
  const { data: needsCorrection = [] } = useQuery({
    queryKey: ['ih-requests-needs-correction', staffId],
    queryFn: () => requestSummaryRepo.listNeedsCorrectionForStaff(staffId!),
    enabled: !!staffId,
  });
  const { data: payslips = [] } = useQuery({
    queryKey: ['ih-payslips-latest', staffId],
    queryFn: () => payslipRepo.listForStaff(staffId!, 1),
    enabled: !!staffId,
  });

  const items = useMemo(() => {
    if (!currentStaff) return [];
    return buildPendingItems({
      staff: currentStaff,
      notices,
      acks,
      needsCorrection,
      recentDecided: [],
      onboarding: onboardingRepo.get(currentStaff.id),
      toolAccess: toolAccessRepo.get(currentStaff.id),
      latestPayslip: payslips[0],
    });
  }, [currentStaff, notices, acks, needsCorrection, payslips]);

  if (!currentStaff) return null;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/staff"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Link>
      </Button>
      <header>
        <h1 className="text-2xl font-semibold text-foreground">My Pending Items</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Items waiting for your action. They disappear once handled.
        </p>
      </header>
      <PendingItemsPreview items={items} limit={items.length || 1} />
    </div>
  );
};

export default MyPendingItems;
