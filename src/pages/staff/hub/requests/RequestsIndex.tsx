// Patch 1.4 §8 — Staff requests list with deep-link to New/Detail + NextAction.
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { requestRepo, type RequestRow } from '@/lib/internal-hub/repos/requestRepo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks } from 'lucide-react';
import RequestStatusBadge from '@/components/internal-hub/requests/RequestStatusBadge';
import NextActionButton from '@/components/internal-hub/requests/NextActionButton';

function summarise(row: RequestRow): string {
  const p: any = row.payload ?? {};
  if (row.kind === 'Claim') return `MYR ${p.amount ?? '?'} · ${p.category ?? ''}`;
  if (row.kind === 'Training') return p.course_name ?? p.provider ?? 'Training';
  if (row.kind === 'Benefit') return p.topic ?? p.summary ?? 'Benefit / Other';
  const range = `${p.start_date ?? '?'}${p.end_date && p.end_date !== p.start_date ? ` → ${p.end_date}` : ''}`;
  return `${range}${row.half_day_slot ? ` · ½ ${row.half_day_slot}` : ''}`;
}

const RequestsIndex: React.FC = () => {
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);

  const { data: mine = [], isLoading } = useQuery({
    queryKey: ['ih-requests-mine', currentStaff?.id],
    queryFn: () => requestRepo.listForStaff(currentStaff!.id),
    enabled: !!currentStaff,
  });

  const sorted = useMemo(
    () => [...mine].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [mine]
  );

  if (!currentStaff) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Requests</h1>
          <p className="text-sm text-muted-foreground">
            Leave, MC, Claims, Training, Benefits, and other admin requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/staff/admin/requests">
                <ListChecks className="h-4 w-4 mr-1" /> Admin Queue
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/staff/requests/new">
              <Plus className="h-4 w-4 mr-1" /> New Request
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No requests yet.</p>
            <Button asChild size="sm">
              <Link to="/staff/requests/new"><Plus className="h-4 w-4 mr-1" /> New Request</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map(row => (
            <Card key={row.id}>
              <CardContent className="py-3 flex items-center justify-between gap-3">
                <Link to={`/staff/requests/${row.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{row.kind}</span>
                    <RequestStatusBadge status={row.status} kind={row.kind} subState={row.sub_state ?? undefined} />
                    <span className="text-xs text-muted-foreground">
                      · {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{summarise(row)}</p>
                </Link>
                <NextActionButton row={row} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsIndex;
