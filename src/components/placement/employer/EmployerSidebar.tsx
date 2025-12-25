import { Link, useLocation } from 'react-router-dom';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EmployerSidebarProps {
  className?: string;
}

export function EmployerSidebar({ className }: EmployerSidebarProps) {
  const { session, logout, isCompanyAdmin } = usePlacementAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/employer', icon: LayoutDashboard },
    { label: 'Roles', href: '/employer/roles', icon: Briefcase },
    ...(isCompanyAdmin() ? [{ label: 'Settings', href: '/employer/settings', icon: Settings }] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/employer') return location.pathname === '/employer';
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "flex flex-col border-r border-border bg-card transition-all duration-200",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">AI</span>
            </div>
            <span className="font-semibold text-sm">Employer Portal</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-muted rounded-md"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Company Info */}
      {!collapsed && session?.companyName && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Company</p>
          <p className="font-medium text-sm truncate">{session.companyName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-border">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="font-medium text-sm truncate">{session?.userName}</p>
            <p className="text-xs text-muted-foreground">{session?.role === 'COMPANY_ADMIN' ? 'Admin' : 'Hiring Manager'}</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("w-full justify-start", collapsed && "justify-center")}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
