import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  ClipboardList, 
  FileText, 
  Receipt, 
  MoreHorizontal,
  DollarSign,
  Users,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/staff', icon: Home },
  { label: 'Requests', path: '/staff/requests', icon: ClipboardList },
  { label: 'Billing', path: '/staff/my-entries', icon: FileText, adminOnly: false },
  { label: 'Docs', path: '/staff/docs', icon: FileText },
  { label: 'Payslips', path: '/staff/payslips', icon: Receipt },
];

const moreItems: NavItem[] = [
  { label: 'Payroll', path: '/staff/payroll', icon: DollarSign, adminOnly: true },
  { label: 'AR Billing', path: '/staff/billing', icon: FileText, adminOnly: true },
  { label: 'AP Payments', path: '/staff/payments', icon: Receipt, adminOnly: true },
  { label: 'Settings', path: '/staff/settings', icon: Settings, adminOnly: true },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAdmin, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/staff') {
      return location.pathname === '/staff';
    }
    return location.pathname.startsWith(path);
  };

  const filteredMoreItems = moreItems.filter(item => !item.adminOnly || isAdmin);

  // Filter out "My Billing" for admin users
  const filteredNavItems = navItems.filter(item => !(item.adminOnly === false && isAdmin));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 px-3 transition-colors",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full py-2 px-3 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {filteredMoreItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="mailto:wani@theaihq.net?subject=IT%20Support%20Request">
                IT Support
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
