// Patch 1.4 §21 — Training Application form (step 1 of 3).
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { RequestFormProps } from './formTypes';

const TrainingApplicationForm: React.FC<RequestFormProps> = ({ initial, onSubmit, submitLabel = 'Submit Application', submitting }) => {
  const [courseName, setCourseName] = useState<string>((initial?.course_name as string) ?? '');
  const [provider, setProvider] = useState<string>((initial?.provider as string) ?? '');
  const [cost, setCost] = useState<string>((initial?.cost as number | undefined)?.toString() ?? '');
  const [link, setLink] = useState<string>((initial?.course_link as string) ?? '');
  const [expected, setExpected] = useState<string>((initial?.expected_completion as string) ?? '');
  const [justification, setJustification] = useState<string>((initial?.justification as string) ?? (initial?.reason as string) ?? '');
  const [file, setFile] = useState<File | null>(null);

  const valid = !!courseName && !!provider && !!cost && Number(cost) > 0 && !!justification;

  function submit() {
    onSubmit({
      payload: {
        course_name: courseName,
        provider,
        cost: Number(cost),
        course_link: link,
        expected_completion: expected,
        justification,
        reason: justification,
      },
      file,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Course / programme name</Label>
        <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Provider</Label>
          <Input value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Cost (MYR)</Label>
          <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Course link (optional)</Label>
        <Input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
      </div>
      <div className="grid gap-2">
        <Label>Expected completion date (optional)</Label>
        <Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Justification</Label>
        <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} />
      </div>
      <div className="grid gap-2">
        <Label>Reference document (optional)</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <p className="text-xs text-muted-foreground">
        After approval, you will be able to mark this as completed and then submit a training claim.
      </p>
      <Button onClick={submit} disabled={!valid || submitting}>
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default TrainingApplicationForm;
