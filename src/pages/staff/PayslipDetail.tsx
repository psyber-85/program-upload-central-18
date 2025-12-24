import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollLocalRepo } from '@/lib/dal/localStorage/PayrollLocalRepo';
import { Payslip } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const PayslipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayslip();
  }, [id]);

  const loadPayslip = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const allPayslips = await payrollLocalRepo.getPayslips();
      const found = allPayslips.find(p => p.id === id);
      setPayslip(found || null);
    } catch (error) {
      console.error('Failed to load payslip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    toast({ title: 'PDF download will be available soon' });
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return format(new Date(parseInt(year), parseInt(m) - 1), 'MMMM yyyy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/2 mb-6" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Payslip not found</h1>
          <Button onClick={() => navigate('/staff/payslips')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payslips
          </Button>
        </div>
      </div>
    );
  }

  const deductions = payslip.epf + payslip.socso;
  const additions = payslip.claimsTotal + payslip.trainingClaimsTotal;
  const grossPay = payslip.baseSalary + additions;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/staff/payslips')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payslips
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payslip
              </CardTitle>
              <CardDescription>{formatMonth(payslip.month)}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Earnings */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Earnings
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary</span>
                  <span className="font-medium">RM {payslip.baseSalary.toLocaleString()}</span>
                </div>
                {payslip.claimsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Claims Reimbursement</span>
                    <span className="font-medium text-green-600">+ RM {payslip.claimsTotal.toLocaleString()}</span>
                  </div>
                )}
                {payslip.trainingClaimsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Training Claims</span>
                    <span className="font-medium text-green-600">+ RM {payslip.trainingClaimsTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-medium">
                <span>Gross Pay</span>
                <span>RM {grossPay.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Deductions
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>EPF (Employee)</span>
                  <span className="font-medium text-red-600">- RM {payslip.epf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>SOCSO (Employee)</span>
                  <span className="font-medium text-red-600">- RM {payslip.socso.toLocaleString()}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-medium">
                <span>Total Deductions</span>
                <span className="text-red-600">- RM {deductions.toLocaleString()}</span>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Pay</span>
                <span className="text-2xl font-bold text-primary">RM {payslip.netPay.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayslipDetail;
