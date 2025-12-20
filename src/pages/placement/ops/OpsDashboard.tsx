import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  GitMerge, 
  FileSignature, 
  GraduationCap, 
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPIStatCard, StatusBadge } from '@/components/placement/ui';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { loiRepo } from '@/lib/placement/repositories/loiRepo';
import { trainingRepo } from '@/lib/placement/repositories/trainingRepo';
import { taskRepo } from '@/lib/placement/repositories/taskRepo';
import { activityRepo } from '@/lib/placement/repositories/activityRepo';
import { useEffect, useState } from 'react';
import { RoleRequest, CandidateProfile, MatchRecord, LOIRecord, TrainingEnrollment, Task, ActivityLog } from '@/lib/placement/types';
import { format } from 'date-fns';

export function OpsDashboard() {
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [lois, setLois] = useState<LOIRecord[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [rolesData, candidatesData, matchesData, loisData, enrollmentsData, tasksData, activityData] = await Promise.all([
        roleRequestRepo.getAll(),
        candidateRepo.getAll(),
        matchRepo.getAll(),
        loiRepo.getAll(),
        trainingRepo.getAllEnrollments(),
        taskRepo.getOverdue(),
        activityRepo.getRecent(10),
      ]);
      setRoleRequests(rolesData);
      setCandidates(candidatesData);
      setMatches(matchesData);
      setLois(loisData);
      setEnrollments(enrollmentsData);
      setOverdueTasks(tasksData);
      setRecentActivity(activityData);
      setLoading(false);
    };
    loadData();
  }, []);

  const activeRoles = roleRequests.filter(r => !['PLACED', 'CANCELLED'].includes(r.status));
  const pendingMatches = matches.filter(m => ['PROPOSED', 'EMPLOYER_REVIEWING', 'INTERVIEW_REQUESTED'].includes(m.match_status));
  const loisInProgress = lois.filter(l => l.status !== 'SIGNED');
  const activeEnrollments = enrollments.filter(e => e.status === 'IN_PROGRESS');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ops Dashboard</h1>
          <p className="text-muted-foreground">Overview of placement operations</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/ops/employers">
              <Building2 className="mr-2 h-4 w-4" />
              New Employer
            </Link>
          </Button>
          <Button asChild>
            <Link to="/ops/candidates">
              <Users className="mr-2 h-4 w-4" />
              View Candidates
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPIStatCard
          title="Active Role Requests"
          value={activeRoles.length}
          subtitle={`${roleRequests.filter(r => r.status === 'SCOPING').length} in scoping`}
          icon={FileText}
        />
        <KPIStatCard
          title="Candidates in Pipeline"
          value={candidates.filter(c => c.placement_readiness).length}
          subtitle={`${candidates.length} total`}
          icon={Users}
        />
        <KPIStatCard
          title="Pending Matches"
          value={pendingMatches.length}
          subtitle="Awaiting action"
          icon={GitMerge}
        />
        <KPIStatCard
          title="LOIs in Progress"
          value={loisInProgress.length}
          subtitle={`${lois.filter(l => l.status === 'SIGNED').length} signed`}
          icon={FileSignature}
        />
        <KPIStatCard
          title="Active Training"
          value={activeEnrollments.length}
          subtitle="Enrollments"
          icon={GraduationCap}
        />
        <KPIStatCard
          title="Overdue Tasks"
          value={overdueTasks.length}
          subtitle="Need attention"
          icon={AlertTriangle}
          className={overdueTasks.length > 0 ? 'border-destructive/50' : ''}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks Requiring Attention */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Tasks Requiring Attention</CardTitle>
              <CardDescription>Overdue and upcoming tasks</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ops/matches">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No overdue tasks</p>
            ) : (
              <div className="space-y-3">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-destructive/10">
                        <Clock className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates across the platform</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM d, h:mm a')} · {activity.actor_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/ops/loi"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileSignature className="h-5 w-5 text-primary" />
                <span className="font-medium">LOI Queue</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/ops/matches"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GitMerge className="h-5 w-5 text-primary" />
                <span className="font-medium">View Matches</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/ops/training"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Training Status</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/ops/analytics"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span className="font-medium">Analytics</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
