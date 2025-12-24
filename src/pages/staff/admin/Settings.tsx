import React, { useState, useEffect } from 'react';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { UserProfile, AppRole } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings as SettingsIcon, Users, Shield, User, Loader2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const Settings = () => {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add staff dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('staff');
  const [newBusinessArm, setNewBusinessArm] = useState<'Training' | 'Solutions'>('Training');
  const [newSalary, setNewSalary] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const allStaff = await staffLocalRepo.getAllStaff();
      setStaff(allStaff);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async () => {
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
      toast({ title: 'Staff member added!' });
      setShowAddDialog(false);
      resetForm();
      loadStaff();
    } catch (error) {
      toast({ title: 'Failed to add staff', variant: 'destructive' });
    } finally {
      setIsAdding(false);
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
      loadStaff();
    } catch (error) {
      toast({ title: 'Failed to update staff', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('staff');
    setNewBusinessArm('Training');
    setNewSalary('');
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>Create a new staff account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
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
                  <Button onClick={handleAddStaff} className="w-full" disabled={isAdding}>
                    {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Staff Member
                  </Button>
                </div>
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
      </div>
    </div>
  );
};

export default Settings;
