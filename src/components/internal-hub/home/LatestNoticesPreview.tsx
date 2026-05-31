import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ShieldAlert } from 'lucide-react';
import type { Notice } from '@/lib/internal-hub/types';

interface Props {
  notices: Notice[];
  readSet: Set<string>;
}

const LatestNoticesPreview = ({ notices, readSet }: Props) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base">Latest Notices</CardTitle>
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
        <Link to="/staff/notices">View all</Link>
      </Button>
    </CardHeader>
    <CardContent className="pt-0">
      {notices.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">No notices yet.</div>
      ) : (
        <ul className="divide-y divide-border">
          {notices.map((n) => {
            const read = readSet.has(n.id);
            const ack = n.importance === 'AcknowledgmentRequired';
            return (
              <li key={n.id}>
                <Link
                  to={`/staff/notices/${n.id}`}
                  className="flex items-start gap-3 py-3 hover:bg-accent/30 -mx-2 px-2 rounded"
                >
                  <span className="mt-1 shrink-0">
                    {ack ? (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : (
                      <Bell className={read ? 'h-4 w-4 text-muted-foreground' : 'h-4 w-4 text-primary'} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {n.title}
                      </span>
                      {ack && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1">Ack</Badge>
                      )}
                      {n.importance === 'Important' && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">Important</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.message}</div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default LatestNoticesPreview;
