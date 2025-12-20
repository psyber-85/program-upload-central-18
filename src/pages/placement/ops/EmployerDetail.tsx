import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  FileText, 
  Mail, 
  Phone,
  Plus,
  Edit,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge, RoleCard, RiskFlagBadge, LOICallout } from '@/components/placement/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BypassRiskLevel } from '@/lib/placement/types';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { noteRepo } from '@/lib/placement/repositories/noteRepo';
import { activityRepo } from '@/lib/placement/repositories/activityRepo';
import { EmployerCompany, EmployerUser, RoleRequest, InternalNote, ActivityLog } from '@/lib/placement/types';
import { format } from 'date-fns';

export function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [users, setUsers] = useState<EmployerUser[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [riskFlag, setRiskFlag] = useState<BypassRiskLevel>('low');

  useEffect(() => {
    if (company?.risk_flag) {
      setRiskFlag(company.risk_flag);
    }
  }, [company]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const [companyData, usersData, rolesData, notesData, activityData] = await Promise.all([
        employerRepo.getCompanyById(id),
        employerRepo.getUsersByCompany(id),
        roleRequestRepo.getByCompany(id),
        noteRepo.getByEntity('company', id),
        activityRepo.getByEntity('company', id),
      ]);
      setCompany(companyData);
      setUsers(usersData);
      setRoleRequests(rolesData);
      setNotes(notesData);
      setActivities(activityData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    await noteRepo.create({
      entity_type: 'company',
      entity_id: id,
      content: newNote,
      author: 'Ops User',
      internal_only: true,
    });
    const updatedNotes = await noteRepo.getByEntity('company', id);
    setNotes(updatedNotes);
    setNewNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Company not found</h2>
        <Button asChild>
          <Link to="/ops/employers">Back to Employers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary">{company.industry}</Badge>
              <span className="text-sm text-muted-foreground capitalize">{company.size_band}</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {company.location}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role Request
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Value Lock Messaging */}
          <LOICallout variant="info" className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              AIHQ coordinates interviews and training workflow. Training and grant coordination are provided through the AIHQ programme flow.
            </p>
          </LOICallout>

          {/* Internal Bypass Risk Flag */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                Bypass Risk Assessment (Internal)
              </CardTitle>
              <CardDescription>Track potential programme bypass indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Current Risk Level</p>
                  <Select value={riskFlag} onValueChange={(v) => setRiskFlag(v as BypassRiskLevel)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <RiskFlagBadge level={riskFlag} showLabel />
              </div>
              <p className="text-xs text-muted-foreground">
                Flag if employer repeatedly requests contact details or tries to skip programme steps.
              </p>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{company.notes}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Registered</p>
                  <p className="text-sm">{format(new Date(company.created_at), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">{format(new Date(company.updated_at), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Role Requests</CardTitle>
                <CardDescription>{roleRequests.length} total requests</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {roleRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No role requests yet</p>
              ) : (
                <div className="space-y-4">
                  {roleRequests.map((role) => (
                    <Link
                      key={role.id}
                      to={`/ops/roles/${role.id}`}
                      className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{role.title}</p>
                          <p className="text-sm text-muted-foreground">{role.department}</p>
                        </div>
                        <StatusBadge status={role.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {role.problem_statement}
                      </p>
                    </Link>
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
              <CardDescription>Private notes visible only to ops team</CardDescription>
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
                <div className="space-y-4">
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
          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Contacts</CardTitle>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No contacts</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role.replace('employer_', '')}
                        </p>
                        <div className="flex flex-col gap-1 mt-1">
                          <a
                            href={`mailto:${user.email}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </a>
                          {user.phone && (
                            <a
                              href={`tel:${user.phone}`}
                              className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
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
