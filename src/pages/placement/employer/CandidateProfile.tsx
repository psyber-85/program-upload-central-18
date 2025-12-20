import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AISkillBadge, StepTimeline, Callout } from '@/components/placement/ui';
import { useToast } from '@/hooks/use-toast';
import { mockCandidates, mockMatches, mockRoleRequests } from '@/lib/placement/mockData';
import { useAuth } from '@/lib/placement/AuthContext';
import { AI_SKILL_LEVELS } from '@/lib/placement/types';

const availabilityLabels = {
  immediate: 'Available immediately',
  two_weeks: 'Available in 2 weeks',
  one_month: 'Available in 1 month',
  flexible: 'Flexible availability',
};

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Find the candidate
  const candidate = mockCandidates.find((c) => c.id === id);

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Candidate not found</h2>
        <p className="text-muted-foreground mb-4">This candidate profile doesn't exist or has been removed.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Verify this candidate is matched to one of the company's roles
  const companyRoles = mockRoleRequests.filter((r) => r.company_id === companyId);
  const companyRoleIds = companyRoles.map((r) => r.id);
  const relevantMatch = mockMatches.find(
    (m) => m.candidate_id === candidate.id && companyRoleIds.includes(m.role_request_id)
  );
  const matchedRole = relevantMatch 
    ? companyRoles.find((r) => r.id === relevantMatch.role_request_id) 
    : null;

  const handleRequestInterview = () => {
    toast({
      title: 'Interview requested',
      description: `AIHQ will coordinate an interview with ${candidate.display_name}.`,
    });
  };

  const handleProceedToLOI = () => {
    toast({
      title: 'Proceeding to LOI',
      description: 'AIHQ will prepare the Letter of Intent for your review.',
    });
  };

  // Training timeline steps (mock)
  const trainingSteps = [
    { label: 'Assessment', description: 'Completed' },
    { label: 'Training', description: candidate.training_status_summary || 'In progress' },
    { label: 'Certification', description: 'Pending' },
    { label: 'Placement Ready', description: candidate.placement_readiness ? 'Yes' : 'Pending' },
  ];
  const currentTrainingStep = candidate.placement_readiness ? 3 : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{candidate.display_name}</h1>
              <AISkillBadge level={candidate.ai_skill_level} />
            </div>
            <p className="text-lg text-muted-foreground">{candidate.headline}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRequestInterview}>
              Request Interview
            </Button>
            <Button variant="outline" onClick={handleProceedToLOI}>
              Proceed to LOI
            </Button>
          </div>
        </div>
      </div>

      {/* Matched Role Context */}
      {matchedRole && (
        <Callout variant="info" title="Matched to Your Role">
          This candidate has been curated for: <strong>{matchedRole.title}</strong>
        </Callout>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{candidate.public_summary}</p>
            </CardContent>
          </Card>

          {/* Key Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Key Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.key_capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-sm">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Skill Level */}
          <Card>
            <CardHeader>
              <CardTitle>AI Proficiency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <AISkillBadge level={candidate.ai_skill_level} />
                <div>
                  <p className="font-medium">
                    {AI_SKILL_LEVELS[candidate.ai_skill_level].label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {AI_SKILL_LEVELS[candidate.ai_skill_level].description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Progress */}
          {candidate.training_status_summary && (
            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <StepTimeline
                  steps={trainingSteps}
                  currentStep={currentTrainingStep}
                  orientation="horizontal"
                />
                {candidate.placement_readiness && (
                  <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Placement Ready</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{candidate.location}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm text-muted-foreground">
                    {availabilityLabels[candidate.availability]}
                  </p>
                </div>
              </div>

              {candidate.salary_range_display && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Expected Salary</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.salary_range_display}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trust Callout */}
          <Callout variant="trust">
            This candidate has been screened and verified by AIHQ. We coordinate all communication and interviews.
          </Callout>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleRequestInterview}>
                Request Interview
              </Button>
              <Button variant="outline" className="w-full" onClick={handleProceedToLOI}>
                Proceed to LOI
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                AIHQ will coordinate all next steps
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
