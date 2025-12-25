import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Plus, MapPin, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/placement/shared';
import { companyRepo, roleRepo } from '@/lib/placement/client';
import type { EmployerCompany, RoleOpening } from '@/lib/placement/types';

export function OpsEmployers() {
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [companiesData, rolesData] = await Promise.all([
      companyRepo.getAll(),
      roleRepo.getAll(),
    ]);
    setCompanies(companiesData);
    setRoles(rolesData);
    setLoading(false);
  }

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleCount = (companyId: string) => roles.filter(r => r.companyId === companyId).length;
  const getActiveRoles = (companyId: string) => roles.filter(r => r.companyId === companyId && ['OPEN', 'INTERVIEWING', 'SELECTING'].includes(r.status)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employers</h1>
          <p className="text-muted-foreground">Manage employer accounts and roles</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Employer</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search employers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {loading ? (
          [1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-muted rounded w-1/3" /></CardContent></Card>)
        ) : filteredCompanies.map(company => (
          <Link key={company.id} to={`/ops/employers/${company.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{company.name}</h3>
                        <StatusBadge type="company" value={company.status} />
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{company.industry}</span>
                        <span><Users className="h-3 w-3 inline mr-1" />{company.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{getRoleCount(company.id)}</p>
                    <p className="text-xs text-muted-foreground">{getActiveRoles(company.id)} active</p>
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
