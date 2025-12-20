import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { loiRepo } from '@/lib/placement/repositories/loiRepo';
import { RoleRequest, CandidateProfile, MatchRecord, LOIRecord } from '@/lib/placement/types';

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
}

export function AnalyticsDashboard() {
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [lois, setLois] = useState<LOIRecord[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [rolesData, candidatesData, matchesData, loisData] = await Promise.all([
        roleRequestRepo.getAll(),
        candidateRepo.getAll(),
        matchRepo.getAll(),
        loiRepo.getAll(),
      ]);
      setRoleRequests(rolesData);
      setCandidates(candidatesData);
      setMatches(matchesData);
      setLois(loisData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Calculate funnel data
  const funnelData: FunnelStage[] = [
    { label: 'Role Requests', count: roleRequests.length, percentage: 100 },
    { label: 'With Matches', count: new Set(matches.map((m) => m.role_request_id)).size, percentage: 0 },
    { label: 'Interviews', count: matches.filter((m) => m.match_status.includes('INTERVIEW')).length, percentage: 0 },
    { label: 'LOIs Generated', count: lois.length, percentage: 0 },
    { label: 'Placements', count: roleRequests.filter((r) => r.status === 'PLACED').length, percentage: 0 },
  ];

  // Calculate percentages
  const maxCount = funnelData[0].count || 1;
  funnelData.forEach((stage) => {
    stage.percentage = Math.round((stage.count / maxCount) * 100);
  });

  // Candidate pool by AI level
  const candidatesByLevel = {
    L1: candidates.filter((c) => c.ai_skill_level === 'L1').length,
    L2: candidates.filter((c) => c.ai_skill_level === 'L2').length,
    L3: candidates.filter((c) => c.ai_skill_level === 'L3').length,
    L4: candidates.filter((c) => c.ai_skill_level === 'L4').length,
    L5: candidates.filter((c) => c.ai_skill_level === 'L5').length,
  };

  // Candidate pool by status
  const candidatesByStatus = {
    'Placement Ready': candidates.filter((c) => c.placement_readiness).length,
    'In Training': candidates.filter((c) => c.status === 'TRAINING_IN_PROGRESS').length,
    'New Intake': candidates.filter((c) => c.status === 'NEW_INTAKE').length,
    Placed: candidates.filter((c) => c.status === 'PLACED' || c.status === 'LOI_SIGNED').length,
  };

  // Role requests by status
  const rolesByStatus = {
    Scoping: roleRequests.filter((r) => r.status === 'SCOPING').length,
    Matching: roleRequests.filter((r) => r.status === 'MATCHING').length,
    Interviewing: roleRequests.filter((r) => r.status === 'INTERVIEWING').length,
    'LOI Pending': roleRequests.filter((r) => r.status === 'LOI_PENDING').length,
    Placed: roleRequests.filter((r) => r.status === 'PLACED').length,
  };

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
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Placement metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleRequests.filter((r) => r.status === 'PLACED').length}</p>
                <p className="text-sm text-muted-foreground">Placements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {roleRequests.length > 0
                    ? Math.round((roleRequests.filter((r) => r.status === 'PLACED').length / roleRequests.length) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placement Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Funnel</CardTitle>
            <CardDescription>Conversion through placement stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="relative">
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-primary/80 rounded-lg transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Role Requests by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Role Requests by Status</CardTitle>
            <CardDescription>Current distribution of role requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(rolesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(count / roleRequests.length) * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Candidate Pool by AI Level */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates by AI Level</CardTitle>
            <CardDescription>Distribution of AI skill levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {Object.entries(candidatesByLevel).map(([level, count]) => {
                const maxHeight = Math.max(...Object.values(candidatesByLevel));
                const height = maxHeight > 0 ? (count / maxHeight) * 100 : 0;
                return (
                  <div key={level} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full bg-primary/80 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium">{count}</p>
                      <Badge variant="outline">{level}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Pool by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates by Status</CardTitle>
            <CardDescription>Current state of candidate pool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(candidatesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(count / candidates.length) * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Time-based metrics (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Role requests and placements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization would appear here</p>
              <p className="text-sm">Using Recharts library for production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
