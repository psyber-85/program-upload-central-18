import { useState, useEffect } from 'react';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { companyRepo } from '@/lib/placement/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, UserPlus, Mail, Shield, Trash2 } from 'lucide-react';
import type { EmployerCompany, EmployerUser } from '@/lib/placement/types';

export function EmployerSettings() {
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [users, setUsers] = useState<EmployerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'COMPANY_ADMIN' | 'HIRING_MANAGER'>('HIRING_MANAGER');
  const [inviting, setInviting] = useState(false);

  const isAdmin = session?.role === 'COMPANY_ADMIN';

  useEffect(() => {
    loadData();
  }, [session]);

  async function loadData() {
    if (!session?.companyId) return;
    
    setLoading(true);
    try {
      const [companyData, usersData] = await Promise.all([
        companyRepo.getById(session.companyId),
        companyRepo.getUsers(session.companyId),
      ]);
      setCompany(companyData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    setInviting(true);
    try {
      // Stub - in real app would send invite email
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({ 
        title: 'Invite Sent', 
        description: `Invitation sent to ${inviteEmail} (stub)` 
      });
      setInviteEmail('');
      setInviteOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send invite', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveUser(userId: string) {
    // Stub - in real app would remove user
    toast({ title: 'User Removed', description: 'User access revoked (stub)' });
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and team access</p>
      </div>

      {/* Company Profile - Read Only */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Company information (read-only)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {company ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Company Name</Label>
                <p className="font-medium">{company.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Industry</Label>
                <p className="font-medium">{company.industry}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Size</Label>
                <p className="font-medium">{company.size}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Location</Label>
                <p className="font-medium">{company.location}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Company information not available</p>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>People with access to this employer portal</CardDescription>
              </div>
            </div>
            {isAdmin && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your company's employer portal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={(v: 'COMPANY_ADMIN' | 'HIRING_MANAGER') => setInviteRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIRING_MANAGER">Hiring Manager (Viewer)</SelectItem>
                          <SelectItem value="COMPANY_ADMIN">Company Admin (Full Access)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {inviteRole === 'COMPANY_ADMIN' 
                          ? 'Can manage roles, upload LOI, and invite users'
                          : 'Can view roles and provide interview feedback'}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={inviting}>
                      {inviting ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {user.name}
                      {user.id === session?.userId && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.role === 'COMPANY_ADMIN' ? 'default' : 'outline'}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role === 'COMPANY_ADMIN' ? 'Admin' : 'Hiring Manager'}
                  </Badge>
                  {isAdmin && user.id !== session?.userId && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium mb-2">Company Admin</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create and manage roles</li>
                <li>• Upload and manage LOI</li>
                <li>• Invite and remove team members</li>
                <li>• Full access to all features</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium mb-2">Hiring Manager</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View roles and candidates</li>
                <li>• Provide interview feedback</li>
                <li>• Approve/reject candidates</li>
                <li>• Read-only access to LOI status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
