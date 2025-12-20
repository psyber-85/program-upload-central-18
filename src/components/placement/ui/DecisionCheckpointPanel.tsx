import { CheckCircle, Circle, PauseCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckpointStatus } from '@/lib/placement/types';

interface Checkpoint {
  id: 'interview' | 'loi' | 'training_completion';
  label: string;
  description: string;
  status: CheckpointStatus;
}

type CheckpointStatusMap = {
  interview: CheckpointStatus;
  loi: CheckpointStatus;
  training: CheckpointStatus;
};

interface DecisionCheckpointPanelProps {
  checkpoints: Checkpoint[] | CheckpointStatusMap;
  onProceed?: (checkpointId: string) => void;
  onHold?: (checkpointId: string) => void;
  onNotProceeding?: (checkpointId: string) => void;
  variant?: 'employer' | 'ops';
  compact?: boolean;
  className?: string;
}

const statusConfig: Record<CheckpointStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  pending: { icon: Circle, color: 'text-muted-foreground', label: 'Pending' },
  proceed: { icon: CheckCircle, color: 'text-green-600', label: 'Proceeding' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  hold: { icon: PauseCircle, color: 'text-amber-600', label: 'On Hold' },
  not_proceeding: { icon: XCircle, color: 'text-slate-500', label: 'Not Proceeding' },
};

function normalizeCheckpoints(input: Checkpoint[] | CheckpointStatusMap): Checkpoint[] {
  if (Array.isArray(input)) {
    return input;
  }
  
  // Convert object format to array format
  return [
    {
      id: 'interview',
      label: 'After Interview',
      description: 'Decide whether to proceed with this candidate',
      status: input.interview || 'pending',
    },
    {
      id: 'loi',
      label: 'Before LOI Signing',
      description: 'LOI enables training coordination (hiring remains optional)',
      status: input.loi || 'pending',
    },
    {
      id: 'training_completion',
      label: 'After Training Completion',
      description: 'Final decision on hiring',
      status: input.training || 'pending',
    },
  ];
}

export function DecisionCheckpointPanel({
  checkpoints,
  onProceed,
  onHold,
  onNotProceeding,
  variant = 'employer',
  compact = false,
  className,
}: DecisionCheckpointPanelProps) {
  const defaultCheckpoints: Checkpoint[] = [
    {
      id: 'interview',
      label: 'After Interview',
      description: 'Decide whether to proceed with this candidate',
      status: 'pending',
    },
    {
      id: 'loi',
      label: 'Before LOI Signing',
      description: 'LOI enables training coordination (hiring remains optional)',
      status: 'pending',
    },
    {
      id: 'training_completion',
      label: 'After Training Completion',
      description: 'Final decision on hiring',
      status: 'pending',
    },
  ];

  const normalizedCheckpoints = normalizeCheckpoints(checkpoints);
  const displayCheckpoints = normalizedCheckpoints.length > 0 ? normalizedCheckpoints : defaultCheckpoints;

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {displayCheckpoints.map((checkpoint) => {
          const config = statusConfig[checkpoint.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <div key={checkpoint.id} className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className="text-sm">{checkpoint.label}</span>
              <span className={cn('text-xs ml-auto', config.color)}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Decision Checkpoints</CardTitle>
        <p className="text-sm text-muted-foreground">
          {variant === 'employer' 
            ? 'Track your decisions at each stage. Not proceeding is always an option.'
            : 'Manage decision checkpoints for this placement.'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayCheckpoints.map((checkpoint, index) => {
          const config = statusConfig[checkpoint.status] || statusConfig.pending;
          const Icon = config.icon;
          const isActive = checkpoint.status === 'pending' && 
            (index === 0 || displayCheckpoints[index - 1].status === 'proceed' || displayCheckpoints[index - 1].status === 'completed');

          return (
            <div
              key={checkpoint.id}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                isActive ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/20',
                checkpoint.status === 'not_proceeding' && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5', config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{checkpoint.label}</h4>
                    <span className={cn('text-xs', config.color)}>
                      ({config.label})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {checkpoint.description}
                  </p>
                  
                  {isActive && checkpoint.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      {onProceed && (
                        <Button size="sm" onClick={() => onProceed(checkpoint.id)}>
                          Proceed
                        </Button>
                      )}
                      {onHold && (
                        <Button size="sm" variant="outline" onClick={() => onHold(checkpoint.id)}>
                          Hold
                        </Button>
                      )}
                      {onNotProceeding && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => onNotProceeding(checkpoint.id)}
                        >
                          Not Proceeding
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {variant === 'employer' && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            AIHQ will coordinate alternatives if you choose not to proceed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
