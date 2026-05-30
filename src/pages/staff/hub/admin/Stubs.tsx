import React from 'react';
import ComingSoonStub from '@/components/internal-hub/ComingSoonStub';

export const Approvals = () => (
  <ComingSoonStub title="Approvals" description="Admin queue for pending leave, claims, and other requests." owningCard="Card 2" />
);
export const PayrollAdmin = () => (
  <ComingSoonStub title="Payroll" description="Payroll runs, status, and approval will live here." owningCard="Card 3" />
);
export const FinanceSnapshot = () => (
  <ComingSoonStub title="Finance Snapshot" description="Admin-only finance snapshot. Not a staff-visible company finance dashboard." owningCard="Card 3" />
);
export const SettingsAdmin = () => (
  <ComingSoonStub title="Settings" description="Admin platform settings." owningCard="later card" />
);
