// Patch 1.3 §21 — Replaced legacy ComingSoonStub usage with explicit routes.
// Approvals now routes to AdminWorkbench filtered to Requests.
// SettingsAdmin uses the ComingLater pattern.
import React from 'react';
import { Navigate } from 'react-router-dom';
import ComingLater from '@/components/internal-hub/ComingLater';

export const Approvals = () => <Navigate to="/staff/admin/workbench?type=Requests" replace />;

export const SettingsAdmin = () => (
  <ComingLater
    feature="Admin Settings"
    purpose="Platform-level configuration for AIHQ Internal Hub."
    plannedFor="a later build"
  />
);
