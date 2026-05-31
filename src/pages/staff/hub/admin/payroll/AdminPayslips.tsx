import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, ShieldAlert, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { payslipRepo } from '@/lib/internal-hub';
import { CONFIDENTIAL_PAYSLIP_LABEL } from '@/lib/internal-hub/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminPayslips = () => {
  const { currentStaff } = useHub();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [month, setMonth] = useState('');

  const { data: all = [] } = useQuery({
    queryKey: ['ih-payslips-all'],
    queryFn: () => payslipRepo.listAll(),
    enabled: !!currentStaff && canAccessAdminArea(currentStaff),
  });

  // Doc 4.2 §33 — admin-visible PDF status (raw row read for pdf_error/pdf_path).
  const { data: pdfStatus = {} } = useQuery({
    queryKey: ['ih-payslips-pdf-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ih_payslips')
        .select('id, pdf_path, pdf_error, pdf_generated_at');
      const map: Record<string, { path: string | null; error: string | null; generatedAt: string | null }> = {};
      (data ?? []).forEach((r: any) => {
        map[r.id] = { path: r.pdf_path, error: r.pdf_error, generatedAt: r.pdf_generated_at };
      });
      return map;
    },
    enabled: !!currentStaff && canAccessAdminArea(currentStaff),
    refetchInterval: 15000,
  });

  const downloadMut = useMutation({
    mutationFn: (id: string) =>
      payslipRepo.downloadPdf(id, currentStaff!.id, currentStaff!.role),
    onError: (e: Error) =>
      toast({ title: 'Download failed', description: e.message, variant: 'destructive' }),
  });
  const regenMut = useMutation({
    mutationFn: (id: string) => payslipRepo.regeneratePdf(id),
    onSuccess: () => {
      toast({ title: 'PDF regeneration triggered' });
      qc.invalidateQueries({ queryKey: ['ih-payslips-pdf-status'] });
    },
    onError: (e: Error) =>
      toast({ title: 'Regenerate failed', description: e.message, variant: 'destructive' }),
  });

  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (month && p.month !== month) return false;
      if (q && !p.staffName.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [all, q, month]);

  const months = useMemo(
    () => Array.from(new Set(all.map((p) => p.month))).sort().reverse(),
    [all],
  );

  if (!canAccessAdminArea(currentStaff)) {
    return <div className="p-6 text-sm text-muted-foreground">Admin only.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">All Payslips</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <ShieldAlert className="h-3.5 w-3.5" /> {CONFIDENTIAL_PAYSLIP_LABEL}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search staff…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All months</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">No payslips.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.staffName}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.month} · Net {p.netPay.toFixed(2)} · Finalized {new Date(p.finalizedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.availability}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/staff/payslips/${p.id}`}>View</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadMut.mutate(p.id)}>
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayslips;
