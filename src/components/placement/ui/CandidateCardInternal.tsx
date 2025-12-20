import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISkillBadge } from './AISkillBadge';
import { RiskFlagBadge } from './RiskFlagBadge';
import { cn } from '@/lib/utils';
import { CandidateProfile, BypassRiskLevel } from '@/lib/placement/types';

interface CandidateCardInternalProps {
  candidate: CandidateProfile;
  linkTo?: string;
  bypassRisk?: BypassRiskLevel;
  showInternalNotes?: boolean;
  className?: string;
}

const availabilityLabels = {
  immediate: 'Available now',
  two_weeks: '2 weeks',
  one_month: '1 month',
  flexible: 'Flexible',
};

/**
 * Internal ops-facing candidate card - includes all internal data
 * Shows internal summary, bypass risk, and briefing status
 */
export function CandidateCardInternal({
  candidate,
  linkTo,
  bypassRisk,
  showInternalNotes = true,
  className,
}: CandidateCardInternalProps) {
  const content = (
    <Card className={cn('transition-colors', linkTo && 'hover:bg-muted/50 cursor-pointer', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {candidate.display_name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{candidate.display_name}</h3>
                  <AISkillBadge level={candidate.ai_skill_level} size="sm" />
                  {bypassRisk && <RiskFlagBadge level={bypassRisk} />}
                </div>
                <p className="text-sm text-muted-foreground">{candidate.headline}</p>
              </div>
            </div>
            {linkTo && (
              <Button size="sm" variant="ghost" asChild>
                <Link to={linkTo}>
                  View
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          {/* Internal Status Indicators */}
          <div className="flex flex-wrap gap-2">
            {candidate.is_briefed_on_program ? (
              <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Briefed on Programme
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Yet Briefed
              </Badge>
            )}
            {candidate.placement_readiness && (
              <Badge variant="default" className="bg-green-600 text-xs">
                Placement Ready
              </Badge>
            )}
          </div>

          {/* Key Capabilities */}
          <div className="flex flex-wrap gap-1.5">
            {candidate.key_capabilities.slice(0, 5).map((cap) => (
              <Badge key={cap} variant="secondary" className="text-xs">
                {cap}
              </Badge>
            ))}
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
            {candidate.salary_range_display && (
              <span>{candidate.salary_range_display}</span>
            )}
          </div>

          {/* Internal Summary */}
          {showInternalNotes && candidate.internal_summary && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                Internal Notes
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {candidate.internal_summary}
              </p>
            </div>
          )}

          {/* Training Status */}
          {candidate.training_status_summary && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
              {candidate.training_status_summary}
            </p>
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
