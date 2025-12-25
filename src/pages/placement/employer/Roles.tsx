import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo } from '@/lib/placement/client';
import type { RoleOpening, RoleStatus } from '@/lib/placement/types';

const statusColors: Record<RoleStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  OPEN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  INTERVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SELECTING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  SELECTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PLACED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CLOSED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400',
};

const statusLabels: Record<RoleStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  INTERVIEWING: 'Interviewing',
  SELECTING: 'Selecting',
  SELECTED: 'Selected',
  PLACED: 'Placed',
  CLOSED: 'Closed',
};

export function EmployerRoles() {
  const { session } = usePlacementAuth();
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRoles();
  }, [session?.companyId]);

  async function loadRoles() {
    if (!session?.companyId) return;
    setLoading(true);
    try {
      const data = await roleRepo.getByCompanyId(session.companyId);
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRoles = roles.filter(role => {
    const matchesSearch = !search || 
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      role.department?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeRoles = roles.filter(r => ['OPEN', 'INTERVIEWING', 'SELECTING'].includes(r.status)).length;
  const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles</h1>
          <p className="text-muted-foreground">Manage your open positions and track candidates</p>
        </div>
        <Button asChild>
          <Link to="/employer/roles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Roles</span>
            </div>
            <p className="text-2xl font-bold mt-1">{roles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1">{activeRoles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Headcount</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalHeadcount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Placed</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {roles.filter(r => r.status === 'PLACED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
            <SelectItem value="SELECTING">Selecting</SelectItem>
            <SelectItem value="SELECTED">Selected</SelectItem>
            <SelectItem value="PLACED">Placed</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No roles found</h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first role to start receiving candidates'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button asChild>
                <Link to="/employer/roles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRoles.map((role) => (
            <Link key={role.id} to={`/employer/roles/${role.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{role.title}</h3>
                        <Badge className={statusColors[role.status]}>
                          {statusLabels[role.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {role.department && (
                          <span>{role.department}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {role.headcount} {role.headcount === 1 ? 'position' : 'positions'}
                        </span>
                        <span>
                          {role.workArrangement.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {role.salaryMin && role.salaryMax && (
                        <span className="text-muted-foreground">
                          ${role.salaryMin.toLocaleString()} - ${role.salaryMax.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
