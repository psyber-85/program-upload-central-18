import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, MapPin, Briefcase, DollarSign, 
  CheckCircle, Calendar, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo, submissionRepo, loiRepo } from '@/lib/placement/client';
import { CandidatePipeline } from '@/components/placement/employer/CandidatePipeline';
import { LOIBanner } from '@/components/placement/shared/LOIBanner';
import type { RoleOpening, CandidateSubmission, RoleStatus } from '@/lib/placement/types';

const statusColors: Record<RoleStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  OPEN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  INTERVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SELECTING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  SELECTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PLACED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CLOSED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400',
};

export function RoleDetail() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<RoleOpening | null>(null);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  async function loadData() {
    setLoading(true);
    try {
      const [roleData, submissionData] = await Promise.all([
        roleRepo.getById(roleId!),
        submissionRepo.getByRoleId(roleId!),
      ]);
      
      if (!roleData) {
        toast({ title: 'Error', description: 'Role not found', variant: 'destructive' });
        navigate('/employer/roles');
        return;
      }
      
      setRole(roleData);
      setSubmissions(submissionData);
    } catch (error) {
      console.error('Failed to load role:', error);
      toast({ title: 'Error', description: 'Failed to load role details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishRole() {
    if (!role) return;
    try {
      await roleRepo.update(role.id, { status: 'OPEN' });
      setRole({ ...role, status: 'OPEN' });
      toast({ title: 'Role published', description: 'AIHQ will start matching candidates' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to publish role', variant: 'destructive' });
    }
  }

  async function handleCloseRole() {
    if (!role) return;
    try {
      await roleRepo.update(role.id, { 
        status: 'CLOSED', 
        closedAt: new Date().toISOString(),
        closedReason: 'Closed by employer'
      });
      setRole({ ...role, status: 'CLOSED' });
      toast({ title: 'Role closed' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to close role', variant: 'destructive' });
    }
  }

  // LOI Banner handlers - navigate to dedicated LOI page
  function handleDownloadLOI() {
    navigate(`/employer/roles/${roleId}/loi`);
  }

  function handleUploadLOI() {
    navigate(`/employer/roles/${roleId}/loi`);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!role) return null;

  const isSelected = role.status === 'SELECTED' || role.status === 'PLACED';
  const showLOIBanner = role.loiStatus !== 'VERIFIED' && ['OPEN', 'INTERVIEWING', 'SELECTING'].includes(role.status);
  const showProgrammeSection = isSelected;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employer/roles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{role.title}</h1>
              <Badge className={statusColors[role.status]}>{role.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              {role.department && <span>{role.department}</span>}
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {role.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {role.headcount} {role.headcount === 1 ? 'position' : 'positions'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 md:ml-0">
          {role.status === 'DRAFT' && (
            <Button onClick={handlePublishRole}>Publish Role</Button>
          )}
          {['OPEN', 'INTERVIEWING', 'SELECTING'].includes(role.status) && (
            <Button variant="destructive" onClick={handleCloseRole}>Close Role</Button>
          )}
        </div>
      </div>

      {/* LOI Status Banner - Using shared component */}
      {showLOIBanner && (
        <LOIBanner 
          status={role.loiStatus}
          onDownload={handleDownloadLOI}
          onUpload={handleUploadLOI}
        />
      )}

      {/* Programme Section - Only shown after selection */}
      {showProgrammeSection && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-400">
                    Programme & Training Active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placement confirmed. View training progress and programme details.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/employer/roles/${roleId}/training`}>
                  View Training
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">
            Candidates ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="details">Role Details</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <CandidatePipeline 
            submissions={submissions} 
            roleId={role.id}
            loiVerified={role.loiStatus === 'VERIFIED'}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {role.niceToHave && role.niceToHave.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nice to Have</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.niceToHave.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle>Work Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Type
                  </p>
                  <p className="font-medium">{role.employmentType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Arrangement
                  </p>
                  <p className="font-medium">{role.workArrangement}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Headcount
                  </p>
                  <p className="font-medium">{role.headcount}</p>
                </div>
                {role.salaryMin && role.salaryMax && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Salary
                    </p>
                    <p className="font-medium">
                      ${role.salaryMin.toLocaleString()} - ${role.salaryMax.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span>Created by {role.createdByName}</span>
                <span>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {new Date(role.createdAt).toLocaleDateString()}
                </span>
                {role.placedAt && (
                  <span className="text-green-600">
                    Placed on {new Date(role.placedAt).toLocaleDateString()}
                  </span>
                )}
                {role.closedAt && (
                  <span>
                    Closed on {new Date(role.closedAt).toLocaleDateString()}
                    {role.closedReason && ` - ${role.closedReason}`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
