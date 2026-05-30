import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Users } from 'lucide-react';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { cn } from '@/lib/utils';

const HubMobileNav = () => {
  const { currentStaff } = useHub();
  const showAdmin = canAccessAdminArea(currentStaff);

  const item = 'flex flex-col items-center justify-center gap-0.5 text-xs flex-1 py-2';
  const active = 'text-primary';
  const inactive = 'text-muted-foreground';

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border flex">
      <NavLink to="/staff" end className={({ isActive }) => cn(item, isActive ? active : inactive)}>
        <Home className="h-5 w-5" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/staff/profile" className={({ isActive }) => cn(item, isActive ? active : inactive)}>
        <User className="h-5 w-5" />
        <span>Profile</span>
      </NavLink>
      {showAdmin && (
        <NavLink to="/staff/admin/staff" className={({ isActive }) => cn(item, isActive ? active : inactive)}>
          <Users className="h-5 w-5" />
          <span>Staff</span>
        </NavLink>
      )}
    </nav>
  );
};

export default HubMobileNav;
