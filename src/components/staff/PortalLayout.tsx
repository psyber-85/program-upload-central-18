import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalNavigation from './PortalNavigation';

const PortalLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <PortalNavigation />
      <Outlet />
    </div>
  );
};

export default PortalLayout;
