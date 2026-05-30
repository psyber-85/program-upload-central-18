import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '@/lib/internal-hub/HubContext';
import { noticeRepo } from '@/lib/internal-hub';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, ShieldAlert, Megaphone } from 'lucide-react';
import { NoticeImportanceBadge, NoticeTypeBadge } from '@/components/internal-hub/notices/NoticeBadges';

type Filter = 'all' | 'unread' | 'ack' | 'archived';

const NoticesList = () => {
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);
  const [filter, setFilter] = useState<Filter>('all');
  const [tick, setTick] = useState(0);
  void tick;

  const items = useMemo(() => {
    if (!currentStaff) return [];
    const all = noticeRepo.visibleFor(currentStaff, { includeArchived: filter === 'archived' && isAdmin });
    if (filter === 'unread') return all.filter((n) => !noticeRepo.isReadBy(n.id, currentStaff.id));
    if (filter === 'ack') return all.filter((n) => n.importance === 'AcknowledgmentRequired' && !noticeRepo.ackBy(n.id, currentStaff.id));
    if (filter === 'archived') return all.filter((n) => n.archived);
    return all.filter((n) => !n.archived);
  }, [currentStaff?.id, filter, tick]);

  if (!currentStaff) return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notices</h1>
          <p className="text-sm text-muted-foreground mt-1">Official AIHQ communication and updates.</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/staff/admin/notices/new"><Megaphone className="h-4 w-4 mr-1" />Broadcast</Link>
          </Button>
        )}
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="ack">Ack required</TabsTrigger>
          {isAdmin && <TabsTrigger value="archived">Archived</TabsTrigger>}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{items.length} notice{items.length === 1 ? '' : 's'}</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No notices in this view.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const read = noticeRepo.isReadBy(n.id, currentStaff.id);
                const ackDone = !!noticeRepo.ackBy(n.id, currentStaff.id);
                return (
                  <li key={n.id}>
                    <Link
                      to={`/staff/notices/${n.id}`}
                      className="flex items-start gap-3 py-3 hover:bg-accent/30 -mx-2 px-2 rounded"
                    >
                      <span className="mt-1 shrink-0">
                        {n.importance === 'AcknowledgmentRequired' ? (
                          <ShieldAlert className={ackDone ? 'h-4 w-4 text-muted-foreground' : 'h-4 w-4 text-destructive'} />
                        ) : (
                          <Bell className={read ? 'h-4 w-4 text-muted-foreground' : 'h-4 w-4 text-primary'} />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>{n.title}</span>
                          <NoticeTypeBadge type={n.type} />
                          <NoticeImportanceBadge importance={n.importance} />
                          {n.archived && <span className="text-[10px] text-muted-foreground uppercase">Archived</span>}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{n.message}</div>
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
    </div>
  );
};

export default NoticesList;
