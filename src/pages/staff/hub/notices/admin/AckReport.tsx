import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { noticeRepo, staffRepo } from '@/lib/internal-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Clock, Loader2 } from 'lucide-react';

const AckReport = () => {
  const { id = '' } = useParams();

  const { data: notice, isLoading: noticeLoading } = useQuery({
    queryKey: ['ih-notice', id],
    queryFn: () => noticeRepo.get(id),
    enabled: !!id,
  });
  const { data: allStaff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['ih-staff-list'],
    queryFn: () => staffRepo.list(),
  });
  const { data: report = { acknowledged: [], pending: [] }, isLoading: reportLoading } = useQuery({
    queryKey: ['ih-ack-report', id, allStaff.length],
    queryFn: () => noticeRepo.ackReport(id, allStaff),
    enabled: !!notice && allStaff.length > 0,
  });

  if (noticeLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…
      </div>
    );
  }
  if (!notice) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">Notice not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={`/staff/notices/${notice.id}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to notice</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-semibold text-foreground">Acknowledgment Report</h1>
        <p className="text-sm text-muted-foreground mt-1">{notice.title}</p>
      </header>

      {staffLoading || reportLoading ? (
        <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading staff…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />Acknowledged ({report.acknowledged.length})</CardTitle></CardHeader>
            <CardContent>
              {report.acknowledged.length === 0 ? (
                <p className="text-sm text-muted-foreground">No acknowledgments yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {report.acknowledged.map(({ staff, at }) => (
                    <li key={staff.id} className="py-2 text-sm flex items-center justify-between">
                      <span>{staff.fullName}</span>
                      <span className="text-xs text-muted-foreground">{at && new Date(at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-destructive" />Pending ({report.pending.length})</CardTitle></CardHeader>
            <CardContent>
              {report.pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everyone has acknowledged.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {report.pending.map((s) => (
                    <li key={s.id} className="py-2 text-sm">{s.fullName} <span className="text-xs text-muted-foreground">· {s.businessArm}</span></li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AckReport;
