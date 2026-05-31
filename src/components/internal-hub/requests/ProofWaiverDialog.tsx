// Patch 1.4 §26 — Admin-only proof waiver with required reason.
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { requestRepo } from '@/lib/internal-hub/repos/requestRepo';

interface Props {
  requestId: string;
  adminId: string;
  onDone?: () => void;
  alreadyWaived?: boolean;
}

const ProofWaiverDialog: React.FC<Props> = ({ requestId, adminId, onDone, alreadyWaived }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    setBusy(true);
    try {
      await requestRepo.waiveProof({ requestId, reason, adminId });
      toast.success('Proof waived.');
      setOpen(false);
      setReason('');
      onDone?.();
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={alreadyWaived}>
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          {alreadyWaived ? 'Proof waived' : 'Waive proof'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Waive proof requirement</DialogTitle></DialogHeader>
        <div className="grid gap-2">
          <Label>Reason (required)</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          <p className="text-xs text-muted-foreground">This action is recorded in the request timeline.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Waive proof'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProofWaiverDialog;
