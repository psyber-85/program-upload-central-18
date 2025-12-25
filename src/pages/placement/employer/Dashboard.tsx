import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo, submissionRepo } from '@/lib/placement/client';
import type { RoleOpening, CandidateSubmission } from '@/lib/placement/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, FileText, Clock, Plus, ArrowRight } from 'lucide-react';

export function EmployerDashboard() {
  const { session } = usePlacementAuth();
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!session?.companyId) return;
      
      const [rolesData, subsData] = await Promise.all([
        roleRepo.getByCompanyId(session.companyId),
        submissionRepo.getAll({ companyId: session.companyId }),
      ]);
      
      setRoles(rolesData);
      // Filter submissions by company's roles
      const roleIds = rolesData.map(r => r.id);
      setSubmissions(subsData.filter(s => roleIds.includes(s.roleId)));
      setIsLoading(false);
    };
    loadData();
  }, [session?.companyId]);

  const activeRoles = roles.filter(r => !['DRAFT', 'CLOSED', 'PLACED'].includes(r.status));
  const pendingLOIs = roles.filter(r => r.loiStatus === 'NOT_REQUESTED' && r.status !== 'DRAFT');
  const interviewsScheduled = submissions.filter(s => s.stage === 'INTERVIEW_SCHEDULED');
  const newSubmissions = submissions.filter(s => s.stage === 'SUBMITTED');

  const stats = [
    { label: 'Active Roles', value: activeRoles.length, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Candidates', value: submissions.length, icon: Users, color: 'text-green-600' },
    { label: 'Pending LOIs', value: pendingLOIs.length, icon: FileText, color: 'text-amber-600' },
    { label: 'Interviews', value: interviewsScheduled.length, icon: Clock, color: 'text-purple-600' },
  ];

  const getStatusBadge = (status: RoleOpening['status']) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.userName}</p>
        </div>
        <Button asChild>
          <Link to="/employer/roles/new">
            <Plus className="h-4 w-4 mr-2" /> New Role
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Roles</CardTitle>
              <CardDescription>Roles currently accepting candidates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/employer/roles">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active roles</p>
            ) : (
              <div className="space-y-3">
                {activeRoles.slice(0, 5).map((role) => (
                  <Link 
                    key={role.id} 
                    to={`/employer/roles/${role.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{role.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {submissions.filter(s => s.roleId === role.id).length} candidates
                      </p>
                    </div>
                    {getStatusBadge(role.status)}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>New Candidates</CardTitle>
            <CardDescription>Recently submitted candidates to review</CardDescription>
          </CardHeader>
          <CardContent>
            {newSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No new candidates</p>
            ) : (
              <div className="space-y-3">
                {newSubmissions.slice(0, 5).map((sub) => (
                  <Link 
                    key={sub.id}
                    to={`/employer/roles/${sub.roleId}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{sub.candidateDisplayName}</p>
                      <p className="text-xs text-muted-foreground">for {sub.roleName}</p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {(pendingLOIs.length > 0 || interviewsScheduled.length > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-800">Action Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingLOIs.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-medium">{role.title}</p>
                  <p className="text-xs text-muted-foreground">LOI required to proceed with candidates</p>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/employer/roles/${role.id}/loi`}>Complete LOI</Link>
                </Button>
              </div>
            ))}
            {interviewsScheduled.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-medium">Interview: {sub.candidateDisplayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.interviewScheduledAt ? new Date(sub.interviewScheduledAt).toLocaleDateString() : 'Date TBD'}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/employer/roles/${sub.roleId}`}>View</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
