import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollLocalRepo } from '@/lib/dal/localStorage/PayrollLocalRepo';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { PayrollRun, PayrollItem, ClaimRequest, TrainingApplication } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const PayrollRunDetail = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [runId]);

  const loadData = async () => {
    if (!runId) return;
    setIsLoading(true);
    try {
      const [payrollRun, payrollItems] = await Promise.all([
        payrollLocalRepo.getPayrollRunById(runId),
        payrollLocalRepo.getPayrollItems(runId),
      ]);
      setRun(payrollRun);
      setItems(payrollItems);
    } catch (error) {
      console.error('Failed to load payroll data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateItems = async () => {
    if (!run) return;
    setIsGenerating(true);
    try {
      // Clear existing items
      await payrollLocalRepo.clearPayrollItems(run.id);
      
      // Get all active staff
      const activeStaff = await staffLocalRepo.getActiveStaff();
      
      // Get approved claims for payroll (not yet included in any payroll)
      const approvedClaims = await requestsLocalRepo.getApprovedClaimsForPayroll(run.month);
      
      // Get claimed training for payroll
      const claimedTraining = await requestsLocalRepo.getClaimedTrainingForPayroll();
      
      // Group claims by userId
      const claimsByUser: Record<string, ClaimRequest[]> = {};
      for (const claim of approvedClaims) {
        if (!claimsByUser[claim.userId]) {
          claimsByUser[claim.userId] = [];
        }
        claimsByUser[claim.userId].push(claim);
      }
      
      // Group training by userId
      const trainingByUser: Record<string, TrainingApplication[]> = {};
      for (const training of claimedTraining) {
        if (!trainingByUser[training.userId]) {
          trainingByUser[training.userId] = [];
        }
        trainingByUser[training.userId].push(training);
      }
      
      // Generate payroll items for each staff
      for (const staff of activeStaff) {
        const epf = Math.round(staff.salaryBase * (staff.epfRate / 100));
        const socso = Math.round(staff.salaryBase * (staff.socsoRate / 100));
        
        // Employer contributions (default: EPF 13%, SOCSO same as employee rate)
        const employerEpfRate = 13; // Standard employer EPF rate
        const employerEpf = Math.round(staff.salaryBase * (employerEpfRate / 100));
        const employerSocso = socso; // Employer pays same as employee for SOCSO
        
        // Calculate claims for this staff member
        const staffClaims = claimsByUser[staff.id] || [];
        const claimsTotal = staffClaims.reduce((sum, claim) => sum + claim.amount, 0);
        
        // Calculate training claims for this staff member
        const staffTraining = trainingByUser[staff.id] || [];
        const trainingClaimsTotal = staffTraining.reduce((sum, training) => sum + training.cost, 0);
        
        const netPay = staff.salaryBase - epf - socso + claimsTotal + trainingClaimsTotal;
        const totalCompanyCost = staff.salaryBase + employerEpf + employerSocso + claimsTotal + trainingClaimsTotal;
        
        await payrollLocalRepo.addPayrollItem({
          runId: run.id,
          userId: staff.id,
          userName: staff.name,
          baseSalary: staff.salaryBase,
          epf,
          socso,
          employerEpf,
          employerSocso,
          claimsTotal,
          trainingClaimsTotal,
          netPay,
          totalCompanyCost,
        });
      }
      
      toast({ title: 'Payroll items generated with claims and training!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to generate items', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async () => {
    if (!run || items.length === 0) return;
    setIsFinalizing(true);
    try {
      // Get approved claims to mark as included
      const approvedClaims = await requestsLocalRepo.getApprovedClaimsForPayroll(run.month);
      
      // Get claimed training to mark as included
      const claimedTraining = await requestsLocalRepo.getClaimedTrainingForPayroll();
      
      // Get staff details for email sending
      const allStaff = await staffLocalRepo.getAllStaff();
      const staffMap = new Map(allStaff.map(s => [s.id, s]));
      
      // Mark all included claims
      for (const claim of approvedClaims) {
        await requestsLocalRepo.markClaimIncludedInPayroll(claim.id, run.month);
      }
      
      // Mark all included training
      for (const training of claimedTraining) {
        await requestsLocalRepo.markTrainingIncludedInPayroll(training.id, run.month);
      }
      
      // Finalize the run
      await payrollLocalRepo.finalizePayrollRun(run.id);
      
      // Create payslips for each item
      for (const item of items) {
        await payrollLocalRepo.createPayslip({
          runId: run.id,
          userId: item.userId,
          month: run.month,
          baseSalary: item.baseSalary,
          epf: item.epf,
          socso: item.socso,
          employerEpf: item.employerEpf,
          employerSocso: item.employerSocso,
          claimsTotal: item.claimsTotal,
          trainingClaimsTotal: item.trainingClaimsTotal,
          netPay: item.netPay,
        });
      }
      
      // Send email notifications to each staff member
      let emailsSent = 0;
      let emailsFailed = 0;
      
      for (const item of items) {
        const staff = staffMap.get(item.userId);
        if (staff?.email) {
          try {
            const { error } = await supabase.functions.invoke('send-payslip-notification', {
              body: {
                recipientEmail: staff.email,
                recipientName: item.userName,
                month: formatMonth(run.month),
                baseSalary: item.baseSalary,
                epf: item.epf,
                socso: item.socso,
                claimsTotal: item.claimsTotal,
                trainingClaimsTotal: item.trainingClaimsTotal,
                netPay: item.netPay,
              },
            });
            
            if (error) {
              console.error('Failed to send payslip email to', staff.email, error);
              emailsFailed++;
            } else {
              emailsSent++;
            }
          } catch (err) {
            console.error('Error sending payslip email:', err);
            emailsFailed++;
          }
        }
      }
      
      toast({ 
        title: 'Payroll finalized!',
        description: `Payslips created. ${emailsSent} email(s) sent${emailsFailed > 0 ? `, ${emailsFailed} failed` : ''}. ${approvedClaims.length} claims and ${claimedTraining.length} training reimbursements marked as paid.`,
      });
      navigate('/staff/payroll');
    } catch (error) {
      toast({ title: 'Failed to finalize', variant: 'destructive' });
    } finally {
      setIsFinalizing(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return format(new Date(parseInt(year), parseInt(m) - 1), 'MMMM yyyy');
  };

  const totalNetPay = items.reduce((sum, item) => sum + item.netPay, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/2 mb-6" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Payroll run not found</h1>
          <Button onClick={() => navigate('/staff/payroll')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
        </div>
      </div>
    );
  }

  const isFinalized = run.status === 'Finalized';

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/staff/payroll')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payroll
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{formatMonth(run.month)} Payroll</CardTitle>
              <CardDescription>
                {isFinalized ? (
                  <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalized
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 mt-2">
                    Draft
                  </Badge>
                )}
              </CardDescription>
            </div>
            {!isFinalized && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleGenerateItems} disabled={isGenerating}>
                  {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {items.length > 0 ? 'Regenerate' : 'Generate'} Items
                </Button>
                <Button onClick={handleFinalize} disabled={isFinalizing || items.length === 0}>
                  {isFinalizing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Finalize Payroll
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="text-muted-foreground mb-4">No payroll items generated yet</p>
                <Button onClick={handleGenerateItems} disabled={isGenerating}>
                  {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate Payroll Items
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead className="text-right">Base Salary</TableHead>
                        <TableHead className="text-right">EPF (E)</TableHead>
                        <TableHead className="text-right">SOCSO (E)</TableHead>
                        <TableHead className="text-right">EPF (ER)</TableHead>
                        <TableHead className="text-right">SOCSO (ER)</TableHead>
                        <TableHead className="text-right">Claims</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead className="text-right">Company Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.userName}</TableCell>
                          <TableCell className="text-right">RM {item.baseSalary.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">-RM {item.epf.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">-RM {item.socso.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">RM {item.employerEpf.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">RM {item.employerSocso.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {(item.claimsTotal + item.trainingClaimsTotal) > 0 ? `+RM ${(item.claimsTotal + item.trainingClaimsTotal).toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">RM {item.netPay.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">RM {item.totalCompanyCost.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Total Net Payroll (to employees)</span>
                    <span className="text-lg font-bold">RM {totalNetPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Company Cost (incl. employer contributions)</span>
                    <span className="text-xl font-bold text-primary">RM {items.reduce((sum, item) => sum + item.totalCompanyCost, 0).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollRunDetail;
