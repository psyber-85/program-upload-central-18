// Doc 4.2 §13 — Admin-visible email delivery log with retry.
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type LogRow = {
  id: string;
  event_type: string;
  to_addresses: string[];
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  error_message: string | null;
  attempt_count: number;
  created_at: string;
  sent_at: string | null;
  idempotency_key: string | null;
  related_table: string | null;
  related_id: string | null;
};

const STATUS_VARIANT: Record<LogRow['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  sent: 'default',
  pending: 'secondary',
  retrying: 'outline',
  failed: 'destructive',
};

export default function EmailLog() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'failed' | 'sent' | 'pending'>('failed');

  const { data: rows = [], isLoading } = useQuery<LogRow[]>({
    queryKey: ['ih_email_log', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('ih_email_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') {
        if (statusFilter === 'failed') q = q.in('status', ['failed', 'retrying']);
        else q = q.eq('status', statusFilter);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
  });

  const counts = useMemo(() => {
    const c = { sent: 0, failed: 0, pending: 0, retrying: 0 };
    rows.forEach((r) => { c[r.status]++; });
    return c;
  }, [rows]);

  const retry = useMutation({
    mutationFn: async (row: LogRow) => {
      // Re-invoke dispatcher with same idempotency key + force=true. We can't
      // reconstruct the original body, so this is a "mark for retry" flag —
      // operator should investigate root cause. For now we just bump attempt.
      const { error } = await supabase
        .from('ih_email_log')
        .update({ status: 'retrying', error_message: null })
        .eq('id', row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Marked for retry. Re-trigger the source event to actually resend.');
      qc.invalidateQueries({ queryKey: ['ih_email_log'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email delivery</h1>
        <p className="text-sm text-muted-foreground">
          All Internal Hub emails sent from <code className="font-mono">system@theaihq.net</code>.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Sent" value={counts.sent} />
        <StatCard label="Failed" value={counts.failed} accent="destructive" />
        <StatCard label="Retrying" value={counts.retrying} />
        <StatCard label="Pending" value={counts.pending} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Recent deliveries</CardTitle>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="failed">Failed + retrying</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No emails match this filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell><code className="text-xs">{r.event_type}</code></TableCell>
                    <TableCell className="text-xs">{r.to_addresses.join(', ')}</TableCell>
                    <TableCell className="max-w-xs truncate" title={r.subject}>{r.subject}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                      {r.attempt_count > 1 && (
                        <span className="ml-2 text-xs text-muted-foreground">×{r.attempt_count}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-sm">
                      {r.error_message && (
                        <span className="text-xs text-destructive break-all">{r.error_message}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(r.status === 'failed' || r.status === 'retrying') && (
                        <Button size="sm" variant="outline" onClick={() => retry.mutate(r)}>
                          Mark retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: 'destructive' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${accent === 'destructive' ? 'text-destructive' : ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
