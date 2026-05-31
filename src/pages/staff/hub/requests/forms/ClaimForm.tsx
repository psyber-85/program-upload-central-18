// Patch 1.4 §17/§18 — Claim form.
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { RequestFormProps } from './formTypes';
import { CLAIM_CATEGORIES } from './formTypes';

const ClaimForm: React.FC<RequestFormProps> = ({ initial, onSubmit, submitLabel = 'Submit Claim', submitting }) => {
  const [amount, setAmount] = useState<string>((initial?.amount as number | undefined)?.toString() ?? '');
  const [category, setCategory] = useState<string>((initial?.category as string) ?? '');
  const [claimDate, setClaimDate] = useState<string>((initial?.start_date as string) ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>((initial?.description as string) ?? (initial?.reason as string) ?? '');
  const [file, setFile] = useState<File | null>(null);

  const valid = !!amount && Number(amount) > 0 && !!category;

  function submit() {
    onSubmit({
      payload: {
        amount: Number(amount),
        category,
        start_date: claimDate,
        description,
        reason: description, // back-compat
      },
      file,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Amount (MYR)</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {CLAIM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Claim date</Label>
        <Input type="date" value={claimDate} onChange={(e) => setClaimDate(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid gap-2">
        <Label>Receipt / proof (recommended, max 10MB)</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <p className="text-xs text-muted-foreground">
          Claims without proof may require admin review. Admin can waive the proof requirement when appropriate.
        </p>
      </div>
      <Button onClick={submit} disabled={!valid || submitting}>
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default ClaimForm;
