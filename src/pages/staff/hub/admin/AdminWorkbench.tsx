// Patch 1.3 §9–§12 — Full Admin Workbench page.
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { requestSummaryRepo, payrollRepo, staffRepo } from '@/lib/internal-hub';
import { listSystemIssues } from '@/lib/internal-hub/repos/systemIssuesRepo';
import { toolAccessRepo } from '@/lib/internal-hub/repos/toolAccessRepo';
import { buildWorkbenchItems, WORKBENCH_TYPE_LABELS } from '@/lib/internal-hub/workbench/adminWorkbench';
import { ACTION_LABELS, type WorkbenchItemType } from '@/lib/internal-hub/workbench/types';

const TYPE_OPTIONS: Array<WorkbenchItemType | 'All'> = [
  'All', 'Requests', 'MC', 'Claims', 'Training',
  'Onboarding', 'Offboarding', 'Payroll', 'Notices', 'Access', 'SystemIssues',
];

const PRIORITY_OPTIONS = ['all', 'urgent', 'normal', 'info'] as const;

const AdminWorkbench = () => {
  const { currentStaff } = useHub();
  const [params, setParams] = useSearchParams();
  const isAdmin = canAccessAdminArea(currentStaff);
  const filterType = (params.get('type') as WorkbenchItemType | null) ?? 'All';
  const filterPriority = (params.get('priority') as 'all' | 'urgent' | 'normal' | 'info' | null) ?? 'all';

  const month = (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  })();

  const qc = useQueryClient();
  const REFETCH_MS = 30_000;

  const { data: pendingApprovals = [], refetch: refetchApprovals } = useQuery({
    queryKey: ['ih-requests-pending-detailed'],
    queryFn: () => requestSummaryRepo.listPendingApprovalsDetailed(),
    enabled: isAdmin,
    refetchInterval: REFETCH_MS,
  });
  const { data: staff = [], refetch: refetchStaff } = useQuery({
    queryKey: ['ih-staff-list'],
    queryFn: () => staffRepo.list(),
    enabled: isAdmin,
    refetchInterval: REFETCH_MS,
  });
  const { data: systemIssues = [], refetch: refetchIssues } = useQuery({
    queryKey: ['ih-system-issues-open'],
    queryFn: () => listSystemIssues({ status: 'open' }),
    enabled: isAdmin,
    refetchInterval: REFETCH_MS,
  });
  const { data: payrollStatus = 'NotPrepared' as const, refetch: refetchPayroll } = useQuery({
    queryKey: ['ih-payroll-status', month],
    queryFn: () => payrollRepo.statusFor(month),
    enabled: isAdmin,
    refetchInterval: REFETCH_MS,
  });

  // Patch 1.7 — hydrate Supabase-backed tool access cache so Notion-access items
  // reflect real DB state, then invalidate staff query to rebuild workbench items.
  useEffect(() => {
    if (!isAdmin || staff.length === 0) return;
    toolAccessRepo.ensureLoadedAll().then(() => qc.invalidateQueries({ queryKey: ['ih-staff-list'] }));
  }, [isAdmin, staff.length, qc]);

  const refreshAll = () => {
    refetchApprovals();
    refetchStaff();
    refetchIssues();
    refetchPayroll();
  };

  const allItems = useMemo(() => buildWorkbenchItems({
    pendingApprovals,
    staff,
    systemIssues,
    payrollMonth: month,
    payrollStatus,
  }), [pendingApprovals, staff, systemIssues, month, payrollStatus]);

  const filtered = allItems.filter((it) =>
    (filterType === 'All' || it.source === filterType) &&
    (filterPriority === 'all' || it.priority === filterPriority),
  );

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === 'All' || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  if (!isAdmin) return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/staff"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Link>
      </Button>
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Workbench</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operational items needing attention. {filtered.length} of {allItems.length} shown. Auto-refreshes every 30s.
          </p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            Note: Onboarding/Offboarding checklists are tracked per-device until the next patch.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </header>


      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterType} onValueChange={(v) => setFilter('type', v)}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === 'All' ? 'All types' : WORKBENCH_TYPE_LABELS[t as WorkbenchItemType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilter('priority', v)}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>{p === 'all' ? 'All priorities' : p[0].toUpperCase() + p.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
          No items match the current filters.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => (
            <Card key={it.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                  it.priority === 'urgent' ? 'bg-destructive' : it.priority === 'normal' ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{it.title}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{WORKBENCH_TYPE_LABELS[it.type]}</Badge>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{it.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {it.staffName ? `${it.staffName}` : ''}
                    {it.createdAt && (it.staffName ? ' · ' : '') + new Date(it.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to={it.href}>{ACTION_LABELS[it.primaryAction]}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWorkbench;
