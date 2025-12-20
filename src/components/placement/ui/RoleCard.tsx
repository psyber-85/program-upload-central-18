import { Link } from 'react-router-dom';
import { Clock, AlertCircle, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RoleRequest } from '@/lib/placement/types';
import { StatusBadge } from './StatusBadge';
import { AISkillBadge } from './AISkillBadge';

interface RoleCardProps {
  role: RoleRequest;
  candidateCount?: number;
  nextAction?: string;
  linkTo?: string;
  showCompany?: boolean;
  companyName?: string;
}

const timelineIcons = {
  urgent: AlertCircle,
  normal: Clock,
  flexible: Clock,
};

const timelineColors = {
  urgent: 'text-destructive',
  normal: 'text-muted-foreground',
  flexible: 'text-muted-foreground',
};

export function RoleCard({ 
  role, 
  candidateCount, 
  nextAction, 
  linkTo,
  showCompany,
  companyName 
}: RoleCardProps) {
  const TimelineIcon = timelineIcons[role.timeline];

  const content = (
    <Card className={cn(
      'transition-all hover:shadow-md',
      linkTo && 'cursor-pointer hover:border-primary/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {role.title}
              </h3>
              <StatusBadge status={role.status} size="sm" />
            </div>

            {/* Department & Company */}
            <p className="text-sm text-muted-foreground mb-3">
              {role.department}
              {showCompany && companyName && (
                <span> · {companyName}</span>
              )}
            </p>

            {/* Tags Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <AISkillBadge level={role.ai_skill_level_required} />
              
              <div className={cn('flex items-center gap-1 text-xs', timelineColors[role.timeline])}>
                <TimelineIcon className="h-3 w-3" />
                <span className="capitalize">{role.timeline}</span>
              </div>

              {candidateCount !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{candidateCount} candidate{candidateCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Next Action */}
            {nextAction && (
              <div className="mt-3 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Next step:</span> {nextAction}
                </p>
              </div>
            )}
          </div>

          {/* Arrow */}
          {linkTo && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}
