import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HubProvider, useHub } from '@/lib/internal-hub/HubContext';
import HubSidebar from './HubSidebar';
import HubMobileNav from './HubMobileNav';

const HubShell = () => {
  const { currentStaff } = useHub();

  // Doc 0.2 §44 — Inactive staff must not access the hub.
  if (currentStaff && currentStaff.status === 'Inactive') {
    return <Navigate to="/login?reason=inactive" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <HubSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-3 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-foreground">AIHQ Internal Hub</span>
          </header>
          <main className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </main>
          <HubMobileNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

const InternalHubLayout = () => (
  <HubProvider>
    <HubShell />
  </HubProvider>
);

export default InternalHubLayout;
