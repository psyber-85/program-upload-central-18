import React from 'react';
import { Check, CircleDashed, ShieldCheck, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ChecklistItem, ChecklistStatus } from '@/lib/internal-hub/types';

interface Props {
  item: ChecklistItem;
  viewerIsAdmin: boolean;
  onChange: (status: ChecklistStatus) => void;
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

const ChecklistItemRow = ({ item, viewerIsAdmin, onChange }: Props) => {
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
          <div className="text-sm text-foreground truncate">{item.label}</div>
          <div className="text-xs text-muted-foreground capitalize">{item.owner} task</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex">
          {statusOptions.find((o) => o.value === item.status)?.label}
        </Badge>
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
