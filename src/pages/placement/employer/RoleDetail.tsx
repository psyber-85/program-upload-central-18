import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, AISkillBadge, CandidateCard, Callout, EmptyState } from '@/components/placement/ui';
import { useToast } from '@/hooks/use-toast';
import { mockRoleRequests, mockMatches, mockCandidates } from '@/lib/placement/mockData';
import { AI_SKILL_LEVELS } from '@/lib/placement/types';

const timelineLabels = {
  urgent: { label: 'Urgent', description: 'Need to fill within 2 weeks' },
  normal: { label: 'Normal', description: 'Standard 4-6 week timeline' },
  flexible: { label: 'Flexible', description: 'No specific deadline' },
};

export function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find the role
  const role = mockRoleRequests.find((r) => r.id === id);

  if (!role) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Role not found</h2>
        <p className="text-muted-foreground mb-4">This role request doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/employer/roles')}>Back to Roles</Button>
      </div>
    );
  }

  // Get matches for this role
  const roleMatches = mockMatches.filter((m) => m.role_request_id === role.id);
  
  // Get candidate details for matches
  const matchedCandidates = roleMatches.map((match) => {
    const candidate = mockCandidates.find((c) => c.id === match.candidate_id);
    return { match, candidate };
  }).filter((item) => item.candidate);

  // Determine next step based on status
  const getNextStep = () => {
    switch (role.status) {
      case 'SCOPING':
        return 'AIHQ is reviewing your requirements';
      case 'REVIEWING':
        return 'AIHQ is sourcing candidates';
      case 'MATCHING':
        return 'Review the curated candidates below';
      case 'INTERVIEWING':
        return 'Complete interviews and provide feedback';
      case 'LOI_PENDING':
        return 'Review and sign the Letter of Intent';
      case 'PLACED':
        return 'Placement completed successfully';
      default:
        return 'Awaiting next steps';
    }
  };

  const handleRequestInterview = (candidateName: string) => {
    toast({
      title: 'Interview requested',
      description: `AIHQ will coordinate an interview with ${candidateName}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{role.title}</h1>
              <StatusBadge status={role.status} />
            </div>
            <p className="text-muted-foreground">{role.department}</p>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact AIHQ
            </Link>
          </Button>
        </div>
      </div>

      {/* Next Step Callout */}
      <Callout variant="info" title="Next Step">
        {getNextStep()}
      </Callout>

      {/* Role Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Problem Statement */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Problem Statement</h4>
            <p className="text-foreground">{role.problem_statement}</p>
          </div>

          <Separator />

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">AI Skill Level</h4>
              <div className="flex items-center gap-2">
                <AISkillBadge level={role.ai_skill_level_required} />
                <span className="text-sm text-muted-foreground">
                  {AI_SKILL_LEVELS[role.ai_skill_level_required].label}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
              <div className="flex items-center gap-2">
                {role.timeline === 'urgent' ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {timelineLabels[role.timeline].label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timelineLabels[role.timeline].description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Submitted</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(role.created_at).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curated Candidates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Curated Candidates</h2>
            <p className="text-sm text-muted-foreground">
              AIHQ has selected these candidates based on your requirements
            </p>
          </div>
          {matchedCandidates.length > 0 && (
            <Badge variant="secondary">{matchedCandidates.length} candidate{matchedCandidates.length !== 1 ? 's' : ''}</Badge>
          )}
        </div>

        {matchedCandidates.length > 0 ? (
          <>
            <Callout variant="trust">
              These candidates have been carefully screened by AIHQ. Click on a candidate to view their full profile.
            </Callout>
            
            <div className="space-y-4">
              {matchedCandidates.map(({ match, candidate }) => (
                <div key={match.id} className="space-y-2">
                  <CandidateCard
                    candidate={candidate!}
                    variant="employer"
                    linkTo={`/employer/candidates/${candidate!.id}`}
                    showStatus={false}
                  />
                  <div className="flex gap-2 pl-4">
                    <Button
                      size="sm"
                      onClick={() => handleRequestInterview(candidate!.display_name)}
                      disabled={['INTERVIEW_SCHEDULED', 'PROCEEDING_TO_LOI'].includes(match.match_status)}
                    >
                      Request Interview
                    </Button>
                    {match.interview_status && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        {match.interview_status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                title="No candidates yet"
                description="AIHQ is currently sourcing and screening candidates for this role. You'll be notified when candidates are ready for review."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
