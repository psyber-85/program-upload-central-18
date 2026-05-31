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

// Patch 002 §21 — payslip section structure.
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase pt-3 pb-1 border-b border-border">
    {children}
  </div>
);

const Row = ({ label, value, muted = false, bold = false }: {
  label: string; value: string; muted?: boolean; bold?: boolean;
}) => (
  <div className={`flex justify-between py-1.5 text-sm ${bold ? 'font-semibold text-foreground' : ''}`}>
    <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
    <span>{value}</span>
  </div>
);

const fmt = (n: number) => n.toFixed(2);

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
  if (!isAdmin(currentStaff) && ps.staffId !== currentStaff.id) {
    return <div className="p-6 text-sm text-destructive">You don't have access to this payslip.</div>;
  }

  const totalIncome = ps.baseSalary;
  const additionsTotal = ps.claimsTotal + ps.trainingClaimsTotal + ps.bonusTotal + ps.otherAdditionTotal;
  const showAdditions = additionsTotal > 0;

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
            <span>Salary Statement for {ps.month}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadMut.mutate()}
              disabled={downloadMut.isPending}
              title={ps.pdfRef ? 'Download PDF' : 'PDF is still generating'}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              {ps.pdfRef ? 'Download PDF' : 'Download'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Staff Info */}
          <SectionTitle>Staff Info</SectionTitle>
          <Row label="Name" value={ps.staffName} muted />
          <Row label="Payroll month" value={ps.month} muted />
          <Row label="Finalized" value={new Date(ps.finalizedAt).toLocaleDateString()} muted />

          {/* Income */}
          <SectionTitle>Income</SectionTitle>
          <Row label="Basic Salary" value={fmt(ps.baseSalary)} />
          <Row label="Total Income" value={fmt(totalIncome)} bold />

          {/* Claims / Reimbursements / Bonus */}
          {showAdditions && (
            <>
              <SectionTitle>Claims / Reimbursements / Bonus</SectionTitle>
              {ps.claimsTotal > 0 && <Row label="Claim" value={`+${fmt(ps.claimsTotal)}`} />}
              {ps.trainingClaimsTotal > 0 && <Row label="Training Claim" value={`+${fmt(ps.trainingClaimsTotal)}`} />}
              {ps.bonusTotal > 0 && <Row label="Bonus" value={`+${fmt(ps.bonusTotal)}`} />}
              {ps.otherAdditionTotal > 0 && <Row label="Other Reimbursement / Addition" value={`+${fmt(ps.otherAdditionTotal)}`} />}
              <Row label="Subtotal" value={`+${fmt(additionsTotal)}`} bold />
            </>
          )}

          {/* Employee Deductions */}
          <SectionTitle>Employee Deductions</SectionTitle>
          <Row label="EPF" value={`-${fmt(ps.epf)}`} />
          <Row label="SOCSO" value={`-${fmt(ps.socso)}`} />
          <Row label="EIS" value={`-${fmt(ps.eis)}`} />
          <Row label="Total Employee Deductions" value={`-${fmt(ps.totalEmployeeDeductions)}`} bold />

          {ps.adjustment && (
            <>
              <SectionTitle>Manual Adjustment</SectionTitle>
              <Row label={`Adjustment (${ps.adjustment.reason})`} value={fmt(ps.adjustment.amount)} />
            </>
          )}

          {/* Net Pay */}
          <div className="flex justify-between py-3 mt-2 text-base font-semibold border-t-2 border-foreground">
            <span>Net Pay</span>
            <span>{fmt(ps.netPay)}</span>
          </div>

          {/* Employer Contributions */}
          <SectionTitle>Employer Contributions</SectionTitle>
          <Row label="Employer EPF" value={fmt(ps.employerEpf)} muted />
          <Row label="Employer SOCSO" value={fmt(ps.employerSocso)} muted />
          <Row label="Employer EIS" value={fmt(ps.employerEis)} muted />
          <Row label="Total Employer Contribution" value={fmt(ps.totalEmployerContribution)} bold />
          <p className="text-[11px] text-muted-foreground pt-1">
            Employer contributions are shown for transparency. They do not reduce your Net Pay.
          </p>

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
