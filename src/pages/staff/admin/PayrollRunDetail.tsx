import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollSupabaseRepo, staffSupabaseRepo, requestsSupabaseRepo } from '@/lib/dal';
import { PayrollRun, PayrollItem, ClaimRequest, TrainingApplication, UserProfile } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, Mail, Calendar, Info } from 'lucide-react';
import { format, getDaysInMonth, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface PayrollItemWithProRating extends PayrollItem {
  isProRated?: boolean;
  daysWorked?: number;
  totalWorkDays?: number;
  originalBaseSalary?: number;
  epfRate?: number;
  socsoRate?: number;
}

const DEFAULT_WORK_DAYS = 22;

const PayrollRunDetail = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [items, setItems] = useState<PayrollItemWithProRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Track individual work days per staff (userId -> daysWorked)
  const [staffWorkDays, setStaffWorkDays] = useState<Record<string, number>>({});
  // Staff rates for recalculation
  const [staffRates, setStaffRates] = useState<Record<string, { epfRate: number; socsoRate: number; originalSalary: number }>>({});

  useEffect(() => {
    loadData();
  }, [runId]);

  const loadData = async () => {
    if (!runId) return;
    setIsLoading(true);
    try {
      const [payrollRun, payrollItems] = await Promise.all([
        payrollSupabaseRepo.getPayrollRunById(runId),
        payrollSupabaseRepo.getPayrollItems(runId),
      ]);
      setRun(payrollRun);
      setItems(payrollItems);
    } catch (error) {
      console.error('Failed to load payroll data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProRatedSalary = (
    baseSalary: number,
    joinDate: string,
    payrollMonth: string
  ): { salary: number; daysWorked: number; totalDays: number; isProRated: boolean } => {
    const [year, month] = payrollMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(new Date(year, month - 1, 1));
    const staffJoinDate = parseISO(joinDate);
    
    // If joined before this month, full salary
    if (isBefore(staffJoinDate, monthStart)) {
      return { salary: baseSalary, daysWorked: DEFAULT_WORK_DAYS, totalDays: DEFAULT_WORK_DAYS, isProRated: false };
    }
    
    // If joined after this month ends, 0 salary
    if (isAfter(staffJoinDate, monthEnd)) {
      return { salary: 0, daysWorked: 0, totalDays: DEFAULT_WORK_DAYS, isProRated: true };
    }
    
    // Pro-rate: calculate based on calendar days ratio
    const totalCalendarDays = getDaysInMonth(monthStart);
    const remainingCalendarDays = differenceInCalendarDays(monthEnd, staffJoinDate) + 1;
    const ratio = remainingCalendarDays / totalCalendarDays;
    
    const daysWorked = Math.round(DEFAULT_WORK_DAYS * ratio);
    const salary = Math.round(baseSalary * (daysWorked / DEFAULT_WORK_DAYS));
    
    return { salary, daysWorked, totalDays: DEFAULT_WORK_DAYS, isProRated: true };
  };

  // Recalculate a single staff's payroll when their work days change
  const recalculatePayrollItem = (
    userId: string,
    newDaysWorked: number
  ) => {
    const rates = staffRates[userId];
    if (!rates) return;

    const ratio = newDaysWorked / DEFAULT_WORK_DAYS;
    const effectiveSalary = Math.round(rates.originalSalary * ratio);
    const epf = Math.round(effectiveSalary * (rates.epfRate / 100));
    const socso = Math.round(effectiveSalary * (rates.socsoRate / 100));
    const employerEpf = Math.round(effectiveSalary * (13 / 100));
    const employerSocso = socso;

    setItems(prev => prev.map(item => {
      if (item.userId !== userId) return item;
      
      const netPay = effectiveSalary - epf - socso + (item.claimsTotal || 0) + (item.trainingClaimsTotal || 0);
      const totalCompanyCost = effectiveSalary + employerEpf + employerSocso + (item.claimsTotal || 0) + (item.trainingClaimsTotal || 0);
      
      return {
        ...item,
        baseSalary: effectiveSalary,
        epf,
        socso,
        employerEpf,
        employerSocso,
        netPay,
        totalCompanyCost,
        daysWorked: newDaysWorked,
        isProRated: newDaysWorked < DEFAULT_WORK_DAYS,
      };
    }));
  };

  const handleUpdateWorkDays = (userId: string, daysWorked: number) => {
    const clampedDays = Math.max(0, Math.min(DEFAULT_WORK_DAYS, daysWorked || 0));
    setStaffWorkDays(prev => ({ ...prev, [userId]: clampedDays }));
    recalculatePayrollItem(userId, clampedDays);
  };

  const handleGenerateItems = async () => {
    if (!run) return;
    setIsGenerating(true);
    try {
      // Clear existing items
      await payrollSupabaseRepo.clearPayrollItems(run.id);
      
      // Get all active staff
      const activeStaff = await staffSupabaseRepo.getActiveStaff();
      
      // Get approved claims for payroll (not yet included in any payroll)
      const approvedClaims = await requestsSupabaseRepo.getApprovedClaimsForPayroll(run.month);
      
      // Get claimed training for payroll
      const claimedTraining = await requestsSupabaseRepo.getClaimedTrainingForPayroll();
      
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
      
      // Track rates and work days for each staff
      const newStaffRates: Record<string, { epfRate: number; socsoRate: number; originalSalary: number }> = {};
      const newStaffWorkDays: Record<string, number> = {};
      
      // Generate payroll items for each staff
      for (const staff of activeStaff) {
        // Calculate pro-rated salary based on join date
        const proRating = calculateProRatedSalary(
          staff.salaryBase,
          staff.joinDate,
          run.month
        );
        
        // Skip if salary is 0 (joined after month end)
        if (proRating.salary === 0) continue;
        
        const effectiveSalary = proRating.salary;
        const epf = Math.round(effectiveSalary * (staff.epfRate / 100));
        const socso = Math.round(effectiveSalary * (staff.socsoRate / 100));
        const employerEpf = Math.round(effectiveSalary * (13 / 100));
        const employerSocso = socso;
        
        // Calculate claims for this staff member
        const staffClaims = claimsByUser[staff.id] || [];
        const claimsTotal = staffClaims.reduce((sum, claim) => sum + claim.amount, 0);
        
        // Calculate training claims for this staff member
        const staffTraining = trainingByUser[staff.id] || [];
        const trainingClaimsTotal = staffTraining.reduce((sum, training) => sum + training.cost, 0);
        
        const netPay = effectiveSalary - epf - socso + claimsTotal + trainingClaimsTotal;
        const totalCompanyCost = effectiveSalary + employerEpf + employerSocso + claimsTotal + trainingClaimsTotal;
        
        // Store staff rates for later recalculation
        newStaffRates[staff.id] = {
          epfRate: staff.epfRate,
          socsoRate: staff.socsoRate,
          originalSalary: staff.salaryBase,
        };
        newStaffWorkDays[staff.id] = proRating.daysWorked;
        
        await payrollSupabaseRepo.addPayrollItem({
          runId: run.id,
          userId: staff.id,
          userName: staff.name,
          baseSalary: effectiveSalary,
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
      
      setStaffRates(newStaffRates);
      setStaffWorkDays(newStaffWorkDays);
      
      toast({ title: 'Payroll items generated with pro-rating!' });
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
      const approvedClaims = await requestsSupabaseRepo.getApprovedClaimsForPayroll(run.month);
      
      // Get claimed training to mark as included
      const claimedTraining = await requestsSupabaseRepo.getClaimedTrainingForPayroll();
      
      // Get staff details for email sending
      const allStaff = await staffSupabaseRepo.getAllStaff();
      const staffMap = new Map(allStaff.map(s => [s.id, s]));
      
      // Mark all included claims
      for (const claim of approvedClaims) {
        await requestsSupabaseRepo.markClaimIncludedInPayroll(claim.id, run.month);
      }
      
      // Mark all included training
      for (const training of claimedTraining) {
        await requestsSupabaseRepo.markTrainingIncludedInPayroll(training.id, run.month);
      }
      
      // Finalize the run
      await payrollSupabaseRepo.finalizePayrollRun(run.id);
      
      // Create payslips for each item
      for (const item of items) {
        await payrollSupabaseRepo.createPayslip({
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
                recipientName: item.userName.split(' (')[0], // Remove pro-rating suffix from name
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
          <CardHeader className="flex flex-row items-start justify-between gap-4">
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
                <p className="text-sm text-muted-foreground mb-4">
                  Generate items to calculate payroll. You can adjust individual work days after generation.
                </p>
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
                        <TableHead className="text-center">Days</TableHead>
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
                      {items.map((item) => {
                        const daysWorked = staffWorkDays[item.userId] ?? DEFAULT_WORK_DAYS;
                        const isProRated = daysWorked < DEFAULT_WORK_DAYS;
                        return (
                          <TableRow key={item.id} className={isProRated ? 'bg-amber-50/50' : ''}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {item.userName}
                                {isProRated && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Adjusted
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Work days adjusted (unpaid leave / new joiner)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  max={DEFAULT_WORK_DAYS}
                                  value={daysWorked}
                                  onChange={(e) => handleUpdateWorkDays(item.userId, parseInt(e.target.value))}
                                  className="w-14 h-7 text-center"
                                  disabled={isFinalized}
                                />
                                <span className="text-muted-foreground text-sm">/ {DEFAULT_WORK_DAYS}</span>
                              </div>
                            </TableCell>
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
                        );
                      })}
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
