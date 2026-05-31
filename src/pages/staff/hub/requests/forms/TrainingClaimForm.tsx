// Patch 1.4 §23 — Training Claim form (linked to an approved Training Application).
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  applicationCost?: number;
  onSubmit: (input: { amount: number; note?: string; file?: File | null }) => Promise<void> | void;
  submitting?: boolean;
}

const TrainingClaimForm: React.FC<Props> = ({ applicationCost, onSubmit, submitting }) => {
  const [amount, setAmount] = useState<string>(applicationCost ? String(applicationCost) : '');
  const [note, setNote] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const valid = !!amount && Number(amount) > 0;

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Claim amount (MYR)</Label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {applicationCost && (
          <p className="text-xs text-muted-foreground">Original application cost: MYR {applicationCost.toFixed(2)}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label>Note (optional)</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <div className="grid gap-2">
        <Label>Receipt / invoice / certificate (required)</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button onClick={() => onSubmit({ amount: Number(amount), note: note || undefined, file })} disabled={!valid || submitting}>
        {submitting ? 'Submitting…' : 'Submit Training Claim'}
      </Button>
    </div>
  );
};

export default TrainingClaimForm;
