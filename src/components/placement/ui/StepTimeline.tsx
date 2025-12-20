import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface StepTimelineProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export function StepTimeline({ steps, currentStep, orientation = 'horizontal' }: StepTimelineProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-start' : 'flex-col'
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={cn(
              'flex',
              isHorizontal ? 'flex-col items-center flex-1' : 'flex-row items-start'
            )}
          >
            <div
              className={cn(
                'flex items-center',
                isHorizontal ? 'flex-col' : 'flex-row'
              )}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-colors',
                  'h-8 w-8 text-sm font-medium',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-background text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'transition-colors',
                    isHorizontal ? 'hidden sm:block w-full h-0.5 mt-4' : 'w-0.5 h-8 ml-4 my-1',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                  style={isHorizontal ? { minWidth: '2rem' } : undefined}
                />
              )}
            </div>

            {/* Step Label */}
            <div
              className={cn(
                isHorizontal ? 'mt-2 text-center px-2' : 'ml-4 pb-8'
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
