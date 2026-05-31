import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ShieldAlert, Receipt } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { payslipRepo } from '@/lib/internal-hub';
import { CONFIDENTIAL_PAYSLIP_LABEL, IT_SUPPORT_EMAIL } from '@/lib/internal-hub/types';
import { canAccessOwnPayslips } from '@/lib/internal-hub/access';
import { toast } from '@/hooks/use-toast';

const PayslipsIndex = () => {
  const { currentStaff } = useHub();
  const { data: items = [] } = useQuery({
    queryKey: ['ih-payslips', currentStaff?.id],
    queryFn: () => payslipRepo.listForStaff(currentStaff!.id),
    enabled: !!currentStaff && canAccessOwnPayslips(currentStaff),
  });
  const downloadMut = useMutation({
    mutationFn: (id: string) =>
      payslipRepo.downloadPdf(id, currentStaff!.id, currentStaff!.role),
    onError: (e: Error) =>
      toast({ title: 'Download failed', description: e.message, variant: 'destructive' }),
  });

  if (!currentStaff) return null;
  if (!canAccessOwnPayslips(currentStaff)) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Payslip access has been deactivated for your account. Contact HR at{' '}
            <a className="underline" href={`mailto:${IT_SUPPORT_EMAIL}`}>{IT_SUPPORT_EMAIL}</a>.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My Payslips</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <ShieldAlert className="h-3.5 w-3.5" /> {CONFIDENTIAL_PAYSLIP_LABEL}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly history</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center gap-2 text-muted-foreground">
              <Receipt className="h-6 w-6" />
              <div className="text-sm">No payslips available yet. Once payroll is finalized, your monthly payslip will appear here.</div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{p.month}</div>
                    <div className="text-xs text-muted-foreground">
                      Net {p.netPay.toFixed(2)} · Finalized {new Date(p.finalizedAt).toLocaleDateString()}
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

export default PayslipsIndex;
