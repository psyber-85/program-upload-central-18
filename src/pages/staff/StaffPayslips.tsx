import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { payrollLocalRepo } from '@/lib/dal/localStorage/PayrollLocalRepo';
import { Payslip } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const StaffPayslips = () => {
  const { user, isAdmin } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, [user]);

  const loadPayslips = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Get payslips for current user (or all if admin viewing all)
      const userPayslips = await payrollLocalRepo.getPayslipsByUser(user.id);
      setPayslips(userPayslips);
    } catch (error) {
      console.error('Failed to load payslips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return format(new Date(parseInt(year), parseInt(m) - 1), 'MMMM yyyy');
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Payslips</h1>
          <p className="text-muted-foreground">View your monthly payslip details</p>
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
        ) : payslips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payslips available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payslips.map((payslip) => (
              <Link key={payslip.id} to={`/staff/payslips/${payslip.id}`}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-lg">{formatMonth(payslip.month)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Net Pay:</span>
                        <Badge variant="secondary" className="text-green-600">
                          RM {payslip.netPay.toLocaleString()}
                        </Badge>
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

export default StaffPayslips;
