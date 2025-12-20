import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StepTimeline, Callout, EmptyState } from '@/components/placement/ui';
import { useAuth } from '@/lib/placement/AuthContext';
import {
  mockTrainingEnrollments,
  mockTrainingPrograms,
  mockCandidates,
  mockMatches,
  mockRoleRequests,
} from '@/lib/placement/mockData';

export function TrainingOverview() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Get company's roles
  const companyRoles = mockRoleRequests.filter((r) => r.company_id === companyId);
  const companyRoleIds = companyRoles.map((r) => r.id);

  // Get matches for company's roles
  const companyMatches = mockMatches.filter((m) => companyRoleIds.includes(m.role_request_id));
  const matchedCandidateIds = companyMatches.map((m) => m.candidate_id);

  // Get training enrollments for matched candidates
  const relevantEnrollments = mockTrainingEnrollments.filter((e) =>
    matchedCandidateIds.includes(e.candidate_id)
  );

  // Enrich enrollments with candidate and program info
  const enrichedEnrollments = relevantEnrollments.map((enrollment) => {
    const candidate = mockCandidates.find((c) => c.id === enrollment.candidate_id);
    const program = mockTrainingPrograms.find((p) => p.id === enrollment.program_id);
    const match = companyMatches.find((m) => m.candidate_id === enrollment.candidate_id);
    const role = match ? companyRoles.find((r) => r.id === match.role_request_id) : null;
    return { enrollment, candidate, program, role };
  });

  // Filter active enrollments
  const activeEnrollments = enrichedEnrollments.filter(
    (e) => e.enrollment.status === 'IN_PROGRESS' || e.enrollment.status === 'ENROLLED'
  );

  // Completed enrollments
  const completedEnrollments = enrichedEnrollments.filter(
    (e) => e.enrollment.status === 'COMPLETED'
  );

  // Training steps for timeline
  const getTrainingSteps = (programModules: string[]) => {
    return programModules.map((module) => ({ label: module }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Training Overview</h1>
        <p className="text-muted-foreground">
          Track training progress for candidates matched to your roles
        </p>
      </div>

      {/* Train & Place Explanation */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">The Train & Place Program</h3>
              <p className="text-sm text-muted-foreground">
                AIHQ provides structured training programs to upskill candidates to meet your specific requirements. 
                Training may be eligible for grant support, reducing your hiring costs while ensuring candidates 
                are fully prepared for their roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Training */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Training</h2>

        {activeEnrollments.length > 0 ? (
          <div className="space-y-4">
            {activeEnrollments.map(({ enrollment, candidate, program, role }) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{candidate?.display_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Training for: {role?.title || 'Role'}
                      </p>
                    </div>
                    <Badge variant={enrollment.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                      {enrollment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Program Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{program?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{program?.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Expected: {new Date(enrollment.expected_completion_date).toLocaleDateString('en-MY')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress_percent}%</span>
                    </div>
                    <Progress value={enrollment.progress_percent} />
                  </div>

                  {/* Module Timeline */}
                  {program && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-3">Training Modules</p>
                      <StepTimeline
                        steps={getTrainingSteps(program.modules)}
                        currentStep={Math.floor((enrollment.progress_percent / 100) * program.modules.length)}
                        orientation="horizontal"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={GraduationCap}
                title="No active training"
                description="Candidates matched to your roles will appear here once training begins. AIHQ coordinates all training activities."
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Training */}
      {completedEnrollments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed Training</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedEnrollments.map(({ enrollment, candidate, program }) => (
              <Card key={enrollment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{candidate?.display_name}</p>
                      <p className="text-sm text-muted-foreground">{program?.name}</p>
                      <Badge variant="outline" className="mt-2">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trust Callout */}
      <Callout variant="trust">
        AIHQ manages all training logistics, progress tracking, and certification. You'll be notified when candidates complete their training and are ready for placement.
      </Callout>
    </div>
  );
}
