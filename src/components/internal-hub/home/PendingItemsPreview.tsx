import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import type { PendingItem } from '@/lib/internal-hub/workbench/types';
import { ACTION_LABELS } from '@/lib/internal-hub/workbench/types';
import { markViewed } from '@/lib/internal-hub/workbench/pendingItems';

interface Props {
  items: PendingItem[];
  limit?: number;
  fullPageHref?: string;
}

const priorityClass = {
  urgent: 'bg-destructive',
  normal: 'bg-primary',
  info: 'bg-muted-foreground',
} as const;

const PendingItemsPreview = ({ items, limit = 4, fullPageHref = '/staff/pending' }: Props) => {
  const shown = items.slice(0, limit);
  const remaining = Math.max(0, items.length - shown.length);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          My Pending Items
          {items.length > 0 && (
            <Badge variant="secondary" className="h-5">{items.length}</Badge>
          )}
        </CardTitle>
        {items.length > limit && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
            <Link to={fullPageHref}>View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {shown.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <div className="text-sm text-muted-foreground">You're all caught up.</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((item) => (
              <li key={item.id} className="py-2.5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${priorityClass[item.priority]}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground truncate">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    )}
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
                    <Link to={item.href} onClick={() => markViewed(item.id)}>
                      {ACTION_LABELS[item.primaryAction]}
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
            {remaining > 0 && (
              <li className="pt-2 text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {remaining} more pending item{remaining === 1 ? '' : 's'} —{' '}
                <Link to={fullPageHref} className="underline">see all</Link>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingItemsPreview;
