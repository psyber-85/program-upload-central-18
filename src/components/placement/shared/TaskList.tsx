import { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { TaskItem, TaskPriority, TaskStatus } from '@/lib/placement/types';

interface TaskListProps {
  tasks: TaskItem[];
  onToggleComplete?: (taskId: string) => void;
  onTaskClick?: (task: TaskItem) => void;
  showCreateButton?: boolean;
  onCreateTask?: () => void;
  compact?: boolean;
  title?: string;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string; icon: React.ElementType }> = {
  LOW: { label: 'Low', className: 'text-muted-foreground', icon: Circle },
  MEDIUM: { label: 'Medium', className: 'text-blue-600', icon: Circle },
  HIGH: { label: 'High', className: 'text-amber-600', icon: AlertTriangle },
  URGENT: { label: 'Urgent', className: 'text-red-600', icon: AlertTriangle },
};

export function TaskList({ 
  tasks, 
  onToggleComplete, 
  onTaskClick, 
  showCreateButton = false,
  onCreateTask,
  compact = false,
  title = 'Tasks'
}: TaskListProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  const sortedPending = [...pendingTasks].sort((a, b) => {
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {showCreateButton && onCreateTask && (
            <Button size="sm" variant="ghost" onClick={onCreateTask}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedPending.length === 0 && completedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
        ) : (
          <>
            {sortedPending.map((task) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                compact={compact}
                onToggle={() => onToggleComplete?.(task.id)}
                onClick={() => onTaskClick?.(task)}
              />
            ))}

            {!compact && completedTasks.length > 0 && (
              <div className="pt-2 mt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Completed ({completedTasks.length})
                </p>
                {completedTasks.slice(0, 3).map((task) => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    compact
                    onToggle={() => onToggleComplete?.(task.id)}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskRowProps {
  task: TaskItem;
  compact?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

function TaskRow({ task, compact, onToggle, onClick }: TaskRowProps) {
  const isCompleted = task.status === 'COMPLETED';
  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div 
      className={`flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <Checkbox 
        checked={isCompleted}
        onCheckedChange={() => onToggle?.()}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        
        {!compact && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.priority !== 'LOW' && (
              <Badge variant="outline" className={`text-xs ${priority.className}`}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priority.label}
              </Badge>
            )}
            
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}

            {task.assignedToName && (
              <span className="text-xs text-muted-foreground">
                → {task.assignedToName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
