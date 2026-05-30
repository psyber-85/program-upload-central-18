import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ToolAccessItem, ToolAccessStatus } from '@/lib/internal-hub/types';
import { TOOL_STATUS_LABELS } from '@/lib/internal-hub/types';

interface Props {
  item: ToolAccessItem;
  viewerIsAdmin: boolean;
  onChange: (patch: Partial<ToolAccessItem>) => void;
}

const statuses: ToolAccessStatus[] = ['NotNeeded', 'Pending', 'Granted', 'Removed', 'NeedsReview'];

const ToolAccessRow = ({ item, viewerIsAdmin, onChange }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center py-3 border-b border-border last:border-0">
      <div className="md:col-span-3 text-sm font-medium text-foreground">{item.label}</div>
      <div className="md:col-span-3">
        <Input
          placeholder="Link (optional)"
          value={item.link ?? ''}
          disabled={!viewerIsAdmin}
          onChange={(e) => onChange({ link: e.target.value })}
          className="h-8"
        />
      </div>
      <div className="md:col-span-2">
        <Input
          placeholder="Owner"
          value={item.owner ?? ''}
          disabled={!viewerIsAdmin}
          onChange={(e) => onChange({ owner: e.target.value })}
          className="h-8"
        />
      </div>
      <div className="md:col-span-2">
        <Select
          value={item.status}
          disabled={!viewerIsAdmin}
          onValueChange={(v) => onChange({ status: v as ToolAccessStatus })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {TOOL_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Input
          placeholder="Note"
          value={item.usageNote ?? ''}
          disabled={!viewerIsAdmin}
          onChange={(e) => onChange({ usageNote: e.target.value })}
          className="h-8"
        />
      </div>
    </div>
  );
};

export default ToolAccessRow;
