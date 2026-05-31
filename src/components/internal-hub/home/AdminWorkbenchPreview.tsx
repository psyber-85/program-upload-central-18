import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { WorkbenchItem } from '@/lib/internal-hub/workbench/types';
import { ACTION_LABELS } from '@/lib/internal-hub/workbench/types';

interface Props {
  items: WorkbenchItem[];
  limit?: number;
  fullPageHref?: string;
}

const priorityClass = {
  urgent: 'bg-destructive',
  normal: 'bg-primary',
  info: 'bg-muted-foreground',
} as const;

const AdminWorkbenchPreview = ({ items, limit = 5, fullPageHref = '/staff/admin/workbench' }: Props) => {
  const shown = items.slice(0, limit);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Admin Workbench
          {items.length > 0 && <Badge variant="secondary" className="h-5">{items.length}</Badge>}
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link to={fullPageHref}>Open Workbench</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {shown.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <div className="text-sm text-muted-foreground">No items need attention.</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((item) => (
              <li key={item.id} className="py-2.5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${priorityClass[item.priority]}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground truncate">{item.title}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">{item.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.staffName ? `${item.staffName} · ` : ''}{item.status}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
                    <Link to={item.href}>
                      {ACTION_LABELS[item.primaryAction]}
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminWorkbenchPreview;
