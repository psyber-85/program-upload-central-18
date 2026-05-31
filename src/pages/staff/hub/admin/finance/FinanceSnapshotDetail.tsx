import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const qc = useQueryClient();

  // New line item form (hooks must run unconditionally)
  const [cat, setCat] = useState<FinanceLineCategory>('Expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');

  const isAdmin = canAccessAdminArea(currentStaff);

  const { data: snap } = useQuery({
    queryKey: ['ih-finance-snapshot', id],
    queryFn: () => financeSnapshotRepo.getById(id),
    enabled: isAdmin && !!id,
  });
  const { data: items = [] } = useQuery({
    queryKey: ['ih-finance-items', id],
    queryFn: () => financeSnapshotRepo.lineItemsFor(id),
    enabled: isAdmin && !!id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['ih-finance-snapshot', id] });
    qc.invalidateQueries({ queryKey: ['ih-finance-items', id] });
    qc.invalidateQueries({ queryKey: ['ih-finance-snapshots'] });
    qc.invalidateQueries({ queryKey: ['ih-finance-status'] });
  };

  const setOpening = useMutation({
    mutationFn: (v: number | undefined) => financeSnapshotRepo.setOpeningBalance(id, v),
    onSuccess: invalidate,
  });
  const setClosing = useMutation({
    mutationFn: (v: number | undefined) => financeSnapshotRepo.setClosingBalance(id, v),
    onSuccess: invalidate,
  });
  const setNotesMut = useMutation({
    mutationFn: (v: string) => financeSnapshotRepo.setNotes(id, v),
    onSuccess: invalidate,
  });
  const addItem = useMutation({
    mutationFn: (input: { correction: boolean; payload: { category: FinanceLineCategory; amount: number; note: string; link?: string; createdBy: string } }) =>
      input.correction
        ? financeSnapshotRepo.addCorrectionLineItem(id, input.payload)
        : financeSnapshotRepo.addLineItem(id, input.payload),
    onSuccess: () => {
      setAmount(''); setNote(''); setLink('');
      invalidate();
    },
    onError: (e: any) => toast({ title: 'Cannot add', description: e?.message, variant: 'destructive' }),
  });
  const removeItem = useMutation({
    mutationFn: (itemId: string) => financeSnapshotRepo.removeLineItem(id, itemId),
    onSuccess: invalidate,
  });
  const review = useMutation({
    mutationFn: () => financeSnapshotRepo.markReviewed(id, currentStaff!.id),
    onSuccess: () => {
      toast({ title: 'Month marked reviewed' });
      invalidate();
    },
  });

  if (!isAdmin) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }
  if (!snap) {
    return <div className="p-6 text-sm text-muted-foreground">Snapshot not found.</div>;
  }

  const locked = snap.status === 'Locked' || snap.status === 'Reviewed';

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
    addItem.mutate({
      correction,
      payload: { category: cat, amount: num, note, link: link || undefined, createdBy: currentStaff!.id },
    });
  };

  const handleReview = () => {
    if (!confirm('Mark this month as reviewed? Fields will lock from casual editing (corrections still allowed).')) return;
    review.mutate();
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
          <Button onClick={handleReview} disabled={review.isPending}>Mark Month Reviewed</Button>
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
              defaultValue={snap.openingBalance ?? ''}
              disabled={locked}
              onBlur={(e) => {
                const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                setOpening.mutate(v);
              }}
            />
          </div>
          <div>
            <Label>Closing balance</Label>
            <Input
              type="number" step="0.01"
              defaultValue={snap.closingBalance ?? ''}
              disabled={locked}
              onBlur={(e) => {
                const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                setClosing.mutate(v);
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
                      onClick={() => removeItem.mutate(i.id)}
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
            <Button size="sm" onClick={() => handleAdd(false)} disabled={locked || addItem.isPending}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add line item
            </Button>
            {locked && (
              <Button size="sm" variant="outline" onClick={() => handleAdd(true)} disabled={addItem.isPending}>
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
            defaultValue={snap.notes ?? ''}
            disabled={locked}
            onBlur={(e) => setNotesMut.mutate(e.target.value)}
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
