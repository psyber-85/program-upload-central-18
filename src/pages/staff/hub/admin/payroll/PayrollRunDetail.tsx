import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { payrollRepo, staffRepo } from '@/lib/internal-hub';
import {
  PAYROLL_STATUS_LABELS,
  PAYROLL_MISSING_FIELD_LABELS,
  type PayrollItem,
} from '@/lib/internal-hub/types';
import { toast } from '@/hooks/use-toast';

const PayrollRunDetail = () => {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const { currentStaff } = useHub();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const run = useMemo(() => payrollRepo.getRun(runId), [runId, tick]);
  if (!canAccessAdminArea(currentStaff)) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }
  if (!run) {
    return <div className="p-6 text-sm text-muted-foreground">Payroll run not found.</div>;
  }
  const locked = run.status === 'Finalized' || run.status === 'Locked';
  const isFinalized = run.status === 'Finalized';
  const isLocked = run.status === 'Locked';
  const incomplete = run.items.filter((i) => i.rowStatus === 'Incomplete');
  const canFinalize = payrollRepo.canFinalize(runId);

  const handleReady = () => {
    payrollRepo.markReadyForReview(runId);
    refresh();
  };
  const handleFinalize = () => {
    try {
      payrollRepo.finalize(runId, currentStaff!.id);
      toast({ title: 'Payroll finalized', description: 'Payslips generated and notifications sent.' });
      refresh();
    } catch (e: any) {
      toast({ title: 'Cannot finalize', description: e.message, variant: 'destructive' });
    }
  };
  const handleLock = () => {
    if (!confirm('Lock this payroll run? Locking prevents future status changes. Corrections must use a future-payroll adjustment.')) return;
    try {
      payrollRepo.lockRun(runId, currentStaff!.id);
      toast({ title: 'Payroll locked' });
      refresh();
    } catch (e: any) {
      toast({ title: 'Cannot lock', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/staff/admin/payroll')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> All runs
        </Button>
      </div>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Payroll · {run.month}
            {locked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status: <Badge variant="secondary">{PAYROLL_STATUS_LABELS[run.status]}</Badge>
            {run.finalizedAt && ` · Finalized ${new Date(run.finalizedAt).toLocaleString()}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!locked && run.status === 'Draft' && (
            <Button variant="outline" onClick={handleReady}>Mark Ready for Review</Button>
          )}
          {!locked && (
            <Button onClick={handleFinalize} disabled={!canFinalize.ok} title={canFinalize.reason}>
              Finalize Payroll
            </Button>
          )}
        </div>
      </header>

      {incomplete.length > 0 && !locked && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 flex gap-3 items-start text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
            <div>
              <div className="font-medium text-foreground">
                {incomplete.length} staff row(s) incomplete
              </div>
              <div className="text-muted-foreground mt-1">
                Finalization is blocked until missing payroll-critical fields are filled on each staff profile.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
        Net Pay = Base − EPF − SOCSO + Claims + Training Claims + Manual Adjustments
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff rows ({run.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {run.items.map((item) => (
            <PayrollRow
              key={item.staffId}
              item={item}
              runId={run.id}
              locked={locked}
              onChange={refresh}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={run.adminNotes ?? ''}
            onChange={(e) => {
              payrollRepo.setRunNotes(run.id, e.target.value);
              refresh();
            }}
            disabled={locked}
            placeholder="Payroll context, review notes, correction explanations…"
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const PayrollRow = ({
  item, runId, locked, onChange,
}: {
  item: PayrollItem;
  runId: string;
  locked: boolean;
  onChange: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [adjOpen, setAdjOpen] = useState(false);
  const [amount, setAmount] = useState(String(item.adjustment?.amount ?? ''));
  const [reason, setReason] = useState(item.adjustment?.reason ?? '');

  const handleSaveAdj = () => {
    const num = parseFloat(amount);
    if (Number.isNaN(num)) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    try {
      if (num === 0 && !reason.trim()) {
        payrollRepo.setAdjustment(runId, item.staffId, null);
      } else {
        payrollRepo.setAdjustment(runId, item.staffId, { amount: num, reason });
      }
      setAdjOpen(false);
      onChange();
    } catch (e: any) {
      toast({ title: 'Cannot save', description: e.message, variant: 'destructive' });
    }
  };

  const handleRefreshFromProfile = () => {
    payrollRepo.refreshRow(runId, item.staffId);
    onChange();
  };

  return (
    <div className="border border-border rounded-md">
      <div className="p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {item.rowStatus === 'Incomplete' ? (
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-medium truncate">{item.staffName}</div>
            <div className="text-xs text-muted-foreground">
              Base {item.baseSalary.toFixed(2)} · EPF {item.epfAmount.toFixed(2)} · SOCSO {item.socsoAmount.toFixed(2)}
              {item.claimsTotal > 0 && ` · Claims ${item.claimsTotal.toFixed(2)}`}
              {item.trainingClaimsTotal > 0 && ` · Training ${item.trainingClaimsTotal.toFixed(2)}`}
              {item.adjustment && ` · Adj ${item.adjustment.amount.toFixed(2)}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Net Pay</div>
            <div className="font-semibold">{item.netPay.toFixed(2)}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide' : 'Details'}
          </Button>
        </div>
      </div>

      {item.rowStatus === 'Incomplete' && (
        <div className="px-3 pb-3 -mt-1 text-xs text-destructive flex flex-wrap items-center gap-2">
          Missing:
          {item.missingFields.map((f) => (
            <Badge key={f} variant="destructive" className="text-[10px]">
              {PAYROLL_MISSING_FIELD_LABELS[f]}
            </Badge>
          ))}
          <Link to={`/staff/admin/staff/${item.staffId}`} className="underline">
            Fix on profile
          </Link>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleRefreshFromProfile}>
            Re-pull from profile
          </Button>
        </div>
      )}

      {expanded && (
        <div className="px-3 pb-3 border-t border-border pt-3 space-y-2 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-muted-foreground">Base:</span> {item.baseSalary.toFixed(2)}</div>
            <div><span className="text-muted-foreground">EPF:</span> -{item.epfAmount.toFixed(2)}</div>
            <div><span className="text-muted-foreground">SOCSO:</span> -{item.socsoAmount.toFixed(2)}</div>
            <div><span className="text-muted-foreground">Claims:</span> +{item.claimsTotal.toFixed(2)}</div>
            <div><span className="text-muted-foreground">Training:</span> +{item.trainingClaimsTotal.toFixed(2)}</div>
            <div><span className="text-muted-foreground">Adj:</span> {(item.adjustment?.amount ?? 0).toFixed(2)}</div>
            <div className="col-span-2 sm:col-span-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Net Pay:</span> <span className="font-medium">{item.netPay.toFixed(2)}</span>
            </div>
          </div>

          {item.adjustment && (
            <div className="text-xs">
              <span className="text-muted-foreground">Adjustment reason:</span> {item.adjustment.reason}
            </div>
          )}

          <div className="flex gap-2 flex-wrap pt-1">
            <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={locked}>
                  {item.adjustment ? 'Edit adjustment' : 'Add adjustment'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual adjustment · {item.staffName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amt">Amount (positive or negative)</Label>
                    <Input id="amt" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="rsn">Reason (required)</Label>
                    <Textarea id="rsn" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setAdjOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveAdj} disabled={!reason.trim() && amount !== '0'}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Label htmlFor={`notes-${item.staffId}`} className="text-xs">Row notes</Label>
            <Textarea
              id={`notes-${item.staffId}`}
              rows={2}
              value={item.notes ?? ''}
              disabled={locked}
              onChange={(e) => {
                payrollRepo.setRowNotes(runId, item.staffId, e.target.value);
                onChange();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollRunDetail;
