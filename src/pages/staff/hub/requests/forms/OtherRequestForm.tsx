// Patch 1.4 §25 — Other Request: fallback with guardrails.
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RequestFormProps } from './formTypes';
import { OTHER_CATEGORIES } from './formTypes';

const OtherRequestForm: React.FC<RequestFormProps> = ({ initial, onSubmit, submitLabel = 'Submit Request', submitting }) => {
  const [category, setCategory] = useState<string>((initial?.category as string) ?? '');
  const [description, setDescription] = useState<string>((initial?.description as string) ?? (initial?.reason as string) ?? '');

  const valid = !!category && !!description.trim();

  return (
    <div className="grid gap-4">
      <Alert>
        <AlertDescription className="text-xs">
          Use "Other Request" only when no specific request type fits. For IT issues, email IT support directly.
          This form is not for project management, staff chat, payroll disputes, or procurement workflows.
        </AlertDescription>
      </Alert>
      <div className="grid gap-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {OTHER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <Button
        onClick={() => onSubmit({
          payload: {
            kind_label: 'Other',
            category,
            description,
            reason: description,
            topic: category,
          },
        })}
        disabled={!valid || submitting}
      >
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default OtherRequestForm;
