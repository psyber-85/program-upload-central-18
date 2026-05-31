// Doc 4.2 — Requests module: staff submit + admin approve.
// Wires up calendar sync (Leave/MC) and approval-outcome emails on decision.
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { requestRepo, type RequestKind, type HalfDaySlot, type RequestRow } from '@/lib/internal-hub/repos/requestRepo';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Paperclip, Check, X, ExternalLink } from 'lucide-react';

const KIND_OPTIONS: { value: RequestKind; label: string }[] = [
  { value: 'Leave', label: 'Leave' },
  { value: 'MC', label: 'MC (medical certificate)' },
  { value: 'Claim', label: 'Claim / reimbursement' },
];

const NewRequestDialog: React.FC<{ staffId: string; onCreated: () => void }> = ({ staffId, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<RequestKind>('Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState<'none' | 'morning' | 'afternoon'>('none');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setKind('Leave'); setStartDate(''); setEndDate(''); setHalfDay('none');
    setReason(''); setAmount(''); setCategory(''); setFile(null);
  }

  async function submit() {
    if (kind === 'Claim') {
      if (!amount || !category) {
        toast.error('Amount and category are required for claims.');
        return;
      }
    } else {
      if (!startDate) { toast.error('Start date is required.'); return; }
      if (endDate && endDate < startDate) { toast.error('End date cannot be before start date.'); return; }
    }
    setSubmitting(true);
    try {
      const halfDaySlot: HalfDaySlot = halfDay === 'none' ? null : halfDay;
      const payload: Record<string, unknown> = { reason };
      if (kind === 'Claim') {
        payload.amount = Number(amount);
        payload.category = category;
      } else {
        payload.start_date = startDate;
        payload.end_date = endDate || startDate;
        if (halfDaySlot) payload.half_day_slot = halfDaySlot;
      }
      const created = await requestRepo.create({
        staffId,
        kind,
        payload,
        halfDaySlot: kind === 'Claim' ? null : halfDaySlot,
      });
      if (file) {
        try {
          await requestRepo.uploadAttachment({
            requestId: created.id, staffId, file,
            kind: kind === 'MC' ? 'mc' : kind === 'Claim' ? 'receipt' : 'attachment',
          });
        } catch (e: any) {
          toast.warning(`Request submitted, but attachment failed: ${e.message ?? e}`);
        }
      }
      // Notify admins (fire-and-forget)
      const me = await staffRepo.get(staffId);
      void requestRepo.notifyAdmins({ request: created, requesterName: me?.fullName ?? 'Staff' });
      toast.success('Request submitted.');
      reset();
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(`Failed to submit: ${e.message ?? e}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>New request</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New request</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as RequestKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {kind !== 'Claim' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Start date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>End date (optional)</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Half-day</Label>
                <Select value={halfDay} onValueChange={(v) => setHalfDay(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Full day(s)</SelectItem>
                    <SelectItem value="morning">Half day — morning (09:00–13:00)</SelectItem>
                    <SelectItem value="afternoon">Half day — afternoon (14:00–18:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {kind === 'Claim' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Amount (MYR)</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Travel, Meals" />
                </div>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Notes / reason (optional)</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          </div>

          <div className="grid gap-2">
            <Label>Attachment (optional, max 10MB — PNG/JPEG/WebP/PDF)</Label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function StatusBadge({ status }: { status: RequestRow['status'] }) {
  const variant = status === 'Approved' ? 'default' : status === 'Rejected' || status === 'Cancelled' ? 'destructive' : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}

const RequestRowCard: React.FC<{
  row: RequestRow;
  showStaff?: boolean;
  staffNameById?: Map<string, string>;
  onDecide?: (decision: 'Approved' | 'Rejected', note?: string) => void;
  deciding?: boolean;
}> = ({ row, showStaff, staffNameById, onDecide, deciding }) => {
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState<Array<{ path: string; name: string }>>([]);
  const [attLoaded, setAttLoaded] = useState(false);

  async function loadAtts() {
    if (attLoaded) return;
    const list = await requestRepo.listAttachments(row.id);
    setAttachments(list.map(a => ({ path: a.path, name: a.path.split('/').pop() ?? a.path })));
    setAttLoaded(true);
  }

  async function open(path: string) {
    const url = await requestRepo.signedUrl(path);
    if (url) window.open(url, '_blank');
    else toast.error('Could not generate signed URL');
  }

  const p = row.payload ?? {};
  const dateRange = row.kind === 'Claim'
    ? `MYR ${(p as any).amount ?? '?'} · ${(p as any).category ?? ''}`
    : `${(p as any).start_date ?? '?'}${(p as any).end_date && (p as any).end_date !== (p as any).start_date ? ` → ${(p as any).end_date}` : ''}${row.half_day_slot ? ` · ½ ${row.half_day_slot}` : ''}`;

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.kind}</span>
              <StatusBadge status={row.status} />
              {showStaff && staffNameById && (
                <span className="text-sm text-muted-foreground">· {staffNameById.get(row.staff_id) ?? 'Staff'}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{dateRange}</p>
            {(p as any).reason && <p className="text-sm mt-1">{(p as any).reason}</p>}
            {row.decision_note && (
              <p className="text-xs text-muted-foreground mt-1">Admin note: {row.decision_note}</p>
            )}
            {row.gcal_sync_error && (
              <p className="text-xs text-destructive mt-1">Calendar sync error: {row.gcal_sync_error}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.created_at).toLocaleDateString()}
          </div>
        </div>

        <div>
          <Button variant="ghost" size="sm" onClick={loadAtts} className="text-xs h-7">
            <Paperclip className="h-3.5 w-3.5 mr-1" />
            {attLoaded ? `${attachments.length} attachment(s)` : 'Show attachments'}
          </Button>
          {attLoaded && attachments.length > 0 && (
            <ul className="mt-1 ml-5 text-sm">
              {attachments.map(a => (
                <li key={a.path}>
                  <button onClick={() => open(a.path)} className="text-primary hover:underline inline-flex items-center gap-1">
                    {a.name} <ExternalLink className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {onDecide && row.status === 'Submitted' && (
          <div className="grid gap-2 pt-2 border-t">
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Decision note (optional for approve, recommended for reject)"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" disabled={deciding} onClick={() => onDecide('Rejected', note)}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" disabled={deciding} onClick={() => onDecide('Approved', note)}>
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RequestsIndex: React.FC = () => {
  const { currentStaff } = useHub();
  const qc = useQueryClient();
  const isAdmin = canAccessAdminArea(currentStaff);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const { data: mine = [], refetch: refetchMine } = useQuery({
    queryKey: ['ih-requests-mine', currentStaff?.id],
    queryFn: () => requestRepo.listForStaff(currentStaff!.id),
    enabled: !!currentStaff,
  });

  const { data: pending = [], refetch: refetchPending } = useQuery({
    queryKey: ['ih-requests-pending'],
    queryFn: () => requestRepo.listPending(),
    enabled: isAdmin,
  });

  const { data: allStaff = [] } = useQuery({
    queryKey: ['ih-staff-list'],
    queryFn: () => staffRepo.list(),
    enabled: isAdmin,
  });
  const staffNameById = useMemo(() => {
    const m = new Map<string, string>();
    allStaff.forEach(s => m.set(s.id, s.fullName));
    return m;
  }, [allStaff]);

  async function decide(id: string, decision: 'Approved' | 'Rejected', note?: string) {
    if (!currentStaff) return;
    setDecidingId(id);
    try {
      await requestRepo.decide({ requestId: id, decision, note, adminId: currentStaff.id });
      toast.success(`Request ${decision.toLowerCase()}. Email + calendar sync queued.`);
      await Promise.all([refetchPending(), refetchMine()]);
      qc.invalidateQueries({ queryKey: ['ih-requests-pending-all'] });
    } catch (e: any) {
      toast.error(`Failed: ${e.message ?? e}`);
    } finally {
      setDecidingId(null);
    }
  }

  if (!currentStaff) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Requests</h1>
          <p className="text-sm text-muted-foreground">Leave, MC, and claim submissions. Approved Leave/MC sync to the AIHQ team calendar.</p>
        </div>
        <NewRequestDialog staffId={currentStaff.id} onCreated={() => { refetchMine(); refetchPending(); }} />
      </div>

      <Tabs defaultValue={isAdmin ? 'pending' : 'mine'}>
        <TabsList>
          {isAdmin && <TabsTrigger value="pending">Pending approval ({pending.length})</TabsTrigger>}
          <TabsTrigger value="mine">My requests ({mine.length})</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No pending requests.</CardContent></Card>
            ) : (
              pending.map(row => (
                <RequestRowCard
                  key={row.id}
                  row={row}
                  showStaff
                  staffNameById={staffNameById}
                  deciding={decidingId === row.id}
                  onDecide={(d, note) => decide(row.id, d, note)}
                />
              ))
            )}
          </TabsContent>
        )}

        <TabsContent value="mine" className="mt-4 space-y-3">
          {mine.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No requests yet. Click "New request" to submit one.</CardContent></Card>
          ) : (
            mine.map(row => <RequestRowCard key={row.id} row={row} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestsIndex;
