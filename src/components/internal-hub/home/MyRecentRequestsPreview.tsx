import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import type { RequestSummary } from '@/lib/internal-hub/types';
import type { RequestDetail } from '@/lib/internal-hub/repos/requestSummaryRepo';

interface Props {
  items: RequestSummary[];
  needsCorrection?: RequestDetail[];
}

const statusTone = (s: RequestSummary['status']) =>
  s === 'Approved' ? 'text-emerald-600'
  : s === 'Rejected' ? 'text-destructive'
  : 'text-muted-foreground';

const MyRecentRequestsPreview = ({ items, needsCorrection = [] }: Props) => {
  const ncIds = new Set(needsCorrection.map((r) => r.id));
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          My Recent Requests
          {needsCorrection.length > 0 && (
            <Badge variant="destructive" className="h-5 text-[10px]">
              {needsCorrection.length} needs fix
            </Badge>
          )}
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link to="/staff/requests">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 && needsCorrection.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">No recent requests yet.</div>
            <Button asChild size="sm" variant="outline">
              <Link to="/staff/requests?new=true"><Plus className="h-3.5 w-3.5 mr-1" />Create Request</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {needsCorrection.map((r) => (
              <li key={`nc-${r.id}`} className="py-2.5 flex items-center justify-between text-sm gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <div className="text-foreground truncate">{r.type} — Needs Correction</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link to="/staff/requests">Fix Request</Link>
                </Button>
              </li>
            ))}
            {items.filter((r) => !ncIds.has(r.id)).map((r) => (
              <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="text-foreground">{r.type}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
                </div>
                <span className={`text-xs ${statusTone(r.status)}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRecentRequestsPreview;
