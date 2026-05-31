// Patch 1.4 §24 — Insurance / Benefit Request form with suggested topics.
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { RequestFormProps } from './formTypes';
import { BENEFIT_TOPICS } from './formTypes';

const BenefitForm: React.FC<RequestFormProps> = ({ initial, onSubmit, submitLabel = 'Submit Request', submitting }) => {
  const [topic, setTopic] = useState<string>((initial?.topic as string) ?? '');
  const [description, setDescription] = useState<string>((initial?.description as string) ?? (initial?.reason as string) ?? '');
  const [link, setLink] = useState<string>((initial?.course_link as string) ?? '');
  const [file, setFile] = useState<File | null>(null);

  const valid = !!topic && !!description.trim();

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Topic</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {BENEFIT_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <div className="grid gap-2">
        <Label>Reference link (optional)</Label>
        <Input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
      </div>
      <div className="grid gap-2">
        <Label>Attachment (optional)</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button
        onClick={() => onSubmit({
          payload: { topic, description, reason: description, course_link: link },
          file,
        })}
        disabled={!valid || submitting}
      >
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default BenefitForm;
