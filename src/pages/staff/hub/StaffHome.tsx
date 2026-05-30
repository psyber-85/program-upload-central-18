import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHub } from '@/lib/internal-hub/HubContext';
import { onboardingRepo } from '@/lib/internal-hub/repos/onboardingRepo';
import { checklistProgress, deriveOnboardingState } from '@/lib/internal-hub/lifecycle';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import NotionUnlockBanner from '@/components/internal-hub/NotionUnlockBanner';
import OnboardingStateBadge from '@/components/internal-hub/OnboardingStateBadge';
import StaffStatusBadge from '@/components/internal-hub/StaffStatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StaffHome = () => {
  const { currentStaff, impersonate, impersonatedId } = useHub();
  const [tick, setTick] = useState(0);

  const all = useMemo(() => staffRepo.list(), [tick]);
  const onboarding = useMemo(
    () => (currentStaff ? onboardingRepo.get(currentStaff.id) : undefined),
    [currentStaff?.id, tick],
  );

  if (!currentStaff) return null;
  const progress = onboarding ? checklistProgress(onboarding.items) : { done: 0, total: 0 };
  const state = deriveOnboardingState(onboarding);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome, {currentStaff.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStaff.jobTitle} · {currentStaff.businessArm}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StaffStatusBadge status={currentStaff.status} />
          <OnboardingStateBadge state={state} />
        </div>
      </header>

      {/* Dev impersonation switcher — Doc 0.1 §19 explicitly allows clearly dev-only switcher */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 p-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Dev: view as</span>
          <Select
            value={impersonatedId ?? currentStaff.id}
            onValueChange={(v) => { impersonate(v); setTick((t) => t + 1); }}
          >
            <SelectTrigger className="h-8 max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {all.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.fullName} — {s.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">
              {progress.done}<span className="text-base text-muted-foreground"> / {progress.total}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>
        <NotionUnlockBanner joinDate={currentStaff.joinDate} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your starter tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {onboarding?.items
            .filter((i) => i.owner === 'staff')
            .map((i) => (
              <div key={i.key} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-foreground">{i.label}</span>
                <span className="text-xs text-muted-foreground capitalize">{i.status.replace('-', ' ')}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      {canAccessAdminArea(currentStaff) && (
        <div>
          <Button asChild>
            <Link to="/staff/admin/staff">Go to Staff Management</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default StaffHome;
