import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  ClipboardList, 
  FileText, 
  Receipt, 
  DollarSign,
  Users,
  Settings,
  Mail,
  LogOut,
  Megaphone,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  external?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Home', path: '/staff', icon: Home },
  { label: 'Requests', path: '/staff/requests', icon: ClipboardList },
  { label: 'Documents', path: '/staff/docs', icon: FileText },
  { label: 'My Payslips', path: '/staff/payslips', icon: Receipt },
];

const adminNavItems: NavItem[] = [
  { label: 'Payroll', path: '/staff/payroll', icon: DollarSign, adminOnly: true },
  { label: 'Entries', path: '/staff/entries', icon: Users, adminOnly: true },
  { label: 'Settings', path: '/staff/settings', icon: Settings, adminOnly: true },
];

const portalNavItems: NavItem[] = [
  { label: 'Marketing Portal', path: '/staff/marketing', icon: Megaphone },
];

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/staff') {
      return location.pathname === '/staff';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          active 
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
        {item.path === '/staff/marketing' && (
          <ChevronRight className="h-4 w-4 ml-auto" />
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar-background min-h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <Link to="/staff" className="flex items-center">
          <span className="text-lg font-semibold text-sidebar-foreground">AIHQ Staff Portal</span>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role} · {user.businessArm}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
        
        {isAdmin && (
          <>
            <Separator className="my-4" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Admin
            </p>
            {adminNavItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </>
        )}

        <Separator className="my-4" />
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Portals
        </p>
        {portalNavItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <a href="mailto:wani@theaihq.net?subject=IT%20Support%20Request">
            <Mail className="h-4 w-4 mr-2" />
            IT Support
          </a>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
