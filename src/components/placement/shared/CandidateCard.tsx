import { User, Star, Briefcase, MapPin, Clock, FileText, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { CandidateProfile, CandidateSubmission } from '@/lib/placement/types';

interface CandidateCardProps {
  candidate?: Partial<CandidateProfile>;
  submission?: CandidateSubmission;
  showDetails?: boolean;
  showActions?: boolean;
  onViewCV?: () => void;
  onViewProfile?: () => void;
  onClick?: () => void;
}

const availabilityLabels = {
  IMMEDIATE: 'Immediate',
  TWO_WEEKS: '2 Weeks',
  ONE_MONTH: '1 Month',
  LONGER: '1+ Month',
};

export function CandidateCard({ 
  candidate, 
  submission,
  showDetails = false,
  showActions = false,
  onViewCV,
  onViewProfile,
  onClick
}: CandidateCardProps) {
  const displayName = submission?.candidateDisplayName || candidate?.displayName || 'Unknown';
  
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name & Stage */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold">{displayName}</h4>
              {submission && (
                <StatusBadge type="stage" value={submission.stage} />
              )}
            </div>

            {/* Role info from submission */}
            {submission && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {submission.roleName} • {submission.companyName}
              </p>
            )}

            {/* Candidate details */}
            {candidate && showDetails && (
              <div className="mt-2 space-y-1">
                {candidate.currentRole && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span>{candidate.currentRole}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {candidate.yearsExperience !== undefined && (
                    <span>{candidate.yearsExperience} yrs exp</span>
                  )}
                  {candidate.availability && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {availabilityLabels[candidate.availability]}
                    </span>
                  )}
                  {candidate.expectedSalary && (
                    <span>${candidate.expectedSalary.toLocaleString()}/mo</span>
                  )}
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submission details */}
            {submission && showDetails && (
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {submission.interviewScheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Interview: {new Date(submission.interviewScheduledAt).toLocaleDateString()}</span>
                  </div>
                )}
                {submission.employerRating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < submission.employerRating! ? 'text-amber-500 fill-amber-500' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                )}
                {submission.employerNotes && (
                  <p className="text-xs italic line-clamp-2">"{submission.employerNotes}"</p>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 mt-3">
                {onViewCV && (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewCV(); }}>
                    <FileText className="h-3 w-3 mr-1" />
                    View CV
                  </Button>
                )}
                {onViewProfile && (
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onViewProfile(); }}>
                    View Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
