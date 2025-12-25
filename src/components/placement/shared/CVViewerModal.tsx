import { FileText, Download, ExternalLink, User, Briefcase, GraduationCap, Award, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CandidateProfile } from '@/lib/placement/types';

interface CVViewerModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Partial<CandidateProfile> | null;
  isEmployerView?: boolean; // If true, shows redacted version
}

const availabilityLabels = {
  IMMEDIATE: 'Immediate',
  TWO_WEEKS: '2 Weeks Notice',
  ONE_MONTH: '1 Month Notice',
  LONGER: '1+ Month Notice',
};

export function CVViewerModal({ open, onClose, candidate, isEmployerView = true }: CVViewerModalProps) {
  if (!candidate) return null;

  const cvUrl = isEmployerView ? candidate.cvEmployerSafeUrl : candidate.cvUrl;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>{isEmployerView ? candidate.displayName : candidate.fullName}</span>
              {candidate.currentRole && (
                <p className="text-sm font-normal text-muted-foreground">{candidate.currentRole}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{candidate.yearsExperience || 0}</p>
              <p className="text-xs text-muted-foreground">Years Exp</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{candidate.skills?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Skills</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">{candidate.availability ? availabilityLabels[candidate.availability] : 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Availability</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">
                {candidate.expectedSalary ? `$${candidate.expectedSalary.toLocaleString()}` : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Expected</p>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          {candidate.summary && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Summary
              </h4>
              <p className="text-sm text-muted-foreground">{candidate.summary}</p>
            </div>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </h4>
              <p className="text-sm text-muted-foreground">{candidate.education}</p>
            </div>
          )}

          {/* Certifications */}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.certifications.map((cert, i) => (
                  <Badge key={i} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Work Preferences
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {candidate.preferredLocations && (
                <div>
                  <p className="text-muted-foreground">Locations</p>
                  <p>{candidate.preferredLocations.join(', ')}</p>
                </div>
              )}
              {candidate.preferredWorkArrangements && (
                <div>
                  <p className="text-muted-foreground">Work Arrangement</p>
                  <p>{candidate.preferredWorkArrangements.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Programme Info */}
          {candidate.programmeName && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">AIHQ Programme Graduate</p>
              <p className="text-sm text-muted-foreground">{candidate.programmeName}</p>
            </div>
          )}

          <Separator />

          {/* CV Download */}
          <div className="flex justify-end gap-2">
            {cvUrl ? (
              <>
                <Button variant="outline" asChild>
                  <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open CV
                  </a>
                </Button>
                <Button asChild>
                  <a href={cvUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download CV
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">CV not available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
