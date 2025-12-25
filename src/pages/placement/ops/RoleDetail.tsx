import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Calendar, Briefcase } from 'lucide-react';
import { companyRepo, roleRepo, submissionRepo } from '@/lib/placement/client';
import type { RoleOpening, CandidateSubmission, EmployerCompany, ActivityLog } from '@/lib/placement/types';
import { StatusBadge, PipelineBoard, ActivityTimeline } from '@/components/placement/shared';

export function OpsRoleDetail() {
  const { roleId } = useParams<{ roleId: string }>();
  const [role, setRole] = useState<RoleOpening | null>(null);
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!roleId) return;
      try {
        const roleData = await roleRepo.getById(roleId);
        setRole(roleData);
        
        if (roleData) {
          const [companyData, submissionsData] = await Promise.all([
            companyRepo.getById(roleData.companyId),
            submissionRepo.getByRoleId(roleId),
          ]);
          setCompany(companyData);
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error('Failed to load role:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [roleId]);

  const handleCandidateClick = (submission: CandidateSubmission) => {
    console.log('Candidate clicked:', submission);
  };

  const handleAction = async (submission: CandidateSubmission, action: string) => {
    console.log('Action:', action, 'on', submission);
    // Implement action handling
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Role not found</p>
        <Button asChild className="mt-4">
          <Link to="/ops/roles">Back to Roles</Link>
        </Button>
      </div>
    );
  }

  const placedCount = submissions.filter(s => s.stage === 'SELECTED').length;

  const mockActivities: ActivityLog[] = [
    {
      id: '1',
      type: 'ROLE_CREATED',
      roleId: role.id,
      companyId: role.companyId,
      actorId: role.createdById,
      actorName: role.createdByName,
      actorRole: 'COMPANY_ADMIN',
      title: 'Role created',
      createdAt: role.createdAt,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/ops/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{role.title}</h1>
            <StatusBadge type="role" value={role.status} />
          </div>
          {company && (
            <Link to={`/ops/employers/${company.id}`} className="text-primary hover:underline">
              {company.name}
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          {role.status === 'DRAFT' && (
            <Button>Publish Role</Button>
          )}
          {role.status === 'OPEN' && (
            <Button variant="outline">Close Role</Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Briefcase className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{role.headcount}</p>
                <p className="text-sm text-muted-foreground">Headcount</p>
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
                <p className="text-2xl font-bold">{placedCount}</p>
                <p className="text-sm text-muted-foreground">Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Date(role.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline ({submissions.length})</TabsTrigger>
          <TabsTrigger value="details">Role Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <PipelineBoard 
            submissions={submissions}
            onCandidateClick={handleCandidateClick}
            onAction={handleAction}
          />
        </TabsContent>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Work Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{role.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Work Arrangement</p>
                    <p className="font-medium capitalize">{role.workArrangement.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>

                {(role.salaryMin || role.salaryMax) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salary Range</p>
                      <p className="font-medium">
                        ${role.salaryMin?.toLocaleString() || '0'} - ${role.salaryMax?.toLocaleString() || 'Open'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <p className="font-medium capitalize">{role.employmentType.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {role.requirements && role.requirements.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Must Have</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {role.requirements.map((req, i) => (
                        <li key={i} className="text-sm">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {role.niceToHave && role.niceToHave.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Nice to Have</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {role.niceToHave.map((item, i) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {role.description && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{role.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline activities={mockActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
