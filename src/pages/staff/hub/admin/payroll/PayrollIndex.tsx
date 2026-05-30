import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Banknote, Plus, Lock } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { payrollRepo } from '@/lib/internal-hub';
import { PAYROLL_STATUS_LABELS, type PayrollRunStatus } from '@/lib/internal-hub/types';

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const statusVariant: Record<PayrollRunStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  NotPrepared: 'outline',
  Draft: 'secondary',
  ReadyForReview: 'default',
  Finalized: 'default',
  Locked: 'secondary',
};

const PayrollIndex = () => {
  const { currentStaff } = useHub();
  const navigate = useNavigate();
  if (!canAccessAdminArea(currentStaff)) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }
  const runs = payrollRepo.listRuns();
  const month = currentMonth();
  const currentRun = payrollRepo.getForMonth(month);

  const handlePrepare = () => {
    const run = payrollRepo.getOrCreateDraft(month);
    navigate(`/staff/admin/payroll/${run.id}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Payroll</h1>
          <p className="text-sm text-muted-foreground">
            Monthly payroll preparation, review, and finalization. Internal preparation only — not statutory compliance.
          </p>
        </div>
        {!currentRun && (
          <Button onClick={handlePrepare}>
            <Plus className="h-4 w-4 mr-1" /> Prepare {month}
          </Button>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Payroll runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">
              No payroll runs yet. Use "Prepare {month}" to start.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {runs.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      {r.month}
                      {(r.status === 'Locked' || r.status === 'Finalized') && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.items.length} staff · {r.items.filter((i) => i.rowStatus === 'Incomplete').length} incomplete
                      {r.finalizedAt && ` · Finalized ${new Date(r.finalizedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[r.status]}>{PAYROLL_STATUS_LABELS[r.status]}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/staff/admin/payroll/${r.id}`}>Open</Link>
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

export default PayrollIndex;
