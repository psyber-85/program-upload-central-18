// Doc 4.3 §13–§15 — Admin-only System Issues view.
// Unifies operational failures (email, calendar, PDF, welcome email) into one
// simple list with retry actions. Not an observability platform.
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { listSystemIssues, retryIssue, SystemIssue, IssueType, IssueStatus } from '@/lib/internal-hub/repos/systemIssuesRepo';

const TYPE_LABEL: Record<IssueType, string> = {
  email: 'Email',
  calendar: 'Calendar',
  pdf: 'Payslip PDF',
  welcome_email: 'Welcome email',
};

export default function SystemIssues() {
  const qc = useQueryClient();
  const [type, setType] = useState<IssueType | 'all'>('all');
  const [status, setStatus] = useState<IssueStatus | 'all'>('open');
  const [sinceDays, setSinceDays] = useState(30);

  const { data: issues = [], isLoading } = useQuery<SystemIssue[]>({
    queryKey: ['ih_system_issues', type, status, sinceDays],
    queryFn: () => listSystemIssues({ type, status, sinceDays }),
  });

  const counts = useMemo(() => {
    const c: Record<IssueType, number> = { email: 0, calendar: 0, pdf: 0, welcome_email: 0 };
    issues.forEach((i) => { c[i.type]++; });
    return c;
  }, [issues]);

  const retry = useMutation({
    mutationFn: (issue: SystemIssue) => retryIssue(issue),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(res.message);
        qc.invalidateQueries({ queryKey: ['ih_system_issues'] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Retry failed'),
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">System Issues</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Operational failures across email, calendar, and PDF generation. Admin-only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup &amp; recovery</CardTitle>
          <CardDescription>
            Database backups are managed by Supabase. To request a restore or report a recovery
            issue, contact{' '}
            <a className="underline" href="mailto:wani@theaihq.net">wani@theaihq.net</a>.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(TYPE_LABEL) as IssueType[]).map((k) => (
          <Card key={k}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{TYPE_LABEL[k]}</div>
              <div className="text-2xl font-semibold">{counts[k]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Select value={type} onValueChange={(v) => setType(v as IssueType | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(Object.keys(TYPE_LABEL) as IssueType[]).map((k) => (
                  <SelectItem key={k} value={k}>{TYPE_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus | 'all')}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(sinceDays)} onValueChange={(v) => setSinceDays(Number(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : issues.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">No issues found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell><Badge variant="outline">{TYPE_LABEL[i.type]}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={i.status === 'open' ? 'destructive' : 'secondary'}>
                          {i.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate" title={i.summary}>{i.summary}</TableCell>
                      <TableCell className="max-w-[320px] text-xs text-muted-foreground" title={i.errorMessage ?? ''}>
                        {i.errorMessage ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(i.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {i.status === 'open' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={retry.isPending}
                            onClick={() => retry.mutate(i)}
                          >
                            Retry
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
