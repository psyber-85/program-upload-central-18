// Patch 1.4 §15 — MC upload form. Proof is required (unless waived).
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { RequestFormProps } from './formTypes';

const McForm: React.FC<RequestFormProps> = ({ initial, onSubmit, submitLabel = 'Submit MC', submitting }) => {
  const [startDate, setStartDate] = useState<string>((initial?.start_date as string) ?? '');
  const [endDate, setEndDate] = useState<string>((initial?.end_date as string) ?? '');
  const [note, setNote] = useState<string>((initial?.reason as string) ?? '');
  const [file, setFile] = useState<File | null>(null);

  const proofWaived = !!initial?.proof_waived;
  const valid = !!startDate && (proofWaived || !!file || !!initial); // editing existing: ok without new file

  function submit() {
    onSubmit({
      payload: {
        start_date: startDate,
        end_date: endDate || startDate,
        reason: note,
      },
      file,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>MC start date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>MC end date (optional)</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Note (optional)</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <div className="grid gap-2">
        <Label>MC file (required) — PNG/JPEG/WebP/PDF, max 10MB</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {!file && !initial && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">MC cannot be submitted without proof.</AlertDescription>
          </Alert>
        )}
      </div>
      <Button onClick={submit} disabled={!valid || submitting}>
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default McForm;
