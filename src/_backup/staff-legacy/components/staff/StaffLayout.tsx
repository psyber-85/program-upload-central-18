import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffNavigation from './StaffNavigation';

const StaffLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <StaffNavigation />
      <Outlet />
    </div>
  );
};

export default StaffLayout;
