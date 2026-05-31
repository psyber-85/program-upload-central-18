// Patch 1.4 §14 — Leave form.
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { RequestFormProps } from './formTypes';
import type { HalfDaySlot } from '@/lib/internal-hub/repos/requestRepo';

const LeaveForm: React.FC<RequestFormProps> = ({ initial, initialHalfDay, onSubmit, submitLabel = 'Submit Request', submitting }) => {
  const [leaveType, setLeaveType] = useState<string>((initial?.leave_type as string) ?? 'Annual');
  const [startDate, setStartDate] = useState<string>((initial?.start_date as string) ?? '');
  const [endDate, setEndDate] = useState<string>((initial?.end_date as string) ?? '');
  const [halfDay, setHalfDay] = useState<'none' | 'morning' | 'afternoon'>(initialHalfDay ?? 'none');
  const [reason, setReason] = useState<string>((initial?.reason as string) ?? '');
  const [file, setFile] = useState<File | null>(null);

  function submit() {
    const slot: HalfDaySlot = halfDay === 'none' ? null : halfDay;
    onSubmit({
      payload: {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate || startDate,
        reason,
      },
      halfDaySlot: slot,
      file,
    });
  }

  const days = (() => {
    if (!startDate) return null;
    const end = endDate || startDate;
    const ms = new Date(end).getTime() - new Date(startDate).getTime();
    if (Number.isNaN(ms) || ms < 0) return null;
    const base = Math.round(ms / (24 * 3600 * 1000)) + 1;
    return halfDay !== 'none' ? base - 0.5 : base;
  })();

  const valid = !!startDate && (!endDate || endDate >= startDate);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Leave type</Label>
        <Select value={leaveType} onValueChange={setLeaveType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Annual">Annual Leave</SelectItem>
            <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>End date (optional)</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Half-day</Label>
        <Select value={halfDay} onValueChange={(v) => setHalfDay(v as 'none' | 'morning' | 'afternoon')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Full day(s)</SelectItem>
            <SelectItem value="morning">Half day — morning (09:00–13:00)</SelectItem>
            <SelectItem value="afternoon">Half day — afternoon (14:00–18:00)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {days !== null && (
        <p className="text-xs text-muted-foreground">Calculated leave: {days} day{days === 1 ? '' : 's'}</p>
      )}
      <div className="grid gap-2">
        <Label>Reason / note (optional)</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
      </div>
      <div className="grid gap-2">
        <Label>Attachment (optional, max 10MB)</Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button onClick={submit} disabled={!valid || submitting}>
        {submitting ? 'Submitting…' : submitLabel}
      </Button>
    </div>
  );
};

export default LeaveForm;
