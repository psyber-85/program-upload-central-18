import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, AISkillBadge } from '@/components/placement/ui';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { RoleRequest, EmployerCompany, MatchRecord } from '@/lib/placement/types';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCOPING', label: 'Scoping' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'LOI_PENDING', label: 'LOI Pending' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function RoleRequestsList() {
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [rolesData, companiesData, matchesData] = await Promise.all([
        roleRequestRepo.getAll(),
        employerRepo.getCompanies(),
        matchRepo.getAll(),
      ]);
      setRoleRequests(rolesData);
      setCompanies(companiesData);
      setMatches(matchesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getCandidateCount = (roleId: string) => {
    return matches.filter((m) => m.role_request_id === roleId).length;
  };

  const filteredRoles = roleRequests.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      getCompanyName(role.company_id).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    const matchesTimeline = timelineFilter === 'all' || role.timeline === timelineFilter;
    return matchesSearch && matchesStatus && matchesTimeline;
  });

  // Status summary
  const statusCounts = roleRequests.reduce((acc, role) => {
    acc[role.status] = (acc[role.status] || 0) + 1;
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
        <h1 className="text-2xl font-bold">Role Requests</h1>
        <p className="text-muted-foreground">{roleRequests.length} total role requests</p>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Badge
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            {status.replace('_', ' ')}: {count}
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
                placeholder="Search by role title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timelineFilter} onValueChange={setTimelineFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Timelines</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI Level</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead className="text-center">Candidates</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No role requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{role.title}</p>
                        <p className="text-xs text-muted-foreground">{role.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/ops/employers/${role.company_id}`}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Building2 className="h-3 w-3" />
                        {getCompanyName(role.company_id)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={role.status} />
                    </TableCell>
                    <TableCell>
                      <AISkillBadge level={role.ai_skill_level_required} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={role.timeline === 'urgent' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {role.timeline}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{getCandidateCount(role.id)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(role.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/ops/roles/${role.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
