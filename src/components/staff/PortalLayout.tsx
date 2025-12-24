import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import MobileBottomNav from './MobileBottomNav';
import RoleSwitcher from './RoleSwitcher';

const PortalLayout = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <StaffSidebar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
      <RoleSwitcher />
    </div>
  );
};

export default PortalLayout;
