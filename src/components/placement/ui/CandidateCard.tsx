import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CandidateProfile } from '@/lib/placement/types';
import { StatusBadge } from './StatusBadge';
import { AISkillBadge } from './AISkillBadge';

interface CandidateCardProps {
  candidate: CandidateProfile;
  variant?: 'employer' | 'internal';
  linkTo?: string;
  showStatus?: boolean;
}

const availabilityLabels = {
  immediate: 'Available immediately',
  two_weeks: 'Available in 2 weeks',
  one_month: 'Available in 1 month',
  flexible: 'Flexible availability',
};

export function CandidateCard({ 
  candidate, 
  variant = 'employer',
  linkTo,
  showStatus = true
}: CandidateCardProps) {
  const isInternal = variant === 'internal';

  const content = (
    <Card className={cn(
      'transition-all hover:shadow-md',
      linkTo && 'cursor-pointer hover:border-primary/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground">
                {candidate.display_name}
              </h3>
              <AISkillBadge level={candidate.ai_skill_level} />
              {showStatus && <StatusBadge status={candidate.status} size="sm" />}
            </div>

            {/* Headline */}
            <p className="text-sm text-muted-foreground mb-3">
              {candidate.headline}
            </p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mb-3">
              {candidate.key_capabilities.slice(0, isInternal ? 5 : 3).map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
              {candidate.key_capabilities.length > (isInternal ? 5 : 3) && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.key_capabilities.length - (isInternal ? 5 : 3)} more
                </Badge>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {availabilityLabels[candidate.availability]}
              </div>
            </div>

            {/* Salary (employer view) */}
            {!isInternal && candidate.salary_range_display && (
              <p className="text-sm font-medium mt-2">
                {candidate.salary_range_display}
              </p>
            )}

            {/* Public Summary */}
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {candidate.public_summary}
            </p>

            {/* Internal-only section */}
            {isInternal && candidate.internal_summary && (
              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Internal Notes
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {candidate.internal_summary}
                </p>
              </div>
            )}

            {/* Training Status (internal) */}
            {isInternal && candidate.training_status_summary && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Training:</span> {candidate.training_status_summary}
              </p>
            )}

            {/* Tags (internal) */}
            {isInternal && candidate.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {candidate.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
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
