import { User, CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CandidateSubmission, SubmissionStage } from '@/lib/placement/types';

interface PipelineBoardProps {
  submissions: CandidateSubmission[];
  onCandidateClick?: (submission: CandidateSubmission) => void;
  onAction?: (submission: CandidateSubmission, action: string) => void;
  compact?: boolean;
}

const pipelineStages: { stage: SubmissionStage; label: string; color: string }[] = [
  { stage: 'SUBMITTED', label: 'Submitted', color: 'border-l-blue-500' },
  { stage: 'SHORTLISTED', label: 'Shortlisted', color: 'border-l-purple-500' },
  { stage: 'INTERVIEW_SCHEDULED', label: 'Interview', color: 'border-l-cyan-500' },
  { stage: 'INTERVIEWED', label: 'Interviewed', color: 'border-l-indigo-500' },
  { stage: 'OFFERED', label: 'Offered', color: 'border-l-emerald-500' },
  { stage: 'SELECTED', label: 'Selected', color: 'border-l-green-600' },
];

export function PipelineBoard({ submissions, onCandidateClick, onAction, compact = false }: PipelineBoardProps) {
  const activeSubmissions = submissions.filter(s => !['REJECTED', 'WITHDRAWN'].includes(s.stage));
  const rejectedSubmissions = submissions.filter(s => ['REJECTED', 'WITHDRAWN'].includes(s.stage));

  const getSubmissionsByStage = (stage: SubmissionStage) => 
    activeSubmissions.filter(s => s.stage === stage);

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No candidates yet</h3>
          <p className="text-muted-foreground">
            Candidates will appear here once submitted
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'}`}>
        {pipelineStages.map(({ stage, label, color }) => {
          const stageSubmissions = getSubmissionsByStage(stage);
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{label}</h4>
                <Badge variant="secondary" className="text-xs">
                  {stageSubmissions.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[150px] bg-muted/30 rounded-lg p-2">
                {stageSubmissions.map((submission) => (
                  <PipelineCard
                    key={submission.id}
                    submission={submission}
                    color={color}
                    compact={compact}
                    onClick={() => onCandidateClick?.(submission)}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected/Withdrawn */}
      {rejectedSubmissions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Rejected / Withdrawn ({rejectedSubmissions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {rejectedSubmissions.map((submission) => (
              <Badge 
                key={submission.id} 
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => onCandidateClick?.(submission)}
              >
                <User className="h-3 w-3 mr-1" />
                {submission.candidateDisplayName}
                <span className="ml-1 text-xs opacity-60">
                  ({submission.stage === 'REJECTED' ? 'Rejected' : 'Withdrawn'})
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PipelineCardProps {
  submission: CandidateSubmission;
  color: string;
  compact?: boolean;
  onClick?: () => void;
  onAction?: (submission: CandidateSubmission, action: string) => void;
}

function PipelineCard({ submission, color, compact, onClick, onAction }: PipelineCardProps) {
  return (
    <Card 
      className={`border-l-4 ${color} cursor-pointer hover:shadow-sm transition-shadow`}
      onClick={onClick}
    >
      <CardContent className={compact ? 'p-2' : 'p-3'}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-3 w-3 text-primary" />
          </div>
          <span className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {submission.candidateDisplayName}
          </span>
        </div>

        {!compact && (
          <>
            {submission.interviewScheduledAt && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(submission.interviewScheduledAt).toLocaleDateString()}
              </div>
            )}

            {onAction && (
              <div className="flex gap-1 mt-2">
                {submission.stage === 'SUBMITTED' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 text-xs flex-1"
                    onClick={(e) => { e.stopPropagation(); onAction(submission, 'shortlist'); }}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
                {submission.stage !== 'SELECTED' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 text-xs"
                    onClick={(e) => { e.stopPropagation(); onAction(submission, 'reject'); }}
                  >
                    <XCircle className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
