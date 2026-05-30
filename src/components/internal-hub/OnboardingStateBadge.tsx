import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { OnboardingState } from '@/lib/internal-hub/types';

const labels: Record<OnboardingState, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Complete: 'Complete',
};

const OnboardingStateBadge = ({ state }: { state: OnboardingState }) => (
  <Badge variant={state === 'Complete' ? 'default' : 'outline'}>{labels[state]}</Badge>
);

export default OnboardingStateBadge;
