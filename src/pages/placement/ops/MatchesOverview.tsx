import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Search, Filter, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, AISkillBadge } from '@/components/placement/ui';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { MatchRecord, CandidateProfile, RoleRequest, EmployerCompany } from '@/lib/placement/types';
import { format } from 'date-fns';

const MATCH_STATUSES = [
  'PROPOSED',
  'EMPLOYER_REVIEWING',
  'INTERVIEW_REQUESTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'EMPLOYER_INTERESTED',
  'PROCEEDING_TO_LOI',
] as const;

export function MatchesOverview() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [matchesData, candidatesData, rolesData, companiesData] = await Promise.all([
        matchRepo.getAll(),
        candidateRepo.getAll(),
        roleRequestRepo.getAll(),
        employerRepo.getCompanies(),
      ]);
      setMatches(matchesData);
      setCandidates(candidatesData);
      setRoleRequests(rolesData);
      setCompanies(companiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCandidate = (id: string) => candidates.find((c) => c.id === id);
  const getRole = (id: string) => roleRequests.find((r) => r.id === id);
  const getCompany = (id: string) => companies.find((c) => c.id === id);

  const filteredMatches = matches.filter((match) => {
    const candidate = getCandidate(match.candidate_id);
    const role = getRole(match.role_request_id);
    const company = role ? getCompany(role.company_id) : null;

    const matchesSearch =
      candidate?.display_name.toLowerCase().includes(search.toLowerCase()) ||
      role?.title.toLowerCase().includes(search.toLowerCase()) ||
      company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || match.match_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group by status for kanban-style view
  const matchesByStatus = MATCH_STATUSES.reduce((acc, status) => {
    acc[status] = filteredMatches.filter((m) => m.match_status === status);
    return acc;
  }, {} as Record<string, MatchRecord[]>);

  const statusCounts = MATCH_STATUSES.reduce((acc, status) => {
    acc[status] = matches.filter((m) => m.match_status === status).length;
    return acc;
  }, {} as Record<string, number>);

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
      <div>
        <h1 className="text-2xl font-bold">Matches Overview</h1>
        <p className="text-muted-foreground">{matches.length} total matches in pipeline</p>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {MATCH_STATUSES.map((status) => (
          <Badge
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            {status.replace(/_/g, ' ')}: {statusCounts[status]}
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate, role, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {MATCH_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline View */}
      <div className="grid gap-4">
        {MATCH_STATUSES.map((status) => {
          const statusMatches = matchesByStatus[status];
          if (statusFilter !== 'all' && statusFilter !== status) return null;
          if (statusMatches.length === 0 && statusFilter === 'all') return null;

          return (
            <Card key={status}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitMerge className="h-4 w-4" />
                    {status.replace(/_/g, ' ')}
                    <Badge variant="secondary">{statusMatches.length}</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {statusMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No matches in this stage</p>
                ) : (
                  <div className="space-y-3">
                    {statusMatches.map((match) => {
                      const candidate = getCandidate(match.candidate_id);
                      const role = getRole(match.role_request_id);
                      const company = role ? getCompany(role.company_id) : null;

                      return (
                        <div
                          key={match.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          {/* Candidate */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {candidate?.display_name.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/ops/candidates/${match.candidate_id}`}
                                className="font-medium hover:underline truncate block"
                              >
                                {candidate?.display_name || 'Unknown'}
                              </Link>
                              <div className="flex items-center gap-2">
                                <AISkillBadge level={candidate?.ai_skill_level || 'L1'} size="sm" />
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                          {/* Role */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/ops/roles/${match.role_request_id}`}
                              className="font-medium hover:underline truncate block"
                            >
                              {role?.title || 'Unknown Role'}
                            </Link>
                            <p className="text-sm text-muted-foreground truncate">
                              {company?.name || 'Unknown Company'}
                            </p>
                          </div>

                          {/* Next Action */}
                          <div className="hidden md:block text-right flex-shrink-0 max-w-[200px]">
                            {match.next_action && (
                              <p className="text-sm text-muted-foreground truncate">
                                {match.next_action}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(match.updated_at), 'MMM d')}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/ops/roles/${match.role_request_id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
