import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, Lock } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { financeSnapshotRepo } from '@/lib/internal-hub';
import { FINANCE_SNAPSHOT_DISCLAIMER, FINANCE_STATUS_LABELS } from '@/lib/internal-hub/types';
import { toast } from '@/hooks/use-toast';

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const FinanceIndex = () => {
  const { currentStaff } = useHub();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const month = currentMonth();

  const { data: snaps = [] } = useQuery({
    queryKey: ['ih-finance-snapshots'],
    queryFn: () => financeSnapshotRepo.listSnapshots(),
    enabled: canAccessAdminArea(currentStaff),
  });

  const openMonth = useMutation({
    mutationFn: () => financeSnapshotRepo.getOrCreateForMonth(month),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['ih-finance-snapshots'] });
      qc.invalidateQueries({ queryKey: ['ih-finance-status'] });
      navigate(`/staff/admin/finance/${s.id}`);
    },
    onError: (e: any) => toast({ title: 'Could not open snapshot', description: e?.message, variant: 'destructive' }),
  });

  if (!canAccessAdminArea(currentStaff)) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Finance Snapshot</h1>
          <p className="text-sm text-muted-foreground mt-1">{FINANCE_SNAPSHOT_DISCLAIMER}</p>
        </div>
        <Button onClick={() => openMonth.mutate()} disabled={openMonth.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Open {month}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Monthly snapshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snaps.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">
              No snapshots yet. Use "Open {month}" to start.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {snaps.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      {s.month}
                      {(s.status === 'Reviewed' || s.status === 'Locked') && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Payroll {s.payrollTotal.toFixed(2)} · Employee statutory {s.employeeStatutoryTotal.toFixed(2)} · Employer statutory {s.employerStatutoryTotal.toFixed(2)}
                      {s.reviewedAt && ` · Reviewed ${new Date(s.reviewedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{FINANCE_STATUS_LABELS[s.status]}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/staff/admin/finance/${s.id}`}>Open</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceIndex;
