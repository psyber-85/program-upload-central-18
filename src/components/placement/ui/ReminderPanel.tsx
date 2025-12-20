import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Task } from '@/lib/placement/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ReminderPanelProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  maxItems?: number;
}

export function ReminderPanel({ tasks, onComplete, maxItems = 5 }: ReminderPanelProps) {
  const today = startOfDay(new Date());
  const displayTasks = tasks.slice(0, maxItems);

  const getTaskStatus = (task: Task) => {
    const dueDate = new Date(task.due_date);
    if (task.status === 'completed') return 'completed';
    if (isBefore(dueDate, today)) return 'overdue';
    return 'pending';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTasks.map((task) => {
        const status = getTaskStatus(task);
        const isOverdue = status === 'overdue';
        const isCompleted = status === 'completed';

        return (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border',
              isOverdue && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
              isCompleted && 'opacity-60',
              !isOverdue && !isCompleted && 'bg-card'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isOverdue ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                isCompleted && 'line-through'
              )}>
                {task.title}
              </p>
              <p className={cn(
                'text-xs',
                isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
              )}>
                Due {format(new Date(task.due_date), 'MMM d, yyyy')}
              </p>
            </div>
            {onComplete && !isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComplete(task.id)}
                className="flex-shrink-0"
              >
                Done
              </Button>
            )}
          </div>
        );
      })}
      
      {tasks.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          +{tasks.length - maxItems} more tasks
        </p>
      )}
    </div>
  );
}
