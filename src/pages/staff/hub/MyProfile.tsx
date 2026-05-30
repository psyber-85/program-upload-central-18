import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHub } from '@/lib/internal-hub/HubContext';
import StaffStatusBadge from '@/components/internal-hub/StaffStatusBadge';

// Doc 0.1 §18 — read-only, never shows salary/EPF/SOCSO/admin notes.
const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-border last:border-0">
    <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="col-span-2 text-sm text-foreground">{value || '—'}</span>
  </div>
);

const MyProfile = () => {
  const { currentStaff } = useHub();
  if (!currentStaff) return null;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only orientation view. Ask Admin if anything needs changing.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basic information</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Full name" value={currentStaff.fullName} />
          <Row label="Email" value={currentStaff.email} />
          <Row label="Job title" value={currentStaff.jobTitle} />
          <Row label="Business arm" value={currentStaff.businessArm} />
          <Row label="Join date" value={new Date(currentStaff.joinDate).toLocaleDateString()} />
          <Row label="Status" value={<StaffStatusBadge status={currentStaff.status} />} />
          <Row label="Insurance covered" value={currentStaff.insuranceCovered ? 'Yes' : 'No'} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;
