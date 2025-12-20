import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Clock,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, AISkillBadge, CandidateCardInternal, DecisionCheckpointPanel } from '@/components/placement/ui';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { matchRepo } from '@/lib/placement/repositories/matchRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { noteRepo } from '@/lib/placement/repositories/noteRepo';
import { activityRepo } from '@/lib/placement/repositories/activityRepo';
import { RoleRequest, EmployerCompany, MatchRecord, CandidateProfile, InternalNote, ActivityLog } from '@/lib/placement/types';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  'SCOPING',
  'REVIEWING',
  'MATCHING',
  'INTERVIEWING',
  'LOI_PENDING',
  'PLACED',
  'CANCELLED',
] as const;

export function OpsRoleDetail() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<RoleRequest | null>(null);
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const roleData = await roleRequestRepo.getById(id);
      if (!roleData) {
        setLoading(false);
        return;
      }
      setRole(roleData);

      const [companyData, matchesData, allCandidates, notesData, activityData] = await Promise.all([
        employerRepo.getCompanyById(roleData.company_id),
        matchRepo.getByRoleRequest(id),
        candidateRepo.getAll(),
        noteRepo.getByEntity('role_request', id),
        activityRepo.getByEntity('role_request', id),
      ]);

      setCompany(companyData);
      setMatches(matchesData);
      setCandidates(allCandidates);
      setNotes(notesData);
      setActivities(activityData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !role) return;
    await roleRequestRepo.updateStatus(id, newStatus as RoleRequest['status']);
    setRole({ ...role, status: newStatus as RoleRequest['status'] });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    await noteRepo.create({
      entity_type: 'role_request',
      entity_id: id,
      content: newNote,
      author: 'Ops User',
      internal_only: true,
    });
    const updatedNotes = await noteRepo.getByEntity('role_request', id);
    setNotes(updatedNotes);
    setNewNote('');
  };

  const matchedCandidates = matches.map((match) => {
    const candidate = candidates.find((c) => c.id === match.candidate_id);
    return { match, candidate };
  }).filter((item) => item.candidate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Role request not found</h2>
        <Button asChild>
          <Link to="/ops/roles">Back to Roles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{role.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="secondary">{role.department}</Badge>
            <AISkillBadge level={role.ai_skill_level_required} />
            <Badge variant={role.timeline === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
              {role.timeline}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={role.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
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
          {/* Role Info */}
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Problem Statement</p>
                <p className="text-sm">{role.problem_statement}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{format(new Date(role.created_at), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">{format(new Date(role.updated_at), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Matched Candidates
                </CardTitle>
                <CardDescription>{matchedCandidates.length} candidates proposed</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </CardHeader>
            <CardContent>
              {matchedCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No candidates matched yet</p>
                  <Button className="mt-4">Find Candidates</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {matchedCandidates.map(({ match, candidate }) => (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {candidate!.display_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <Link
                              to={`/ops/candidates/${candidate!.id}`}
                              className="font-medium hover:underline"
                            >
                              {candidate!.display_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{candidate!.headline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <AISkillBadge level={candidate!.ai_skill_level} size="sm" />
                              <Badge variant="secondary" className="text-xs">
                                {candidate!.location}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={match.match_status} />
                          {match.next_action && (
                            <p className="text-xs text-muted-foreground mt-1">{match.next_action}</p>
                          )}
                        </div>
                      </div>
                      {candidate!.internal_summary && (
                        <div className="mt-3 p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                          <strong>Internal:</strong> {candidate!.internal_summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Separator />
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No notes yet</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Card */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Company</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/ops/employers/${company.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Decision Checkpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Decision Checkpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DecisionCheckpointPanel
                checkpoints={{
                  interview: role.status === 'INTERVIEWING' ? 'pending' : 
                             ['LOI_PENDING', 'PLACED'].includes(role.status) ? 'completed' : 'pending',
                  loi: role.status === 'LOI_PENDING' ? 'pending' : 
                       role.status === 'PLACED' ? 'completed' : 'pending',
                  training: role.status === 'PLACED' ? 'completed' : 'pending',
                }}
                compact
              />
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium">
                  {role.status === 'SCOPING' && 'Complete scoping call with employer'}
                  {role.status === 'REVIEWING' && 'Review requirements and finalize spec'}
                  {role.status === 'MATCHING' && 'Find and propose suitable candidates'}
                  {role.status === 'INTERVIEWING' && 'Coordinate interview scheduling'}
                  {role.status === 'LOI_PENDING' && 'Generate and send LOI document'}
                  {role.status === 'PLACED' && 'Role successfully filled'}
                  {role.status === 'CLOSED' && 'Role request was closed'}
                </p>
              </div>
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
