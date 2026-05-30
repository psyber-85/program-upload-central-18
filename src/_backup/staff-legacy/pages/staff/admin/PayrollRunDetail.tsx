import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollSupabaseRepo, staffSupabaseRepo, requestsSupabaseRepo } from '@/lib/dal';
import { PayrollRun, PayrollItem, ClaimRequest, TrainingApplication } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

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

  // Calculate net pay and company cost from editable fields
  const calculateTotals = (item: PayrollItem) => {
    const netPay = item.baseSalary - item.epf - item.socso + item.claimsTotal + item.trainingClaimsTotal;
    const totalCompanyCost = item.baseSalary + item.employerEpf + item.employerSocso + item.claimsTotal + item.trainingClaimsTotal;
    return { netPay, totalCompanyCost };
  };

  // Update a field and save to database
  const handleFieldChange = async (itemId: string, field: keyof PayrollItem, value: number) => {
    // Update local state immediately
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, [field]: value };
      const totals = calculateTotals(updated);
      return { ...updated, ...totals };
    }));
  };

  // Save item to database on blur
  const handleFieldBlur = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    setIsSaving(itemId);
    try {
      const totals = calculateTotals(item);
      await payrollSupabaseRepo.updatePayrollItem(itemId, {
        baseSalary: item.baseSalary,
        epf: item.epf,
        socso: item.socso,
        employerEpf: item.employerEpf,
        employerSocso: item.employerSocso,
        claimsTotal: item.claimsTotal,
        trainingClaimsTotal: item.trainingClaimsTotal,
        netPay: totals.netPay,
        totalCompanyCost: totals.totalCompanyCost,
      });
    } catch (error) {
      console.error('Failed to save item:', error);
      toast({ title: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setIsSaving(null);
    }
  };

  // Generate payroll items from staff salary rates (first run)
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
      
      // Generate payroll items for each staff - use FULL salary, no pro-rating
      for (const staff of activeStaff) {
        const baseSalary = staff.salaryBase;
        const epf = Math.round(baseSalary * (staff.epfRate / 100));
        const socso = Math.round(baseSalary * (staff.socsoRate / 100));
        const employerEpf = Math.round(baseSalary * (13 / 100));
        const employerSocso = socso;
        
        // Calculate claims for this staff member
        const staffClaims = claimsByUser[staff.id] || [];
        const claimsTotal = staffClaims.reduce((sum, claim) => sum + claim.amount, 0);
        
        // Calculate training claims for this staff member
        const staffTraining = trainingByUser[staff.id] || [];
        const trainingClaimsTotal = staffTraining.reduce((sum, training) => sum + training.cost, 0);
        
        const netPay = baseSalary - epf - socso + claimsTotal + trainingClaimsTotal;
        const totalCompanyCost = baseSalary + employerEpf + employerSocso + claimsTotal + trainingClaimsTotal;
        
        await payrollSupabaseRepo.addPayrollItem({
          runId: run.id,
          userId: staff.id,
          userName: staff.name,
          baseSalary,
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
      
      toast({ title: 'Payroll items generated!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to generate items', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate payroll - recalculate totals from current values (preserves edits)
  const handleRegeneratePayroll = async () => {
    if (!run || items.length === 0) return;
    setIsRegenerating(true);
    try {
      // Recalculate net pay and company cost for all items
      for (const item of items) {
        const totals = calculateTotals(item);
        await payrollSupabaseRepo.updatePayrollItem(item.id, {
          netPay: totals.netPay,
          totalCompanyCost: totals.totalCompanyCost,
        });
      }
      
      toast({ title: 'Payroll recalculated!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to regenerate payroll', variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
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
  const totalCompanyCost = items.reduce((sum, item) => sum + item.totalCompanyCost, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto text-center">
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

  // Editable input component
  const EditableCell = ({ 
    value, 
    itemId, 
    field, 
    disabled = false,
    prefix = 'RM ',
    className = ''
  }: { 
    value: number; 
    itemId: string; 
    field: keyof PayrollItem;
    disabled?: boolean;
    prefix?: string;
    className?: string;
  }) => (
    <div className="flex items-center justify-end gap-1">
      {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
      <Input
        type="number"
        value={value}
        onChange={(e) => handleFieldChange(itemId, field, parseFloat(e.target.value) || 0)}
        onBlur={() => handleFieldBlur(itemId)}
        className={`w-20 h-7 text-right ${className}`}
        disabled={disabled || isFinalized}
      />
      {isSaving === itemId && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
              <div className="flex flex-wrap gap-2">
                {items.length === 0 ? (
                  <Button onClick={handleGenerateItems} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate Payroll
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleRegeneratePayroll} disabled={isRegenerating}>
                      {isRegenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Regenerate Totals
                    </Button>
                    <Button onClick={handleFinalize} disabled={isFinalizing}>
                      {isFinalizing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Finalize Payroll
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="text-muted-foreground mb-4">No payroll items generated yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate items to create payroll based on each staff's salary rate.
                </p>
                <Button onClick={handleGenerateItems} disabled={isGenerating}>
                  {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate Payroll Items
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  All fields are editable. Changes are saved automatically. Click "Regenerate Totals" to recalculate Net Pay and Company Cost.
                </p>
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
                        <TableHead className="text-right">Training</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead className="text-right">Company Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.userName}</TableCell>
                          <TableCell>
                            <EditableCell value={item.baseSalary} itemId={item.id} field="baseSalary" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.epf} itemId={item.id} field="epf" className="text-red-600" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.socso} itemId={item.id} field="socso" className="text-red-600" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.employerEpf} itemId={item.id} field="employerEpf" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.employerSocso} itemId={item.id} field="employerSocso" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.claimsTotal} itemId={item.id} field="claimsTotal" className="text-green-600" />
                          </TableCell>
                          <TableCell>
                            <EditableCell value={item.trainingClaimsTotal} itemId={item.id} field="trainingClaimsTotal" className="text-green-600" />
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            RM {item.netPay.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            RM {item.totalCompanyCost.toLocaleString()}
                          </TableCell>
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
                    <span className="text-xl font-bold text-primary">RM {totalCompanyCost.toLocaleString()}</span>
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
