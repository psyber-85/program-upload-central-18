import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Lock, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { financeSnapshotRepo } from '@/lib/internal-hub';
import {
  FINANCE_CATEGORY_LABELS,
  FINANCE_SNAPSHOT_DISCLAIMER,
  FINANCE_STATUS_LABELS,
  type FinanceLineCategory,
} from '@/lib/internal-hub/types';
import { toast } from '@/hooks/use-toast';

const CATEGORIES: FinanceLineCategory[] = ['Income', 'Expense', 'TransferAdjustment', 'Other'];

const FinanceSnapshotDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { currentStaff } = useHub();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  if (!canAccessAdminArea(currentStaff)) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }
  const snap = useMemo(() => financeSnapshotRepo.getById(id), [id, tick]);
  const items = useMemo(() => (snap ? financeSnapshotRepo.lineItemsFor(snap.id) : []), [snap?.id, tick]);
  if (!snap) {
    return <div className="p-6 text-sm text-muted-foreground">Snapshot not found.</div>;
  }
  const locked = snap.status === 'Locked' || snap.status === 'Reviewed';

  // New line item form
  const [cat, setCat] = useState<FinanceLineCategory>('Expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');

  const handleAdd = (correction = false) => {
    const num = parseFloat(amount);
    if (Number.isNaN(num)) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (!note.trim()) {
      toast({ title: 'Note required', variant: 'destructive' });
      return;
    }
    try {
      const payload = { category: cat, amount: num, note, link: link || undefined, createdBy: currentStaff!.id };
      if (correction) {
        financeSnapshotRepo.addCorrectionLineItem(snap.id, payload);
      } else {
        financeSnapshotRepo.addLineItem(snap.id, payload);
      }
      setAmount(''); setNote(''); setLink('');
      refresh();
    } catch (e: any) {
      toast({ title: 'Cannot add', description: e.message, variant: 'destructive' });
    }
  };

  const handleReview = () => {
    if (!confirm('Mark this month as reviewed? Fields will lock from casual editing (corrections still allowed).')) return;
    financeSnapshotRepo.markReviewed(snap.id, currentStaff!.id);
    toast({ title: 'Month marked reviewed' });
    refresh();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/staff/admin/finance')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> All snapshots
      </Button>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Finance Snapshot · {snap.month}
            {locked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> {FINANCE_SNAPSHOT_DISCLAIMER} Admin-only.
          </p>
          <Badge variant="secondary" className="mt-2">{FINANCE_STATUS_LABELS[snap.status]}</Badge>
        </div>
        {!locked && (
          <Button onClick={handleReview}>Mark Month Reviewed</Button>
        )}
      </header>

      {/* Bank balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank balances (manual)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Opening balance</Label>
            <Input
              type="number" step="0.01"
              value={snap.openingBalance ?? ''}
              disabled={locked}
              onChange={(e) => {
                const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                financeSnapshotRepo.setOpeningBalance(snap.id, v);
                refresh();
              }}
            />
          </div>
          <div>
            <Label>Closing balance</Label>
            <Input
              type="number" step="0.01"
              value={snap.closingBalance ?? ''}
              disabled={locked}
              onChange={(e) => {
                const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                financeSnapshotRepo.setClosingBalance(snap.id, v);
                refresh();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-filled payroll totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">From finalized payroll</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <Stat label="Payroll total" value={snap.payrollTotal} />
          <Stat label="Claims" value={snap.claimsTotal} />
          <Stat label="Training" value={snap.trainingClaimsTotal} />
          <Stat label="EPF/SOCSO" value={snap.epfSocsoTotal} />
          <Stat label="Manual adj." value={snap.manualAdjustmentTotal} />
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manual line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground">No line items.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((i) => (
                <li key={i.id} className="py-2 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{FINANCE_CATEGORY_LABELS[i.category]}</Badge>
                      {i.isCorrection && <Badge variant="secondary" className="text-[10px]">Correction</Badge>}
                      <span className="font-medium">{i.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{i.note}</div>
                    {i.link && (
                      <a href={i.link} target="_blank" rel="noreferrer noopener" className="text-xs text-primary underline">
                        Open link
                      </a>
                    )}
                  </div>
                  {!locked && !i.isCorrection && (
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { financeSnapshotRepo.removeLineItem(i.id); refresh(); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Select value={cat} onValueChange={(v) => setCat(v as FinanceLineCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{FINANCE_CATEGORY_LABELS[c]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            <Input placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleAdd(false)} disabled={locked}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add line item
            </Button>
            {locked && (
              <Button size="sm" variant="outline" onClick={() => handleAdd(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add correction
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Links only — no file uploads (Doc 3.3 §11). Store proof externally.
          </p>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Month notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={snap.notes ?? ''}
            disabled={locked}
            onChange={(e) => { financeSnapshotRepo.setNotes(snap.id, e.target.value); refresh(); }}
            placeholder="Founder context, cash notes, follow-ups… never passwords or credentials."
          />
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-muted/40 p-2">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm font-medium">{value.toFixed(2)}</div>
  </div>
);

export default FinanceSnapshotDetail;
