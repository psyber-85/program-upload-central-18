import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { companyRepo, roleRepo, candidateRepo, submissionRepo, taskRepo, loiRepo } from '@/lib/placement/client';
import type { RoleOpening, CandidateSubmission, TaskItem } from '@/lib/placement/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, Users, FileText, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export function OpsDashboard() {
  const { session } = usePlacementAuth();
  const [stats, setStats] = useState({
    companies: 0,
    activeRoles: 0,
    candidates: 0,
    pendingLOIs: 0,
    placementsMonth: 0,
  });
  const [recentRoles, setRecentRoles] = useState<RoleOpening[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<CandidateSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [companies, roles, candidates, submissions, allTasks] = await Promise.all([
        companyRepo.getAll(),
        roleRepo.getAll(),
        candidateRepo.getAll(),
        submissionRepo.getAll(),
        taskRepo.getAll(),
      ]);

      const activeRoles = roles.filter(r => !['DRAFT', 'CLOSED', 'PLACED'].includes(r.status));
      const pendingLOIs = roles.filter(r => 
        r.loiStatus !== 'VERIFIED' && 
        r.loiStatus !== 'NOT_REQUESTED' &&
        r.status !== 'DRAFT'
      );
      const placedThisMonth = roles.filter(r => {
        if (!r.placedAt) return false;
        const placed = new Date(r.placedAt);
        const now = new Date();
        return placed.getMonth() === now.getMonth() && placed.getFullYear() === now.getFullYear();
      });

      setStats({
        companies: companies.length,
        activeRoles: activeRoles.length,
        candidates: candidates.length,
        pendingLOIs: pendingLOIs.length,
        placementsMonth: placedThisMonth.length,
      });

      setRecentRoles(roles.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 5));

      setTasks(allTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').slice(0, 5));
      
      setRecentSubmissions(submissions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5));

      setIsLoading(false);
    };
    loadData();
  }, []);

  const getStatusBadge = (status: RoleOpening['status']) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      DRAFT: { label: 'Draft', variant: 'secondary' },
      OPEN: { label: 'Open', variant: 'default' },
      INTERVIEWING: { label: 'Interviewing', variant: 'default' },
      SELECTING: { label: 'Selecting', variant: 'default' },
      SELECTED: { label: 'Selected', variant: 'outline' },
      PLACED: { label: 'Placed', variant: 'outline' },
      CLOSED: { label: 'Closed', variant: 'secondary' },
    };
    const config = variants[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      LOW: 'secondary',
      MEDIUM: 'outline',
      HIGH: 'default',
      URGENT: 'destructive',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-muted rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'text-blue-600', href: '/ops/employers' },
    { label: 'Active Roles', value: stats.activeRoles, icon: Briefcase, color: 'text-green-600', href: '/ops/roles' },
    { label: 'Candidates', value: stats.candidates, icon: Users, color: 'text-purple-600', href: '/ops/candidates' },
    { label: 'Pending LOIs', value: stats.pendingLOIs, icon: FileText, color: 'text-amber-600', href: '/ops/loi' },
    { label: 'Placements (Month)', value: stats.placementsMonth, icon: CheckCircle2, color: 'text-emerald-600', href: '/ops/reports' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.userName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Roles</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ops/roles">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRoles.map((role) => (
                <Link 
                  key={role.id}
                  to={`/ops/roles/${role.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{role.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{role.companyName}</p>
                  </div>
                  {getStatusBadge(role.status)}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-2 rounded-lg border">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {getPriorityBadge(task.priority)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/ops/roles/${sub.roleId}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{sub.candidateDisplayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.roleName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{sub.stage.replace('_', ' ')}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
