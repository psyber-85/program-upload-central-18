import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import { onboardingRepo } from '@/lib/internal-hub/repos/onboardingRepo';
import { deriveOnboardingState } from '@/lib/internal-hub/lifecycle';
import StaffStatusBadge from '@/components/internal-hub/StaffStatusBadge';
import OnboardingStateBadge from '@/components/internal-hub/OnboardingStateBadge';

const AdminStaffList = () => {
  const [tick] = useState(0);
  const all = useMemo(() => staffRepo.list(), [tick]);
  const active = all.filter((s) => s.status === 'Active');
  const inactive = all.filter((s) => s.status === 'Inactive');

  const renderRows = (rows: typeof all) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="hidden md:table-cell">Job title</TableHead>
          <TableHead className="hidden md:table-cell">Business arm</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Onboarding</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((s) => {
          const state = deriveOnboardingState(onboardingRepo.get(s.id));
          return (
            <TableRow key={s.id} className="cursor-pointer">
              <TableCell>
                <Link to={`/staff/admin/staff/${s.id}`} className="text-primary hover:underline">
                  {s.fullName}
                </Link>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </TableCell>
              <TableCell>{s.role}</TableCell>
              <TableCell className="hidden md:table-cell">{s.jobTitle}</TableCell>
              <TableCell className="hidden md:table-cell">{s.businessArm}</TableCell>
              <TableCell><StaffStatusBadge status={s.status} /></TableCell>
              <TableCell><OnboardingStateBadge state={state} /></TableCell>
            </TableRow>
          );
        })}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
              No staff in this view.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage staff lifecycle, access, and offboarding.</p>
        </div>
        <Button asChild>
          <Link to="/staff/admin/staff/new"><Plus className="h-4 w-4 mr-1" /> Add staff</Link>
        </Button>
      </header>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactive.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-3">{renderRows(active)}</TabsContent>
            <TabsContent value="inactive" className="mt-3">{renderRows(inactive)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStaffList;
