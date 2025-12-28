import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { payrollSupabaseRepo } from '@/lib/dal';
import { PayrollRun } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus, DollarSign, ChevronRight, CalendarCheck, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Payroll = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPayrollRuns();
  }, []);

  const loadPayrollRuns = async () => {
    setIsLoading(true);
    try {
      const runs = await payrollSupabaseRepo.getAllPayrollRuns();
      setPayrollRuns(runs);
    } catch (error) {
      console.error('Failed to load payroll runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRun = async () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Check if run already exists for this month
    const existing = payrollRuns.find(r => r.month === currentMonth);
    if (existing) {
      toast({ title: 'Payroll run already exists for this month', variant: 'destructive' });
      return;
    }
    
    setIsCreating(true);
    try {
      await payrollSupabaseRepo.createPayrollRun(currentMonth);
      toast({ title: 'Payroll run created!' });
      loadPayrollRuns();
    } catch (error) {
      toast({ title: 'Failed to create payroll run', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return format(new Date(parseInt(year), parseInt(m) - 1), 'MMMM yyyy');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Finalized') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
          <CalendarCheck className="h-3 w-3 mr-1" />
          Finalized
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
        <Clock className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground">Manage monthly payroll runs</p>
          </div>
          <Button onClick={handleCreateRun} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Payroll Run
          </Button>
        </header>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : payrollRuns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No payroll runs yet</p>
              <Button onClick={handleCreateRun} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first payroll run
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payrollRuns.map((run) => (
              <Link key={run.id} to={`/staff/payroll/${run.id}`}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-lg">{formatMonth(run.month)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusBadge(run.status)}
                        {run.finalizedAt && (
                          <span className="text-xs">
                            Finalized on {format(new Date(run.finalizedAt), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
