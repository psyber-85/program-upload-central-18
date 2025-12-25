import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Calendar, MessageSquare, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submissionRepo } from '@/lib/placement/client';
import type { CandidateSubmission, SubmissionStage } from '@/lib/placement/types';

interface CandidatePipelineProps {
  submissions: CandidateSubmission[];
  roleId: string;
  loiVerified: boolean;
  onUpdate: () => void;
}

const pipelineStages: { stage: SubmissionStage; label: string }[] = [
  { stage: 'SUBMITTED', label: 'Submitted' },
  { stage: 'SHORTLISTED', label: 'Shortlisted' },
  { stage: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { stage: 'INTERVIEWED', label: 'Interviewed' },
  { stage: 'OFFERED', label: 'Offered' },
  { stage: 'SELECTED', label: 'Selected' },
];

const stageColors: Record<SubmissionStage, string> = {
  SUBMITTED: 'border-l-blue-500',
  SHORTLISTED: 'border-l-purple-500',
  INTERVIEW_REQUESTED: 'border-l-amber-500',
  INTERVIEW_SCHEDULED: 'border-l-cyan-500',
  INTERVIEWED: 'border-l-indigo-500',
  OFFERED: 'border-l-emerald-500',
  SELECTED: 'border-l-green-600',
  REJECTED: 'border-l-red-500',
  WITHDRAWN: 'border-l-gray-500',
};

export function CandidatePipeline({ submissions, roleId, loiVerified, onUpdate }: CandidatePipelineProps) {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<CandidateSubmission | null>(null);
  const [actionType, setActionType] = useState<'shortlist' | 'schedule' | 'reject' | 'select' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Group submissions by stage (active only, exclude rejected/withdrawn)
  const activeSubmissions = submissions.filter(s => !['REJECTED', 'WITHDRAWN'].includes(s.stage));
  const rejectedSubmissions = submissions.filter(s => ['REJECTED', 'WITHDRAWN'].includes(s.stage));

  const getSubmissionsByStage = (stage: SubmissionStage) => 
    activeSubmissions.filter(s => s.stage === stage);

  async function handleAction() {
    if (!selectedSubmission || !actionType) return;
    
    setIsProcessing(true);
    try {
      let newStage: SubmissionStage;
      let updates: Partial<CandidateSubmission> = {};

      switch (actionType) {
        case 'shortlist':
          newStage = 'SHORTLISTED';
          break;
        case 'schedule':
          newStage = 'INTERVIEW_SCHEDULED';
          updates.interviewScheduledAt = new Date().toISOString();
          break;
        case 'reject':
          newStage = 'REJECTED';
          updates.rejectedAt = new Date().toISOString();
          updates.rejectionReason = actionNotes;
          break;
        case 'select':
          newStage = 'SELECTED';
          updates.selectedAt = new Date().toISOString();
          break;
        default:
          return;
      }

      await submissionRepo.update(selectedSubmission.id, {
        stage: newStage,
        ...updates,
        employerNotes: actionNotes || selectedSubmission.employerNotes,
      });

      toast({ 
        title: actionType === 'reject' ? 'Candidate rejected' : 'Candidate updated',
        description: `${selectedSubmission.candidateDisplayName} has been ${actionType === 'reject' ? 'rejected' : 'moved to ' + newStage.toLowerCase()}`
      });

      setSelectedSubmission(null);
      setActionType(null);
      setActionNotes('');
      onUpdate();
    } catch (error) {
      console.error('Failed to update submission:', error);
      toast({ title: 'Error', description: 'Failed to update candidate', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }

  function openActionDialog(submission: CandidateSubmission, type: typeof actionType) {
    if (!loiVerified && type !== 'reject') {
      toast({
        title: 'LOI Required',
        description: 'Please sign the Letter of Intent before proceeding with candidates',
        variant: 'destructive'
      });
      return;
    }
    setSelectedSubmission(submission);
    setActionType(type);
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No candidates yet</h3>
          <p className="text-muted-foreground">
            AIHQ will submit matching candidates for your review
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipelineStages.map(({ stage, label }) => {
          const stageSubmissions = getSubmissionsByStage(stage);
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{label}</h4>
                <Badge variant="secondary" className="text-xs">
                  {stageSubmissions.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                {stageSubmissions.map((submission) => (
                  <CandidateCard
                    key={submission.id}
                    submission={submission}
                    roleId={roleId}
                    loiVerified={loiVerified}
                    onShortlist={() => openActionDialog(submission, 'shortlist')}
                    onSchedule={() => openActionDialog(submission, 'schedule')}
                    onReject={() => openActionDialog(submission, 'reject')}
                    onSelect={() => openActionDialog(submission, 'select')}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected/Withdrawn */}
      {rejectedSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rejected / Withdrawn ({rejectedSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {rejectedSubmissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{submission.candidateDisplayName}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {submission.stage === 'REJECTED' ? 'Rejected' : 'Withdrawn'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedSubmission(null); setActionNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'shortlist' && 'Shortlist Candidate'}
              {actionType === 'schedule' && 'Schedule Interview'}
              {actionType === 'reject' && 'Reject Candidate'}
              {actionType === 'select' && 'Select Candidate'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission?.candidateDisplayName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {actionType === 'reject' ? 'Rejection Reason' : 'Notes (optional)'}
              </label>
              <Textarea
                placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Add notes...'}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedSubmission(null); }}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CandidateCardProps {
  submission: CandidateSubmission;
  roleId: string;
  loiVerified: boolean;
  onShortlist: () => void;
  onSchedule: () => void;
  onReject: () => void;
  onSelect: () => void;
}

function CandidateCard({ submission, roleId, loiVerified, onShortlist, onSchedule, onReject, onSelect }: CandidateCardProps) {
  const stage = submission.stage;

  return (
    <Card className={`border-l-4 ${stageColors[stage]}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <Link 
            to={`/employer/roles/${roleId}/candidate/${submission.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm leading-tight hover:underline">{submission.candidateDisplayName}</p>
              {submission.employerRating && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < submission.employerRating! ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>
          <Link 
            to={`/employer/roles/${roleId}/candidate/${submission.id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {submission.interviewScheduledAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(submission.interviewScheduledAt).toLocaleDateString()}
          </div>
        )}

        {submission.employerNotes && (
          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3 mt-0.5" />
            <span className="line-clamp-2">{submission.employerNotes}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-1 pt-1">
          {stage === 'SUBMITTED' && (
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs flex-1"
                onClick={onShortlist}
                title={!loiVerified ? 'LOI required' : ''}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Shortlist
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onReject}>
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
          {stage === 'SHORTLISTED' && (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={onSchedule}>
                <Calendar className="h-3 w-3 mr-1" />
                Schedule
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onReject}>
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
          {(stage === 'INTERVIEWED' || stage === 'OFFERED') && (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={onSelect}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Select
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onReject}>
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
          {stage === 'SELECTED' && (
            <Badge variant="default" className="w-full justify-center text-xs">
              Selected ✓
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
