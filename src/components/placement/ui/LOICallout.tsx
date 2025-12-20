import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LOICalloutProps {
  variant?: 'prominent' | 'subtle' | 'info';
  className?: string;
  children?: React.ReactNode;
}

export function LOICallout({ variant = 'prominent', className, children }: LOICalloutProps) {
  if (variant === 'prominent') {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Important: LOI ≠ Employment Contract
            </h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>• Hiring is optional. You retain the right to decide not to proceed.</li>
              <li>• The LOI enables AIHQ to proceed with training coordination and grant workflow.</li>
              <li>• Final hiring decision is made after training completion.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'info') {
    return (
      <div
        className={cn(
          'rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 bg-muted/30 p-3',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span>
          LOI enables training coordination. Hiring decisions remain with the employer.
        </span>
      </div>
    </div>
  );
}
