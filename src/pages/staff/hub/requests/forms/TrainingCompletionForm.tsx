// Patch 1.4 §22 — Training Completion step (mounted from RequestDetail).
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (input: { completionDate: string; note?: string }) => Promise<void> | void;
  submitting?: boolean;
}

const TrainingCompletionForm: React.FC<Props> = ({ onSubmit, submitting }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Completion date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Completion note (optional)</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <Button onClick={() => onSubmit({ completionDate: date, note: note || undefined })} disabled={!date || submitting}>
        {submitting ? 'Saving…' : 'Mark Training Completed'}
      </Button>
      <p className="text-xs text-muted-foreground">Completion does not reimburse you — submit a training claim to be reimbursed.</p>
    </div>
  );
};

export default TrainingCompletionForm;
