import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Plus,
  Edit,
  Clock,
  GitMerge,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, AISkillBadge, StepTimeline } from '@/components/placement/ui';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { trainingRepo } from '@/lib/placement/repositories/trainingRepo';
import { noteRepo } from '@/lib/placement/repositories/noteRepo';
import { activityRepo } from '@/lib/placement/repositories/activityRepo';
import { CandidateProfile, MatchRecord, RoleRequest, TrainingEnrollment, TrainingProgram, InternalNote, ActivityLog } from '@/lib/placement/types';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  'NEW_INTAKE',
  'TRAINING_IN_PROGRESS',
  'PLACEMENT_READY',
  'PROPOSED_TO_EMPLOYER',
  'INTERVIEWING',
  'LOI_SIGNED',
  'PLACED',
] as const;

export function OpsCandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const candidateData = await candidateRepo.getById(id);
      if (!candidateData) {
        setLoading(false);
        return;
      }
      setCandidate(candidateData);

      const [matchesData, rolesData, enrollmentsData, programsData, notesData, activityData] = await Promise.all([
        matchRepo.getByCandidate(id),
        roleRequestRepo.getAll(),
        trainingRepo.getEnrollmentsByCandidate(id),
        trainingRepo.getPrograms(),
        noteRepo.getByEntity('candidate', id),
        activityRepo.getByEntity('candidate', id),
      ]);

      setMatches(matchesData);
      setRoleRequests(rolesData);
      setEnrollments(enrollmentsData);
      setPrograms(programsData);
      setNotes(notesData);
      setActivities(activityData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !candidate) return;
    await candidateRepo.updateStatus(id, newStatus as CandidateProfile['status']);
    setCandidate({ ...candidate, status: newStatus as CandidateProfile['status'] });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    await noteRepo.create({
      entity_type: 'candidate',
      entity_id: id,
      content: newNote,
      author: 'Ops User',
      internal_only: true,
    });
    const updatedNotes = await noteRepo.getByEntity('candidate', id);
    setNotes(updatedNotes);
    setNewNote('');
  };

  const getProgram = (programId: string) => programs.find((p) => p.id === programId);
  const getRole = (roleId: string) => roleRequests.find((r) => r.id === roleId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Candidate not found</h2>
        <Button asChild>
          <Link to="/ops/candidates">Back to Candidates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {candidate.display_name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{candidate.display_name}</h1>
            <p className="text-muted-foreground">{candidate.headline}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <AISkillBadge level={candidate.ai_skill_level} />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {candidate.location}
              </div>
              {candidate.salary_range_display && (
                <Badge variant="secondary">{candidate.salary_range_display}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={candidate.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.public_summary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Public Summary</p>
                  <p className="text-sm">{candidate.public_summary}</p>
                </div>
              )}
              {candidate.key_capabilities && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Key Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.key_capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes (Ops Only) */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <MessageSquare className="h-5 w-5" />
                Internal Notes
              </CardTitle>
              <CardDescription>Visible only to ops team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.internal_summary && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium mb-1">Internal Summary</p>
                  <p className="text-sm">{candidate.internal_summary}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
              {notes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.author} · {format(new Date(note.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Training History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Training History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No training history</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => {
                    const program = getProgram(enrollment.program_id);
                    return (
                      <div key={enrollment.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-medium">{program?.name || 'Unknown Program'}</p>
                            <p className="text-sm text-muted-foreground">
                              Started {format(new Date(enrollment.start_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <StatusBadge status={enrollment.status} />
                        </div>
                        {enrollment.status === 'IN_PROGRESS' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{enrollment.progress_percent}%</span>
                            </div>
                            <Progress value={enrollment.progress_percent} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitMerge className="h-5 w-5" />
                  Role Matches
                </CardTitle>
                <CardDescription>{matches.length} active matches</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add to Role
              </Button>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Not matched to any roles</p>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => {
                    const role = getRole(match.role_request_id);
                    return (
                      <Link
                        key={match.id}
                        to={`/ops/roles/${match.role_request_id}`}
                        className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{role?.title || 'Unknown Role'}</p>
                            <p className="text-sm text-muted-foreground">{role?.department}</p>
                          </div>
                          <StatusBadge status={match.match_status} />
                        </div>
                        {match.next_action && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Next: {match.next_action}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Availability</p>
                <p className="text-sm capitalize">{candidate.availability?.replace('_', ' ') || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Placement Ready</p>
                <Badge variant={candidate.placement_readiness ? 'default' : 'secondary'}>
                  {candidate.placement_readiness ? 'Yes' : 'No'}
                </Badge>
              </div>
              {candidate.training_status_summary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Training Status</p>
                  <p className="text-sm">{candidate.training_status_summary}</p>
                </div>
              )}
              {candidate.tags && candidate.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <GitMerge className="mr-2 h-4 w-4" />
                Add to Role
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Enroll in Training
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
