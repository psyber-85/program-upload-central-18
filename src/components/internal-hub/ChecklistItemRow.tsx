import React, { useState } from 'react';
import { Check, CircleDashed, ShieldCheck, UserCheck, ExternalLink, Link2, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ChecklistItem, ChecklistStatus } from '@/lib/internal-hub/types';

interface Props {
  item: ChecklistItem;
  viewerIsAdmin: boolean;
  onChange: (status: ChecklistStatus) => void;
  onLinkChange?: (link: string | null) => void;
}

const statusOptions: { value: ChecklistStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'staff-checked', label: 'Staff checked' },
  { value: 'admin-verified', label: 'Admin verified' },
  { value: 'complete', label: 'Complete' },
];

const statusIcon = (s: ChecklistStatus) => {
  switch (s) {
    case 'complete':
    case 'admin-verified':
      return <ShieldCheck className="h-4 w-4 text-primary" />;
    case 'staff-checked':
      return <UserCheck className="h-4 w-4 text-muted-foreground" />;
    default:
      return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
  }
};

const LinkEditor = ({ value, onSave }: { value?: string; onSave: (v: string | null) => void }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(value ?? ''); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit link">
          {value ? <Pencil className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-2" align="end">
        <div className="text-xs font-medium text-foreground">Reference link</div>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://…"
          className="h-8 text-sm"
        />
        <div className="flex justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => { onSave(null); setOpen(false); }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => { onSave(draft.trim() || null); setOpen(false); }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ChecklistItemRow = ({ item, viewerIsAdmin, onChange, onLinkChange }: Props) => {
  // Staff can only flip pending <-> staff-checked on their own items.
  const allowed: ChecklistStatus[] = viewerIsAdmin
    ? ['pending', 'staff-checked', 'admin-verified', 'complete']
    : item.owner === 'staff'
      ? ['pending', 'staff-checked']
      : [];

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {statusIcon(item.status)}
        <div className="min-w-0">
          <div className="text-sm text-foreground truncate flex items-center gap-1.5">
            {item.label}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex"
                aria-label={`Open reference for ${item.label}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="text-xs text-muted-foreground capitalize">{item.owner} task</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex">
          {statusOptions.find((o) => o.value === item.status)?.label}
        </Badge>
        {viewerIsAdmin && onLinkChange && (
          <LinkEditor value={item.link} onSave={onLinkChange} />
        )}
        {allowed.length > 0 ? (
          <Select value={item.status} onValueChange={(v) => onChange(v as ChecklistStatus)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions
                .filter((o) => allowed.includes(o.value))
                .map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3" /> Admin only
          </span>
        )}
      </div>
    </div>
  );
};

export default ChecklistItemRow;
