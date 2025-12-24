import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { statsLocalRepo } from '@/lib/dal/localStorage/StatsLocalRepo';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { entriesLocalRepo } from '@/lib/dal/localStorage/EntriesLocalRepo';
import { payrollLocalRepo } from '@/lib/dal/localStorage/PayrollLocalRepo';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { MonthlyStats, AnyRequest, Payslip, LeaveBalance, TrainingEntitlement } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Megaphone, 
  FileText, 
  ClipboardList, 
  DollarSign,
  Users,
  Settings,
  ArrowRight,
  Plus,
  Mail,
  Calendar,
  Receipt,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

const StaffHome = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<AnyRequest[]>([]);
  const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [trainingEntitlement, setTrainingEntitlement] = useState<TrainingEntitlement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const currentYear = new Date().getFullYear();
      
      // Load stats
      const monthlyStats = await statsLocalRepo.getMonthlyStats(currentMonth);
      setStats(monthlyStats);
      
      // Load recent requests for current user
      const requests = await requestsLocalRepo.getRecentRequestsByUser(user.id, 3);
      setRecentRequests(requests);
      
      // Load payslips
      const payslips = await payrollLocalRepo.getPayslipsByUser(user.id);
      setRecentPayslips(payslips.slice(0, 2));

      // Load leave balance
      const balance = await staffLocalRepo.getLeaveBalance(user.id, currentYear);
      setLeaveBalance(balance);

      // Load training entitlement
      const entitlement = await staffLocalRepo.getTrainingEntitlement(user.id);
      setTrainingEntitlement(entitlement);
      
      // Admin-only data
      if (isAdmin) {
        const pending = await requestsLocalRepo.getPendingApprovals();
        setPendingCount(pending.leave.length + pending.claims.length + pending.training.length);
        
        const unpaidCount = await entriesLocalRepo.getUnpaidInvoicesCount();
        setUnpaidInvoicesCount(unpaidCount);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return format(new Date(parseInt(year), parseInt(m) - 1), 'MMM');
  };

  const getLeaveRemaining = (type: 'AL' | 'SL') => {
    if (!leaveBalance) return 0;
    if (type === 'AL') {
      return leaveBalance.alTotal + leaveBalance.alCarryForward - leaveBalance.alUsed;
    }
    return leaveBalance.slTotal - leaveBalance.slUsed;
  };

  const getTrainingRemaining = () => {
    if (!trainingEntitlement) return 0;
    return (trainingEntitlement.overrideBalance ?? trainingEntitlement.annualAmount) - trainingEntitlement.usedAmount;
  };

  const isTrainingEligible = () => {
    if (!trainingEntitlement) return false;
    const eligibleDate = parseISO(trainingEntitlement.eligibleFrom);
    return trainingEntitlement.overrideEligible || isBefore(eligibleDate, new Date());
  };

  const netProfit = stats ? stats.revenue - stats.expenses : 0;
  const isProfit = netProfit >= 0;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening at AIHQ
          </p>
        </header>

        {/* Leave & Training Balance Cards */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Annual Leave
                      </span>
                      <span className="text-sm font-medium">{getLeaveRemaining('AL')} days</span>
                    </div>
                    <Progress 
                      value={leaveBalance ? ((leaveBalance.alTotal + leaveBalance.alCarryForward - leaveBalance.alUsed) / (leaveBalance.alTotal + leaveBalance.alCarryForward)) * 100 : 0} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Sick Leave
                      </span>
                      <span className="text-sm font-medium">{getLeaveRemaining('SL')} days</span>
                    </div>
                    <Progress 
                      value={leaveBalance ? ((leaveBalance.slTotal - leaveBalance.slUsed) / leaveBalance.slTotal) * 100 : 0} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Training Fund
                      </span>
                      {isTrainingEligible() ? (
                        <span className="text-sm font-medium">RM {getTrainingRemaining().toLocaleString()}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Eligible {trainingEntitlement ? format(parseISO(trainingEntitlement.eligibleFrom), 'MMM yyyy') : 'after 1 year'}
                        </Badge>
                      )}
                    </div>
                    {isTrainingEligible() && trainingEntitlement && (
                      <Progress 
                        value={(getTrainingRemaining() / trainingEntitlement.annualAmount) * 100} 
                        className="h-2"
                      />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Revenue ({stats ? formatMonth(stats.month) : '-'})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    RM {(stats?.revenue || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Expenses ({stats ? formatMonth(stats.month) : '-'})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    RM {(stats?.expenses || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              {isAdmin ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending Approvals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{pendingCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        Unpaid Invoices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{unpaidInvoicesCount}</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Net ({stats ? formatMonth(stats.month) : '-'})</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? '+' : ''}RM {netProfit.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>My Requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{recentRequests.length}</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/staff/requests/new">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:wani@theaihq.net?subject=IT%20Support%20Request">
                <Mail className="h-4 w-4 mr-2" />
                Email IT
              </a>
            </Button>
            {isAdmin && (
              <>
                <Button asChild variant="outline">
                  <Link to="/staff/payroll">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payroll
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/staff/entries">
                    <FileText className="h-4 w-4 mr-2" />
                    Entries
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">My Recent Requests</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/staff/requests">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent requests</p>
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <Link to="/staff/requests/new">Create Request</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRequests.map((request) => (
                    <Link 
                      key={request.id} 
                      to={`/staff/requests/${request.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{request.type}</Badge>
                          <span className="text-sm font-medium">
                            {request.type === 'Leave' ? request.leaveType : request.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          request.status === 'Approved' ? 'text-green-600 border-green-300' :
                          request.status === 'Rejected' ? 'text-red-600 border-red-300' :
                          'text-amber-600 border-amber-300'
                        }
                      >
                        {request.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payslips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">My Payslips</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/staff/payslips">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentPayslips.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payslips available yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPayslips.map((payslip) => {
                    const [year, m] = payslip.month.split('-');
                    const monthLabel = format(new Date(parseInt(year), parseInt(m) - 1), 'MMMM yyyy');
                    return (
                      <Link 
                        key={payslip.id} 
                        to={`/staff/payslips/${payslip.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <span className="font-medium">{monthLabel}</span>
                        <Badge variant="secondary" className="text-green-600">
                          RM {payslip.netPay.toLocaleString()}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <h2 className="text-lg font-semibold mb-4">Portals & Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Marketing Portal */}
          <Link to="/staff/marketing">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Marketing Portal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Manage campaigns, participants, birthdays, and CRM activities.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Requests */}
          <Link to="/staff/requests">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Requests</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Leave, claims, and training applications.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Documents */}
          <Link to="/staff/docs">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  SOPs, policies, and company documents.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Admin Only Sections */}
          {isAdmin && (
            <>
              <Link to="/staff/payroll">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">Payroll</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      Payroll runs and payslip management.
                      <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/staff/entries">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                        <Users className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">Entries</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      Invoices and bills management.
                      <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/staff/settings">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                        <Settings className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      Staff management and configuration.
                      <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffHome;