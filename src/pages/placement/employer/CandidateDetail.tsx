import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, FileText, Calendar, Star, MessageSquare,
  Clock, CheckCircle, XCircle, AlertCircle, GraduationCap, Briefcase, Award, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo, submissionRepo, candidateRepo, taskRepo } from '@/lib/placement/client';
import type { RoleOpening, CandidateSubmission, CandidateProfile, SubmissionStage } from '@/lib/placement/types';

const stageOptions: { value: SubmissionStage; label: string }[] = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW_REQUESTED', label: 'Interview Requested' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEWED', label: 'Interviewed' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

const stageColors: Record<SubmissionStage, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SHORTLISTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  INTERVIEW_REQUESTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  INTERVIEW_SCHEDULED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  INTERVIEWED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  OFFERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  SELECTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const availabilityLabels = {
  IMMEDIATE: 'Immediate',
  TWO_WEEKS: '2 Weeks Notice',
  ONE_MONTH: '1 Month Notice',
  LONGER: '1+ Month Notice',
};

export function EmployerCandidateDetail() {
  const { roleId, submissionId } = useParams<{ roleId: string; submissionId: string }>();
  const navigate = useNavigate();
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  
  const [role, setRole] = useState<RoleOpening | null>(null);
  const [submission, setSubmission] = useState<CandidateSubmission | null>(null);
  const [candidate, setCandidate] = useState<Partial<CandidateProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [interviewNotes, setInterviewNotes] = useState('');
  const [selectedStage, setSelectedStage] = useState<SubmissionStage | ''>('');
  const [rating, setRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  
  // Interview request dialog
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewMessage, setInterviewMessage] = useState('');

  useEffect(() => {
    if (roleId && submissionId) {
      loadData();
    }
  }, [roleId, submissionId]);

  async function loadData() {
    setLoading(true);
    try {
      const [roleData, submissionData] = await Promise.all([
        roleRepo.getById(roleId!),
        submissionRepo.getById(submissionId!),
      ]);
      
      if (!roleData || !submissionData) {
        toast({ title: 'Error', description: 'Candidate not found', variant: 'destructive' });
        navigate(`/employer/roles/${roleId}`);
        return;
      }
      
      // Get employer-safe candidate view
      const candidateData = await candidateRepo.getEmployerSafeView(submissionData.candidateId);
      
      setRole(roleData);
      setSubmission(submissionData);
      setCandidate(candidateData);
      setInterviewNotes(submissionData.interviewNotes || submissionData.employerNotes || '');
      setSelectedStage(submissionData.stage);
      setRating(submissionData.employerRating || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: 'Error', description: 'Failed to load candidate details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    if (!submission) return;
    
    setSaving(true);
    try {
      await submissionRepo.update(submission.id, {
        interviewNotes,
        employerNotes: interviewNotes,
        employerRating: rating || undefined,
      });
      toast({ title: 'Notes saved', description: 'Your notes have been updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(newStage: SubmissionStage) {
    if (!submission || !role) return;
    
    // Check LOI for progression stages
    const progressionStages: SubmissionStage[] = ['SHORTLISTED', 'INTERVIEW_REQUESTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'SELECTED'];
    if (progressionStages.includes(newStage) && role.loiStatus !== 'VERIFIED') {
      toast({
        title: 'LOI Required',
        description: 'Please sign the Letter of Intent before progressing candidates',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const updates: Partial<CandidateSubmission> = { stage: newStage };
      
      if (newStage === 'REJECTED') {
        updates.rejectedAt = new Date().toISOString();
      } else if (newStage === 'SELECTED') {
        updates.selectedAt = new Date().toISOString();
      }
      
      await submissionRepo.update(submission.id, updates);
      setSubmission({ ...submission, ...updates });
      setSelectedStage(newStage);
      toast({ title: 'Stage updated', description: `Candidate moved to ${newStage.replace('_', ' ').toLowerCase()}` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update stage', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestInterview() {
    if (!submission || !role || !session) return;
    
    // Check LOI
    if (role.loiStatus !== 'VERIFIED') {
      toast({
        title: 'LOI Required',
        description: 'Please sign the Letter of Intent before requesting interviews',
        variant: 'destructive'
      });
      navigate(`/employer/roles/${roleId}/loi`);
      return;
    }
    
    setSaving(true);
    try {
      // Update submission stage
      await submissionRepo.update(submission.id, {
        stage: 'INTERVIEW_REQUESTED',
      });
      
      // Create task for AIHQ ops
      await taskRepo.create({
        title: `Interview request: ${submission.candidateDisplayName} for ${role.title}`,
        description: interviewMessage || 'Employer has requested an interview for this candidate',
        roleId: role.id,
        candidateId: submission.candidateId,
        submissionId: submission.id,
        companyId: role.companyId,
        createdById: session.userId,
        createdByName: session.userName,
        priority: 'HIGH',
        status: 'TODO',
      });
      
      setSubmission({ ...submission, stage: 'INTERVIEW_REQUESTED' });
      setSelectedStage('INTERVIEW_REQUESTED');
      setShowInterviewDialog(false);
      setInterviewMessage('');
      
      toast({ 
        title: 'Interview Requested', 
        description: 'AIHQ will coordinate scheduling with the candidate' 
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to request interview', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!role || !submission || !candidate) return null;

  const loiVerified = role.loiStatus === 'VERIFIED';
  const canRequestInterview = loiVerified && 
    ['SUBMITTED', 'SHORTLISTED'].includes(submission.stage);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/employer/roles/${roleId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{candidate.displayName}</h1>
              <p className="text-muted-foreground">{candidate.currentRole || 'Candidate'}</p>
            </div>
            <Badge className={stageColors[submission.stage]}>{submission.stage.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Applied to: <Link to={`/employer/roles/${roleId}`} className="text-primary hover:underline">{role.title}</Link>
          </p>
        </div>
      </div>

      {/* LOI Warning */}
      {!loiVerified && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-400">LOI Required</p>
                <p className="text-sm text-muted-foreground">
                  Sign the Letter of Intent to unlock interview requests and candidate progression
                </p>
              </div>
              <Button size="sm" asChild>
                <Link to={`/employer/roles/${roleId}/loi`}>Complete LOI</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - CV & Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{candidate.yearsExperience || 0}</p>
                  <p className="text-xs text-muted-foreground">Years Exp</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{candidate.skills?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Skills</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">
                    {candidate.availability ? availabilityLabels[candidate.availability] : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Availability</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">
                    {candidate.expectedSalary ? `$${candidate.expectedSalary.toLocaleString()}` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Expected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {candidate.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{candidate.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education & Certifications */}
          <div className="grid md:grid-cols-2 gap-6">
            {candidate.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{candidate.education}</p>
                </CardContent>
              </Card>
            )}
            
            {candidate.certifications && candidate.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.certifications.map((cert, i) => (
                      <Badge key={i} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AIHQ Assessment Note */}
          {candidate.programmeName && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">AIHQ Programme Graduate</p>
                    <p className="text-sm text-muted-foreground">{candidate.programmeName}</p>
                    {/* This would be the aihq_assessment_note_employer from the superprompt */}
                    <p className="text-sm mt-2">
                      Completed structured AI capability training with demonstrated competency in practical applications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CV Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CV / Resume
              </CardTitle>
              <CardDescription>Employer-safe version (contact details redacted)</CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.cvEmployerSafeUrl ? (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={candidate.cvEmployerSafeUrl} target="_blank" rel="noopener noreferrer">
                      View CV
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={candidate.cvEmployerSafeUrl} download>
                      Download CV
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">CV not available yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Notes */}
        <div className="space-y-6">
          {/* Stage Dropdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={selectedStage} 
                onValueChange={(v) => handleStageChange(v as SubmissionStage)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!loiVerified && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Some stages require LOI verification
                </p>
              )}
            </CardContent>
          </Card>

          {/* Interview Request */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Interview</CardTitle>
              <CardDescription>AIHQ will coordinate scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              {canRequestInterview ? (
                <Button 
                  className="w-full" 
                  onClick={() => setShowInterviewDialog(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Interview via AIHQ
                </Button>
              ) : submission.stage === 'INTERVIEW_REQUESTED' ? (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  Interview request pending
                </div>
              ) : submission.stage === 'INTERVIEW_SCHEDULED' ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Interview scheduled
                </div>
              ) : !loiVerified ? (
                <Button variant="outline" className="w-full" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  LOI Required
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not available at this stage
                </p>
              )}
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        star <= rating 
                          ? 'text-amber-500 fill-amber-500' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Interview Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your notes about this candidate..."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows={6}
              />
              <Button onClick={handleSaveNotes} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {submission.stage !== 'SELECTED' && submission.stage !== 'REJECTED' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleStageChange('SELECTED')}
                    disabled={!loiVerified || saving}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Select This Candidate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => handleStageChange('REJECTED')}
                    disabled={saving}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Candidate
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interview Request Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Interview via AIHQ</DialogTitle>
            <DialogDescription>
              AIHQ will coordinate interview scheduling with {candidate.displayName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Message to AIHQ (optional)</Label>
              <Textarea
                placeholder="Any specific requirements, preferred times, or notes for AIHQ..."
                value={interviewMessage}
                onChange={(e) => setInterviewMessage(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">What happens next:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• AIHQ receives your interview request</li>
                <li>• We'll coordinate availability with the candidate</li>
                <li>• You'll receive proposed interview slots</li>
                <li>• Interview details will be shared once confirmed</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInterview} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
