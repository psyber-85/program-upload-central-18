import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Calendar, CheckCircle, Clock, Award, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { programmeRepo, selectionRepo, roleRepo, candidateRepo } from '@/lib/placement/client';
import type { ProgrammeTracker, SelectionRecord, RoleOpening, CandidateProfile, TrainingMilestone } from '@/lib/placement/types';

export function RoleTraining() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleOpening | null>(null);
  const [selection, setSelection] = useState<SelectionRecord | null>(null);
  const [programme, setProgramme] = useState<ProgrammeTracker | null>(null);
  const [candidate, setCandidate] = useState<Partial<CandidateProfile> | null>(null);

  useEffect(() => {
    if (roleId) loadData();
  }, [roleId]);

  async function loadData() {
    setLoading(true);
    try {
      const roleData = await roleRepo.getById(roleId!);
      if (!roleData) {
        toast({ title: 'Error', description: 'Role not found', variant: 'destructive' });
        navigate('/employer/roles');
        return;
      }
      setRole(roleData);

      const selectionData = await selectionRepo.getByRoleId(roleId!);
      if (selectionData) {
        setSelection(selectionData);
        
        const programmeData = await programmeRepo.getBySelectionId(selectionData.id);
        setProgramme(programmeData);

        const candidateData = await candidateRepo.getEmployerSafeView(selectionData.candidateId);
        setCandidate(candidateData);
      }
    } catch (error) {
      console.error('Failed to load training data:', error);
      toast({ title: 'Error', description: 'Failed to load training data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function toggleMilestone(milestoneId: string) {
    if (!programme) return;
    
    const updatedMilestones = programme.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          completedAt: m.completedAt ? undefined : new Date().toISOString()
        };
      }
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.completedAt).length;
    const completionPercentage = Math.round((completedCount / updatedMilestones.length) * 100);
    const trainingStatus = completionPercentage === 100 ? 'COMPLETED' : completionPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    try {
      await programmeRepo.update(programme.id, {
        milestones: updatedMilestones,
        completionPercentage,
        trainingStatus,
      });
      setProgramme({ ...programme, milestones: updatedMilestones, completionPercentage, trainingStatus });
      toast({ title: 'Progress updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update milestone', variant: 'destructive' });
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
    );
  }

  if (!role || !selection) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Training Programme</h3>
            <p className="text-muted-foreground mb-4">
              Training tracking will be available once a candidate is selected and placed
            </p>
            <Button variant="outline" onClick={() => navigate(`/employer/roles/${roleId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Role
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    NOT_STARTED: 'bg-muted text-muted-foreground',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/employer/roles/${roleId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Programme</h1>
          <p className="text-muted-foreground">{role.title}</p>
        </div>
      </div>

      {/* Candidate & Selection Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selected Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{selection.candidateName}</p>
                <p className="text-sm text-muted-foreground">
                  Selected on {new Date(selection.selectedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selection.startDate && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Start Date: {new Date(selection.startDate).toLocaleDateString()}
              </div>
            )}
            {selection.offeredSalary && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                Offered: ${selection.offeredSalary.toLocaleString()}/month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Placement Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Placement Confirmed</span>
                <Badge variant={selection.placementConfirmed ? 'default' : 'outline'}>
                  {selection.placementConfirmed ? 'Yes' : 'Pending'}
                </Badge>
              </div>
              {selection.placementConfirmedAt && (
                <p className="text-sm text-muted-foreground">
                  Confirmed on {new Date(selection.placementConfirmedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programme Details */}
      {programme ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {programme.programmeName}
                  </CardTitle>
                  {programme.programmeDescription && (
                    <CardDescription className="mt-1">{programme.programmeDescription}</CardDescription>
                  )}
                </div>
                <Badge className={statusColors[programme.trainingStatus]}>
                  {programme.trainingStatus.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">{programme.completionPercentage}%</span>
                  </div>
                  <Progress value={programme.completionPercentage} className="h-3" />
                </div>

                {/* Dates */}
                <div className="flex gap-6 text-sm">
                  {programme.startDate && (
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{new Date(programme.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {programme.endDate && (
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{new Date(programme.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Grant Info */}
                {programme.grantApplied && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">Grant Support</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {programme.grantStatus || 'Applied'}
                        </p>
                      </div>
                      {programme.grantAmount && (
                        <p className="font-semibold text-primary">
                          ${programme.grantAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Training Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {programme.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No milestones defined</p>
              ) : (
                <div className="space-y-3">
                  {programme.milestones.map((milestone, index) => (
                    <MilestoneRow
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                      onToggle={() => toggleMilestone(milestone.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Programme Not Started</h3>
            <p className="text-muted-foreground">
              AIHQ will set up the training programme shortly
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MilestoneRowProps {
  milestone: TrainingMilestone;
  index: number;
  onToggle: () => void;
}

function MilestoneRow({ milestone, index, onToggle }: MilestoneRowProps) {
  const isCompleted = !!milestone.completedAt;
  const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && !isCompleted;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900' : isOverdue ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900' : 'bg-card'}`}>
      <Checkbox 
        checked={isCompleted} 
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
          <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {milestone.name}
          </p>
        </div>
        {milestone.description && (
          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs">
          {milestone.dueDate && (
            <span className={isOverdue ? 'text-red-600' : 'text-muted-foreground'}>
              <Calendar className="h-3 w-3 inline mr-1" />
              Due: {new Date(milestone.dueDate).toLocaleDateString()}
            </span>
          )}
          {milestone.completedAt && (
            <span className="text-green-600">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Completed: {new Date(milestone.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
