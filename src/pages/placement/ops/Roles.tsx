import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Building2, Users, MapPin, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/placement/shared';
import { roleRepo, submissionRepo } from '@/lib/placement/client';
import type { RoleOpening, CandidateSubmission } from '@/lib/placement/types';

export function OpsRoles() {
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [rolesData, subsData] = await Promise.all([roleRepo.getAll(), submissionRepo.getAll()]);
    setRoles(rolesData);
    setSubmissions(subsData);
    setLoading(false);
  }

  const filtered = roles.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSubmissionCount = (roleId: string) => submissions.filter(s => s.roleId === roleId).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Roles</h1>
        <p className="text-muted-foreground">Manage and assign candidates to roles</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
            <SelectItem value="SELECTING">Selecting</SelectItem>
            <SelectItem value="PLACED">Placed</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading ? [1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-muted rounded w-1/3" /></CardContent></Card>) : filtered.map(role => (
          <Link key={role.id} to={`/ops/roles/${role.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{role.title}</h3>
                      <StatusBadge type="role" value={role.status} />
                      <StatusBadge type="loi" value={role.loiStatus} />
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span><Building2 className="h-3 w-3 inline mr-1" />{role.companyName}</span>
                      <span><MapPin className="h-3 w-3 inline mr-1" />{role.location}</span>
                      <span><Users className="h-3 w-3 inline mr-1" />{role.headcount}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{getSubmissionCount(role.id)}</p>
                    <p className="text-xs text-muted-foreground">candidates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
