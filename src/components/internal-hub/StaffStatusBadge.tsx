import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { StaffStatus } from '@/lib/internal-hub/types';

const StaffStatusBadge = ({ status }: { status: StaffStatus }) => (
  <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
);

export default StaffStatusBadge;
