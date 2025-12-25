import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Users, Briefcase, FileCheck, Calendar } from 'lucide-react';
import { companyRepo, roleRepo, loiRepo } from '@/lib/placement/client';
import type { EmployerCompany, RoleOpening, LOIRecord, ActivityLog } from '@/lib/placement/types';
import { StatusBadge, ActivityTimeline } from '@/components/placement/shared';

export function OpsEmployerDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [loi, setLoi] = useState<LOIRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!companyId) return;
      try {
        const [companyData, rolesData] = await Promise.all([
          companyRepo.getById(companyId),
          roleRepo.getByCompanyId(companyId),
        ]);
        setCompany(companyData);
        setRoles(rolesData);
        // LOI would be fetched per role, skip for now
        setLoi(null);
      } catch (error) {
        console.error('Failed to load employer:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employer not found</p>
        <Button asChild className="mt-4">
          <Link to="/ops/employers">Back to Employers</Link>
        </Button>
      </div>
    );
  }

  const activeRoles = roles.filter(r => r.status === 'OPEN').length;
  const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);
  const placedRoles = roles.filter(r => r.status === 'PLACED').length;

  const mockActivities: ActivityLog[] = [
    {
      id: '1',
      type: 'ROLE_CREATED',
      roleId: company.id,
      companyId: company.id,
      actorId: 'system',
      actorName: 'System',
      actorRole: 'AIHQ_OPS',
      title: 'Company registered',
      createdAt: company.createdAt,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/ops/employers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <StatusBadge type="company" value={company.status} />
          </div>
          <p className="text-muted-foreground">{company.industry}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRoles}</p>
                <p className="text-sm text-muted-foreground">Active Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHeadcount}</p>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{placedRoles}</p>
                <p className="text-sm text-muted-foreground">Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Company Details</TabsTrigger>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          <TabsTrigger value="loi">LOI Status</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{company.industry}</p>
                  </div>
                </div>

                {company.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Email</p>
                      <p className="font-medium">{company.contactEmail}</p>
                    </div>
                  </div>
                )}

                {company.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Phone</p>
                      <p className="font-medium">{company.contactPhone}</p>
                    </div>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{company.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Open Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No roles created yet</p>
              ) : (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <Link
                      key={role.id}
                      to={`/ops/roles/${role.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{role.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {role.headcount} headcount • {role.workArrangement} • {role.location}
                          </p>
                        </div>
                        <StatusBadge type="role" value={role.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loi">
          <Card>
            <CardHeader>
              <CardTitle>Letter of Intent</CardTitle>
            </CardHeader>
            <CardContent>
              {loi ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge type="loi" value={loi.status} />
                    {loi.verifiedAt && (
                      <span className="text-sm text-muted-foreground">
                        Verified on {new Date(loi.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {loi.uploadedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Uploaded: {new Date(loi.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {loi.status === 'UPLOADED_SIGNED' && (
                    <div className="flex gap-2">
                      <Button size="sm">Verify LOI</Button>
                      <Button size="sm" variant="outline">Request Changes</Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No LOI submitted yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline activities={mockActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
