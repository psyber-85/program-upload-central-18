import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISkillBadge } from './AISkillBadge';
import { cn } from '@/lib/utils';
import { CandidateProfile } from '@/lib/placement/types';

interface CandidateCardEmployerProps {
  candidate: CandidateProfile;
  linkTo?: string;
  onRequestInterview?: () => void;
  className?: string;
}

const availabilityLabels = {
  immediate: 'Available now',
  two_weeks: '2 weeks',
  one_month: '1 month',
  flexible: 'Flexible',
};

/**
 * Employer-facing candidate card - NO contact details exposed
 * Shows only AIHQ-curated information
 */
export function CandidateCardEmployer({
  candidate,
  linkTo,
  onRequestInterview,
  className,
}: CandidateCardEmployerProps) {
  const content = (
    <Card className={cn('transition-colors', linkTo && 'hover:bg-muted/50 cursor-pointer', className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header - Name & Skill Level */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {candidate.display_name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{candidate.display_name}</h3>
                  <AISkillBadge level={candidate.ai_skill_level} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{candidate.headline}</p>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {candidate.public_summary}
            </p>

            {/* Key Capabilities */}
            <div className="flex flex-wrap gap-1.5">
              {candidate.key_capabilities.slice(0, 4).map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
              {candidate.key_capabilities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.key_capabilities.length - 4} more
                </Badge>
              )}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{candidate.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{availabilityLabels[candidate.availability]}</span>
              </div>
              {candidate.placement_readiness && (
                <Badge variant="default" className="bg-green-600 text-xs">
                  Placement Ready
                </Badge>
              )}
            </div>

            {/* Training Status */}
            {candidate.training_status_summary && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
                {candidate.training_status_summary}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2">
            {onRequestInterview && (
              <Button size="sm" onClick={(e) => { e.preventDefault(); onRequestInterview(); }}>
                Request Interview
              </Button>
            )}
            {linkTo && (
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                View Profile
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* AIHQ Coordination Notice */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            AIHQ coordinates all interviews and communication with candidates.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}
