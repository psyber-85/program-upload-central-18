import React, { useState, useEffect } from 'react';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { entriesLocalRepo } from '@/lib/dal/localStorage/EntriesLocalRepo';
import { UserProfile, AppRole, AppSettings } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, Shield, User, Loader2, MoreHorizontal, FileText, Pencil, Mail, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_WELCOME_MESSAGE = `Welcome to The AI HQ team! We're thrilled to have you join us.

As a new team member, you'll have access to our Staff Portal where you can:
• View and manage your payslips
• Submit leave requests and claims
• Access important company documents
• Stay updated with company announcements

Your login credentials have been set up with this email address. Please log in to complete your profile and get started.

If you have any questions during your onboarding, don't hesitate to reach out to your manager or HR.`;

const Settings = () => {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Add staff dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMode, setAddMode] = useState<'existing' | 'onboarding' | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('staff');
  const [newBusinessArm, setNewBusinessArm] = useState<'Training' | 'Solutions'>('Training');
  const [newSalary, setNewSalary] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MESSAGE);
  const [isAdding, setIsAdding] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Edit staff dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<AppRole>('staff');
  const [editBusinessArm, setEditBusinessArm] = useState<'Training' | 'Solutions'>('Training');
  const [editSalary, setEditSalary] = useState('');
  const [editEpfRate, setEditEpfRate] = useState('');
  const [editSocsoRate, setEditSocsoRate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Invoice counter
  const [invoiceCounter, setInvoiceCounter] = useState('');
  const [isSavingCounter, setIsSavingCounter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allStaff, appSettings] = await Promise.all([
        staffLocalRepo.getAllStaff(),
        entriesLocalRepo.getSettings(),
      ]);
      setStaff(allStaff);
      setSettings(appSettings);
      setInvoiceCounter(String(appSettings.invoiceCounter));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (sendWelcomeEmail: boolean) => {
    if (!newName || !newEmail || !newSalary) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const salary = parseFloat(newSalary);
    if (isNaN(salary) || salary <= 0) {
      toast({ title: 'Please enter a valid salary', variant: 'destructive' });
      return;
    }

    setIsAdding(true);
    if (sendWelcomeEmail) setIsSendingEmail(true);
    
    try {
      await staffLocalRepo.addStaff({
        name: newName,
        email: newEmail,
        role: newRole,
        businessArm: newBusinessArm,
        joinDate: format(new Date(), 'yyyy-MM-dd'),
        isActive: true,
        salaryBase: salary,
        epfRate: 11,
        socsoRate: 2,
      });
      
      // Send welcome email if requested
      if (sendWelcomeEmail) {
        try {
          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              recipientEmail: newEmail,
              recipientName: newName,
              customMessage: welcomeMessage,
              loginUrl: window.location.origin + '/login',
            },
          });
          
          if (error) {
            console.error('Failed to send welcome email:', error);
            toast({ 
              title: 'Staff added, but email failed',
              description: 'The staff member was added but the welcome email could not be sent.',
              variant: 'destructive',
            });
          } else {
            toast({ 
              title: 'Staff member onboarded!',
              description: `Welcome email sent to ${newEmail}`,
            });
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          toast({ 
            title: 'Staff added, but email failed',
            variant: 'destructive',
          });
        }
      } else {
        toast({ title: 'Staff member added!' });
      }
      
      setShowAddDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to add staff', variant: 'destructive' });
    } finally {
      setIsAdding(false);
      setIsSendingEmail(false);
    }
  };

  const handleToggleActive = async (staffMember: UserProfile) => {
    try {
      if (staffMember.isActive) {
        await staffLocalRepo.deactivateStaff(staffMember.id);
        toast({ title: `${staffMember.name} deactivated` });
      } else {
        await staffLocalRepo.reactivateStaff(staffMember.id);
        toast({ title: `${staffMember.name} reactivated` });
      }
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update staff', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setAddMode(null);
    setNewName('');
    setNewEmail('');
    setNewRole('staff');
    setNewBusinessArm('Training');
    setNewSalary('');
    setWelcomeMessage(DEFAULT_WELCOME_MESSAGE);
  };

  const openEditDialog = (member: UserProfile) => {
    setEditingStaff(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditBusinessArm(member.businessArm);
    setEditSalary(String(member.salaryBase));
    setEditEpfRate(String(member.epfRate));
    setEditSocsoRate(String(member.socsoRate));
    setShowEditDialog(true);
  };

  const handleEditStaff = async () => {
    if (!editingStaff || !editName || !editEmail || !editSalary) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const salary = parseFloat(editSalary);
    const epf = parseFloat(editEpfRate);
    const socso = parseFloat(editSocsoRate);

    if (isNaN(salary) || salary <= 0) {
      toast({ title: 'Please enter a valid salary', variant: 'destructive' });
      return;
    }

    setIsEditing(true);
    try {
      await staffLocalRepo.updateStaff(editingStaff.id, {
        name: editName,
        email: editEmail,
        role: editRole,
        businessArm: editBusinessArm,
        salaryBase: salary,
        epfRate: isNaN(epf) ? 11 : epf,
        socsoRate: isNaN(socso) ? 2 : socso,
      });
      toast({ title: 'Staff member updated!' });
      setShowEditDialog(false);
      setEditingStaff(null);
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update staff', variant: 'destructive' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleSaveInvoiceCounter = async () => {
    const counter = parseInt(invoiceCounter);
    if (isNaN(counter) || counter < 0) {
      toast({ title: 'Please enter a valid number', variant: 'destructive' });
      return;
    }

    setIsSavingCounter(true);
    try {
      await entriesLocalRepo.updateSettings({ invoiceCounter: counter });
      toast({ title: 'Invoice counter updated!' });
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setIsSavingCounter(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage staff and portal configuration</p>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members
              </CardTitle>
              <CardDescription>Manage staff accounts and permissions</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>Choose how to add a new staff member</DialogDescription>
                </DialogHeader>
                
                {!addMode ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={() => setAddMode('existing')}
                      className="flex flex-col items-center gap-3 p-6 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    >
                      <UserPlus className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">Add Existing Staff</p>
                        <p className="text-xs text-muted-foreground mt-1">Quick add without sending emails</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setAddMode('onboarding')}
                      className="flex flex-col items-center gap-3 p-6 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    >
                      <Mail className="h-8 w-8 text-primary" />
                      <div className="text-center">
                        <p className="font-medium">Onboard New Staff</p>
                        <p className="text-xs text-muted-foreground mt-1">Send welcome email with login info</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setAddMode(null)}
                      className="mb-2"
                    >
                      ← Back
                    </Button>
                    
                    {addMode === 'onboarding' && (
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          A welcome email will be sent upon confirmation
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="john@theaihq.net" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Business Arm</Label>
                        <Select value={newBusinessArm} onValueChange={(v) => setNewBusinessArm(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Training">Training</SelectItem>
                            <SelectItem value="Solutions">Solutions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Salary (RM)</Label>
                      <Input type="number" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} placeholder="5000" />
                    </div>
                    
                    {addMode === 'onboarding' && (
                      <div className="space-y-2">
                        <Label>Welcome Email Message</Label>
                        <Textarea 
                          value={welcomeMessage} 
                          onChange={(e) => setWelcomeMessage(e.target.value)} 
                          rows={8}
                          className="text-sm"
                          placeholder="Customize the welcome message..."
                        />
                        <p className="text-xs text-muted-foreground">
                          This message will be included in the welcome email sent to the new staff member.
                        </p>
                      </div>
                    )}
                    
                    {addMode === 'existing' ? (
                      <Button onClick={() => handleAddStaff(false)} className="w-full" disabled={isAdding}>
                        {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Staff Member
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleAddStaff(false)} 
                          className="flex-1" 
                          disabled={isAdding}
                        >
                          {isAdding && !isSendingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Without Email
                        </Button>
                        <Button 
                          onClick={() => handleAddStaff(true)} 
                          className="flex-1" 
                          disabled={isAdding}
                        >
                          {isSendingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Mail className="h-4 w-4 mr-2" />
                          Add & Send Email
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business Arm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} className={!member.isActive ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.role === 'admin' ? (
                          <Badge variant="default" className="bg-amber-500">
                            <Shield className="h-3 w-3 mr-1" />Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <User className="h-3 w-3 mr-1" />Staff
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline">{member.businessArm}</Badge></TableCell>
                      <TableCell>
                        {member.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">RM {member.salaryBase.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(member)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(member)}>
                              {member.isActive ? 'Deactivate' : 'Reactivate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Staff Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>Update staff details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Arm</Label>
                  <Select value={editBusinessArm} onValueChange={(v) => setEditBusinessArm(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Solutions">Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly Salary (RM)</Label>
                <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EPF Rate (%)</Label>
                  <Input type="number" value={editEpfRate} onChange={(e) => setEditEpfRate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>SOCSO Rate (%)</Label>
                  <Input type="number" value={editSocsoRate} onChange={(e) => setEditSocsoRate(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleEditStaff} className="w-full" disabled={isEditing}>
                {isEditing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Settings Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Settings
            </CardTitle>
            <CardDescription>Configure invoice numbering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 max-w-md">
              <div className="flex-1 space-y-2">
                <Label>Next Invoice Number</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">INV</span>
                  <Input 
                    type="number" 
                    value={invoiceCounter} 
                    onChange={(e) => setInvoiceCounter(e.target.value)}
                    className="w-32"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Next invoice will be: INV{String(parseInt(invoiceCounter) + 1 || 1).padStart(5, '0')}
                </p>
              </div>
              <Button onClick={handleSaveInvoiceCounter} disabled={isSavingCounter}>
                {isSavingCounter && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
