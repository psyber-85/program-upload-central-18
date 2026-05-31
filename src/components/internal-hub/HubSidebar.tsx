import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, User, Users, Megaphone, Bell, BookOpen, FileText, Receipt,
  Banknote, ClipboardCheck, BarChart3, Settings as SettingsIcon, AlertTriangle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';

const HubSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();
  const { currentStaff } = useHub();
  const showAdmin = canAccessAdminArea(currentStaff);

  const isActive = (p: string, exact = false) =>
    exact ? pathname === p : pathname === p || pathname.startsWith(p + '/');

  const hubItems = [
    { to: '/staff', label: 'Home', icon: Home, exact: true },
    { to: '/staff/notices', label: 'Notices', icon: Bell },
    { to: '/staff/resources', label: 'Resources', icon: BookOpen },
    { to: '/staff/requests', label: 'My Requests', icon: FileText },
    { to: '/staff/payslips', label: 'My Payslips', icon: Receipt },
    { to: '/staff/profile', label: 'My Profile', icon: User },
  ];

  const adminItems = [
    { to: '/staff/admin/staff', label: 'Staff', icon: Users },
    { to: '/staff/admin/notices/new', label: 'Broadcast', icon: Megaphone },
    { to: '/staff/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
    { to: '/staff/admin/payroll', label: 'Payroll', icon: Banknote },
    { to: '/staff/admin/payslips', label: 'All Payslips', icon: Receipt },
    { to: '/staff/admin/resources', label: 'Manage Resources', icon: BookOpen },
    { to: '/staff/admin/finance', label: 'Finance Snapshot', icon: BarChart3 },
    { to: '/staff/admin/system-issues', label: 'System Issues', icon: AlertTriangle },
    { to: '/staff/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hubItems.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={isActive(it.to, !!it.exact)}>
                    <NavLink to={it.to} end={!!it.exact} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      {!collapsed && <span>{it.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((it) => (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild isActive={isActive(it.to)}>
                      <NavLink to={it.to} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        {!collapsed && <span>{it.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>External</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/staff/marketing" className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    {!collapsed && <span>Marketing Portal</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default HubSidebar;
