import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, UserX, UserCheck, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StaffFormFields, { StaffFormValues } from '@/components/internal-hub/StaffFormFields';
import ChecklistItemRow from '@/components/internal-hub/ChecklistItemRow';
import ToolAccessRow from '@/components/internal-hub/ToolAccessRow';
import WelcomeEmailStatus from '@/components/internal-hub/WelcomeEmailStatus';
import NotionUnlockBanner from '@/components/internal-hub/NotionUnlockBanner';
import StaffStatusBadge from '@/components/internal-hub/StaffStatusBadge';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import { onboardingRepo } from '@/lib/internal-hub/repos/onboardingRepo';
import { toolAccessRepo } from '@/lib/internal-hub/repos/toolAccessRepo';
import { offboardingRepo } from '@/lib/internal-hub/repos/offboardingRepo';
import { welcomeEmailRepo } from '@/lib/internal-hub/repos/welcomeEmailRepo';
import { hasActivity } from '@/lib/internal-hub/lifecycle';
import { useHub } from '@/lib/internal-hub/HubContext';
import { useToast } from '@/hooks/use-toast';

const AdminStaffDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentStaff } = useHub();
  const viewerIsAdmin = currentStaff?.role === 'Admin';
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  const { data: staff, isLoading } = useQuery({
    queryKey: ['ih-staff', id],
    queryFn: () => staffRepo.get(id),
    enabled: !!id,
  });

  const onboarding = useMemo(() => (staff ? onboardingRepo.get(staff.id) : undefined), [staff?.id, tick]);
  const tools = useMemo(() => (staff ? toolAccessRepo.get(staff.id) : []), [staff?.id, tick]);
  const offboarding = useMemo(() => (staff ? offboardingRepo.get(staff.id) : undefined), [staff?.id, tick]);
  const welcome = useMemo(() => (staff ? welcomeEmailRepo.get(staff.id) : undefined), [staff?.id, tick]);

  const [editValues, setEditValues] = useState<StaffFormValues | null>(null);
  useEffect(() => {
    if (staff) {
      const { id: _id, status: _s, createdAt: _c, updatedAt: _u, ...rest } = staff;
      setEditValues(rest);
    }
  }, [staff]);

  if (isLoading || !staff || !editValues) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Staff not found.</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate('/staff/admin/staff')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </>
        )}
      </div>
    );
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ih-staff', id] });
    queryClient.invalidateQueries({ queryKey: ['ih-staff-list'] });
  };

  const handleSave = async () => {
    try {
      await staffRepo.update(staff.id, editValues);
      toast({ title: 'Profile updated' });
      invalidate();
    } catch (e) {
      toast({ title: 'Update failed', description: String((e as Error).message), variant: 'destructive' });
    }
  };

  const handleDeactivate = async () => {
    try {
      await staffRepo.deactivate(staff.id);
      offboardingRepo.start(staff.id);
      toast({ title: 'Staff deactivated', description: 'Offboarding checklist created.' });
      invalidate();
      bump();
    } catch (e) {
      toast({ title: 'Deactivation failed', description: String((e as Error).message), variant: 'destructive' });
    }
  };

  const handleReactivate = async () => {
    try {
      await staffRepo.reactivate(staff.id);
      toast({ title: 'Staff reactivated' });
      invalidate();
    } catch (e) {
      toast({ title: 'Reactivation failed', description: String((e as Error).message), variant: 'destructive' });
    }
  };

  const activity = hasActivity(staff, { onboarding, tools, offboarding });
  const handleHardDelete = async () => {
    if (activity) return;
    try {
      await staffRepo.hardDelete(staff.id);
      onboardingRepo.remove(staff.id);
      toolAccessRepo.remove(staff.id);
      offboardingRepo.remove(staff.id);
      toast({ title: 'Staff record removed (mistake-only hard delete)' });
      queryClient.invalidateQueries({ queryKey: ['ih-staff-list'] });
      navigate('/staff/admin/staff');
    } catch (e) {
      toast({ title: 'Delete failed', description: String((e as Error).message), variant: 'destructive' });
    }
  };

  const notionTool = tools.find((t) => t.tool === 'Notion');

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/staff/admin/staff')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {staff.status === 'Active' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"><UserX className="h-4 w-4 mr-1" />Deactivate</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate {staff.fullName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Blocks login, hides from active lists, excludes from future payroll, and creates an offboarding checklist.
                    Historical records are preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReactivate}>
              <UserCheck className="h-4 w-4 mr-1" /> Reactivate
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={activity} title={activity ? 'Has activity — deactivate instead' : 'Hard delete (mistake-only)'}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hard delete this record?</AlertDialogTitle>
                <AlertDialogDescription>
                  Allowed only for mistaken records with no activity history. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleHardDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{staff.fullName}</h1>
          <p className="text-sm text-muted-foreground">{staff.jobTitle} · {staff.businessArm} · {staff.email}</p>
        </div>
        <StaffStatusBadge status={staff.status} />
      </header>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="tools">Tool Access</TabsTrigger>
          <TabsTrigger value="offboarding">Offboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile fields</CardTitle></CardHeader>
            <CardContent>
              <StaffFormFields
                values={editValues}
                onChange={(p) => setEditValues((v) => v ? { ...v, ...p } : v)}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSave}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
          <WelcomeEmailStatus event={welcome} staffId={staff.id} onUpdate={bump} />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4 mt-4">
          <NotionUnlockBanner joinDate={staff.joinDate} granted={notionTool?.status === 'Granted'} />
          <Card>
            <CardHeader><CardTitle className="text-base">Onboarding checklist</CardTitle></CardHeader>
            <CardContent>
              {onboarding?.items.map((item) => (
                <ChecklistItemRow
                  key={item.key}
                  item={item}
                  viewerIsAdmin={viewerIsAdmin}
                  onChange={(status) => { onboardingRepo.setItemStatus(staff.id, item.key, status, currentStaff?.fullName); bump(); }}
                  onLinkChange={(link) => { onboardingRepo.setItemLink(staff.id, item.key, link); bump(); }}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company tools access</CardTitle>
              <p className="text-xs text-muted-foreground">No passwords or credentials are stored. Track access state only.</p>
            </CardHeader>
            <CardContent>
              <div className="hidden md:grid md:grid-cols-12 gap-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <div className="md:col-span-3">Tool</div>
                <div className="md:col-span-3">Link</div>
                <div className="md:col-span-2">Owner</div>
                <div className="md:col-span-2">Status</div>
                <div className="md:col-span-2">Note</div>
              </div>
              {tools.map((t) => (
                <ToolAccessRow
                  key={t.tool}
                  item={t}
                  viewerIsAdmin={viewerIsAdmin}
                  onChange={(patch) => { toolAccessRepo.updateItem(staff.id, t.tool, patch); bump(); }}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offboarding" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Offboarding checklist</CardTitle></CardHeader>
            <CardContent>
              {!offboarding ? (
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>No offboarding in progress. Deactivate staff to create the checklist.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { offboardingRepo.start(staff.id); bump(); }}
                  >
                    Start offboarding checklist
                  </Button>
                </div>
              ) : (
                offboarding.items.map((item) => (
                  <ChecklistItemRow
                    key={item.key}
                    item={item}
                    viewerIsAdmin={viewerIsAdmin}
                    onChange={(status) => { offboardingRepo.setItemStatus(staff.id, item.key, status, currentStaff?.fullName); bump(); }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStaffDetail;
