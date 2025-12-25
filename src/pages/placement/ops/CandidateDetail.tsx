import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Calendar } from 'lucide-react';
import { candidateRepo, submissionRepo } from '@/lib/placement/client';
import type { CandidateProfile, CandidateSubmission, ActivityLog } from '@/lib/placement/types';
import { StatusBadge, CVViewerModal, ActivityTimeline } from '@/components/placement/shared';

export function OpsCandidateDetail() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCV, setShowCV] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!candidateId) return;
      try {
        const [candidateData, submissionsData] = await Promise.all([
          candidateRepo.getById(candidateId),
          submissionRepo.getAll({ candidateId }),
        ]);
        setCandidate(candidateData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Failed to load candidate:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button asChild className="mt-4">
          <Link to="/ops/candidates">Back to Candidates</Link>
        </Button>
      </div>
    );
  }

  const activeSubmissions = submissions.filter(s => !['REJECTED', 'WITHDRAWN'].includes(s.stage)).length;

  const availabilityLabels = {
    IMMEDIATE: 'Immediate',
    TWO_WEEKS: '2 Weeks',
    ONE_MONTH: '1 Month',
    LONGER: '1+ Month',
  };

  const mockActivities: ActivityLog[] = [
    {
      id: '1',
      type: 'CANDIDATE_SUBMITTED',
      candidateId: candidate.id,
      actorId: 'system',
      actorName: 'System',
      actorRole: 'AIHQ_OPS',
      title: 'Profile created',
      createdAt: candidate.createdAt,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/ops/candidates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
            <Badge variant="secondary">{availabilityLabels[candidate.availability]}</Badge>
          </div>
          <p className="text-muted-foreground">{candidate.currentRole || 'No current role'}</p>
        </div>
        <Button onClick={() => setShowCV(true)} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View CV
        </Button>
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
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
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
                <p className="text-2xl font-bold">{activeSubmissions}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidate.yearsExperience || 0}</p>
                <p className="text-sm text-muted-foreground">Years Exp.</p>
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
                <p className="text-2xl font-bold">{availabilityLabels[candidate.availability]}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="submissions">Applications ({submissions.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                </div>

                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{candidate.phone}</p>
                    </div>
                  </div>
                )}

                {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Locations</p>
                      <p className="font-medium">{candidate.preferredLocations.join(', ')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.currentRole && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Role</p>
                      <p className="font-medium">{candidate.currentRole}</p>
                    </div>
                  </div>
                )}

                {candidate.education && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Education</p>
                      <p className="font-medium">{candidate.education}</p>
                    </div>
                  </div>
                )}

                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/ops/roles/${sub.roleId}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{sub.roleName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {sub.companyName} • Submitted {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge type="stage" value={sub.stage} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline activities={mockActivities} />
        </TabsContent>
      </Tabs>

      {/* CV Viewer Modal */}
      <CVViewerModal
        open={showCV}
        onClose={() => setShowCV(false)}
        candidate={candidate}
        isEmployerView={false}
      />
    </div>
  );
}
