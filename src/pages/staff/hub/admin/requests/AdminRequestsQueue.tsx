// Patch 1.4 §9/§10 — Grouped admin requests queue with filters.
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { requestRepo, type RequestRow, type RequestKind, type RequestStatusDb } from '@/lib/internal-hub/repos/requestRepo';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import RequestStatusBadge from '@/components/internal-hub/requests/RequestStatusBadge';
import { supabase } from '@/integrations/supabase/client';

type Bucket = 'leave-mc' | 'claims' | 'training' | 'benefits-other';

const BUCKET_LABEL: Record<Bucket, string> = {
  'leave-mc': 'Leave / MC',
  'claims': 'Claims',
  'training': 'Training',
  'benefits-other': 'Benefits / Other',
};

function bucketOf(r: RequestRow): Bucket {
  if (r.kind === 'Leave' || r.kind === 'MC') return 'leave-mc';
  if (r.kind === 'Claim') return 'claims';
  if (r.kind === 'Training') return 'training';
  return 'benefits-other';
}

async function listAllNotArchived(): Promise<RequestRow[]> {
  const { data, error } = await supabase
    .from('ih_requests')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []) as RequestRow[];
}

const AdminRequestsQueue: React.FC = () => {
  const [params] = useSearchParams();
  const initialBucket = (params.get('bucket') as Bucket | null) ?? 'leave-mc';
  const [status, setStatus] = useState<RequestStatusDb | 'All'>('Submitted');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<RequestKind | 'All'>('All');
  const [search, setSearch] = useState('');

  const { data: rows = [] } = useQuery({ queryKey: ['ih-admin-requests-all'], queryFn: listAllNotArchived });
  const { data: staff = [] } = useQuery({ queryKey: ['ih-staff-list'], queryFn: () => staffRepo.list() });
  const nameById = useMemo(() => new Map(staff.map((s) => [s.id, s.fullName])), [staff]);

  const filterBy = (bucket: Bucket) => rows.filter((r) => {
    if (bucketOf(r) !== bucket) return false;
    if (status !== 'All' && r.status !== status) return false;
    if (staffFilter !== 'all' && r.staff_id !== staffFilter) return false;
    if (kindFilter !== 'All' && r.kind !== kindFilter) return false;
    if (search) {
      const hay = `${r.kind} ${nameById.get(r.staff_id) ?? ''} ${JSON.stringify(r.payload)}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const counts: Record<Bucket, number> = {
    'leave-mc': rows.filter((r) => bucketOf(r) === 'leave-mc' && r.status === 'Submitted').length,
    'claims': rows.filter((r) => bucketOf(r) === 'claims' && r.status === 'Submitted').length,
    'training': rows.filter((r) => bucketOf(r) === 'training' && r.status === 'Submitted').length,
    'benefits-other': rows.filter((r) => bucketOf(r) === 'benefits-other' && r.status === 'Submitted').length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Approval Queue</h1>
        <p className="text-sm text-muted-foreground">All request types, grouped. Click a row to review.</p>
      </div>

      <Card>
        <CardContent className="py-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatusDb | 'All')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any status</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="NeedsCorrection">Needs Correction</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger><SelectValue placeholder="Staff" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any staff</SelectItem>
              {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as RequestKind | 'All')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any kind</SelectItem>
              <SelectItem value="Leave">Leave</SelectItem>
              <SelectItem value="MC">MC</SelectItem>
              <SelectItem value="Claim">Claim</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Benefit">Benefit / Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue={initialBucket}>
        <TabsList className="flex flex-wrap">
          {(Object.keys(BUCKET_LABEL) as Bucket[]).map((b) => (
            <TabsTrigger key={b} value={b}>
              {BUCKET_LABEL[b]} {counts[b] > 0 && <span className="ml-1 text-xs">({counts[b]})</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(BUCKET_LABEL) as Bucket[]).map((b) => {
          const items = filterBy(b);
          return (
            <TabsContent key={b} value={b} className="mt-3 space-y-2">
              {items.length === 0 ? (
                <Card><CardContent className="py-6 text-sm text-center text-muted-foreground">No requests match.</CardContent></Card>
              ) : items.map((r) => (
                <Card key={r.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.kind}{r.payload?.kind_label === 'Other' ? ' (Other)' : ''}</span>
                        <RequestStatusBadge status={r.status} kind={r.kind} subState={r.sub_state} />
                        <span className="text-xs text-muted-foreground">#{r.id.slice(0, 8)} · {nameById.get(r.staff_id) ?? 'Staff'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.payload?.amount != null && `MYR ${Number(r.payload.amount).toFixed(2)} · `}
                        {r.payload?.category && `${String(r.payload.category)} · `}
                        {r.payload?.topic && `${String(r.payload.topic)} · `}
                        {r.payload?.start_date && `${String(r.payload.start_date)}${r.payload?.end_date && r.payload.end_date !== r.payload.start_date ? ` → ${r.payload.end_date}` : ''} · `}
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/staff/requests/${r.id}`}>Review</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AdminRequestsQueue;
