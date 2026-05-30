import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import type { RequestSummary } from '@/lib/internal-hub/types';

const MyRecentRequestsPreview = ({ items }: { items: RequestSummary[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base">My Recent Requests</CardTitle>
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
        <Link to="/staff/requests">View all</Link>
      </Button>
    </CardHeader>
    <CardContent className="pt-0">
      {items.length === 0 ? (
        <div className="py-6 flex flex-col items-center text-center gap-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">No recent requests</div>
          <Button asChild size="sm" variant="outline">
            <Link to="/staff/requests?new=true"><Plus className="h-3.5 w-3.5 mr-1" />Create Request</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((r) => (
            <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="text-foreground">{r.type}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
              </div>
              <span className="text-xs text-muted-foreground">{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default MyRecentRequestsPreview;
