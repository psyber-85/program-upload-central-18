import { Link } from 'react-router-dom';
import { FileText, Users, CalendarCheck, FileSignature, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIStatCard, RoleCard, Callout } from '@/components/placement/ui';
import { useAuth } from '@/lib/placement/AuthContext';
import { mockRoleRequests, mockMatches, mockLOIRecords } from '@/lib/placement/mockData';

export function EmployerDashboard() {
  const { user, hasRole } = useAuth();
  const companyId = user?.company_id;

  // Filter data for this company
  const companyRoles = mockRoleRequests.filter((r) => r.company_id === companyId);
  const activeRoles = companyRoles.filter((r) => !['PLACED', 'CLOSED'].includes(r.status));
  const companyLOIs = mockLOIRecords.filter((l) => l.company_id === companyId);
  
  // Count candidates in review (matches for company's roles)
  const roleIds = companyRoles.map((r) => r.id);
  const relevantMatches = mockMatches.filter((m) => roleIds.includes(m.role_request_id));
  const candidatesInReview = relevantMatches.filter(
    (m) => ['EMPLOYER_REVIEWING', 'PROPOSED'].includes(m.match_status)
  ).length;
  
  // Interviews pending
  const interviewsPending = relevantMatches.filter(
    (m) => ['INTERVIEW_REQUESTED', 'INTERVIEW_SCHEDULED'].includes(m.match_status)
  ).length;

  // LOIs in progress
  const loisInProgress = companyLOIs.filter(
    (l) => ['DRAFT', 'PENDING_REVIEW', 'PENDING_SIGNATURE'].includes(l.status)
  ).length;

  // Recent activity (mocked for now)
  const recentActivity = [
    { id: 1, text: 'New candidate proposed for AI Operations Specialist', time: '2 hours ago' },
    { id: 2, text: 'Interview scheduled with Siti Nurhaliza', time: '1 day ago' },
    { id: 3, text: 'LOI draft ready for review', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Placement Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        {hasRole('employer_owner') && (
          <Button asChild>
            <Link to="/employer/roles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Role Request
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          label="Active Roles"
          value={activeRoles.length}
          icon={FileText}
        />
        <KPIStatCard
          label="Candidates in Review"
          value={candidatesInReview}
          icon={Users}
        />
        <KPIStatCard
          label="Interviews Pending"
          value={interviewsPending}
          icon={CalendarCheck}
          variant={interviewsPending > 0 ? 'warning' : 'default'}
        />
        <KPIStatCard
          label="LOIs in Progress"
          value={loisInProgress}
          icon={FileSignature}
        />
      </div>

      {/* Trust Callout */}
      <Callout variant="trust" title="AIHQ Manages Your Placement">
        We handle candidate sourcing, screening, and coordination. You focus on reviewing curated candidates and making hiring decisions.
      </Callout>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Roles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Role Requests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/employer/roles">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {activeRoles.length > 0 ? (
            <div className="space-y-3">
              {activeRoles.slice(0, 3).map((role) => {
                const matchCount = mockMatches.filter(
                  (m) => m.role_request_id === role.id
                ).length;
                return (
                  <RoleCard
                    key={role.id}
                    role={role}
                    candidateCount={matchCount}
                    linkTo={`/employer/roles/${role.id}`}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No active role requests</p>
                {hasRole('employer_owner') && (
                  <Button asChild>
                    <Link to="/employer/roles/new">Submit Your First Role Request</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="px-4 py-3">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interviewsPending > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <CalendarCheck className="h-4 w-4 text-primary mt-0.5" />
                  <span>Prepare for {interviewsPending} upcoming interview{interviewsPending > 1 ? 's' : ''}</span>
                </div>
              )}
              {candidatesInReview > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary mt-0.5" />
                  <span>Review {candidatesInReview} curated candidate{candidatesInReview > 1 ? 's' : ''}</span>
                </div>
              )}
              {loisInProgress > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <FileSignature className="h-4 w-4 text-primary mt-0.5" />
                  <span>Complete LOI for {loisInProgress} placement{loisInProgress > 1 ? 's' : ''}</span>
                </div>
              )}
              {interviewsPending === 0 && candidatesInReview === 0 && loisInProgress === 0 && (
                <p className="text-sm text-muted-foreground">No pending actions. AIHQ will notify you when there are updates.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
