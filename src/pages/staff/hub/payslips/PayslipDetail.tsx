import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { payslipRepo } from '@/lib/internal-hub';
import { CONFIDENTIAL_PAYSLIP_LABEL, IT_SUPPORT_EMAIL } from '@/lib/internal-hub/types';
import { isAdmin, canAccessOwnPayslips } from '@/lib/internal-hub/access';
import { toast } from '@/hooks/use-toast';

const Row = ({ label, value, neg = false }: { label: string; value: string; neg?: boolean }) => (
  <div className="flex justify-between py-1.5 text-sm border-b border-border last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className={neg ? 'text-destructive' : 'text-foreground'}>{value}</span>
  </div>
);

const PayslipDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { currentStaff } = useHub();
  const { data: ps, isLoading } = useQuery({
    queryKey: ['ih-payslip', id],
    queryFn: () => payslipRepo.getById(id),
    enabled: !!id,
  });
  const downloadMut = useMutation({
    mutationFn: () => payslipRepo.downloadPdf(ps!.id, currentStaff!.id, currentStaff!.role),
    onError: (e: Error) =>
      toast({ title: 'Download failed', description: e.message, variant: 'destructive' }),
  });

  if (!currentStaff) return null;
  if (!canAccessOwnPayslips(currentStaff)) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Payslip access has been deactivated for your account. Contact HR at{' '}
        <a className="underline" href={`mailto:${IT_SUPPORT_EMAIL}`}>{IT_SUPPORT_EMAIL}</a>.
      </div>
    );
  }
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!ps) return <div className="p-6 text-sm text-muted-foreground">Payslip not found.</div>;
  // Doc 3.2 §12 — staff sees only their own.
  if (!isAdmin(currentStaff) && ps.staffId !== currentStaff.id) {
    return <div className="p-6 text-sm text-destructive">You don't have access to this payslip.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <ShieldAlert className="h-3.5 w-3.5" /> {CONFIDENTIAL_PAYSLIP_LABEL}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Payslip · {ps.month}</span>
            <Button size="sm" variant="outline" onClick={() => downloadMut.mutate()}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row label="Staff" value={ps.staffName} />
          <Row label="Payroll Month" value={ps.month} />
          <Row label="Finalized" value={new Date(ps.finalizedAt).toLocaleDateString()} />
          <div className="h-2" />
          <Row label="Base Salary" value={ps.baseSalary.toFixed(2)} />
          <Row label="EPF" value={`-${ps.epf.toFixed(2)}`} neg />
          <Row label="SOCSO" value={`-${ps.socso.toFixed(2)}`} neg />
          <Row label="Claims" value={`+${ps.claimsTotal.toFixed(2)}`} />
          <Row label="Training Claims" value={`+${ps.trainingClaimsTotal.toFixed(2)}`} />
          {ps.adjustment && (
            <>
              <Row label="Manual Adjustment" value={ps.adjustment.amount.toFixed(2)} />
              <div className="text-xs text-muted-foreground pl-1">Reason: {ps.adjustment.reason}</div>
            </>
          )}
          <div className="flex justify-between py-2 text-base font-semibold border-t border-border mt-2">
            <span>Net Pay</span>
            <span>{ps.netPay.toFixed(2)}</span>
          </div>
          {ps.correctionRef && (
            <div className="text-xs text-muted-foreground pt-2">
              Correction reference: {ps.correctionRef}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipDetail;
