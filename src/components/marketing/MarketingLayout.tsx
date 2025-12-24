import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingNavigation from './MarketingNavigation';

const MarketingLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavigation />
      <Outlet />
    </div>
  );
};

export default MarketingLayout;
