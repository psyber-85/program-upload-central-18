import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Users, 
  GitMerge,
  FileSignature,
  GraduationCap,
  Wallet,
  FileCode,
  BarChart3,
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/placement/AuthContext';

interface NavSection {
  label: string;
  items: { label: string; href: string; icon: React.ElementType }[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/ops', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Employers',
    items: [
      { label: 'All Employers', href: '/ops/employers', icon: Building2 },
      { label: 'Role Requests', href: '/ops/roles', icon: FileText },
    ],
  },
  {
    label: 'Candidates',
    items: [
      { label: 'All Candidates', href: '/ops/candidates', icon: Users },
      { label: 'Matches', href: '/ops/matches', icon: GitMerge },
    ],
  },
  {
    label: 'Process',
    items: [
      { label: 'LOI Queue', href: '/ops/loi', icon: FileSignature },
      { label: 'Training', href: '/ops/training', icon: GraduationCap },
      { label: 'Grants', href: '/ops/grants', icon: Wallet },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Templates', href: '/ops/templates', icon: FileCode },
      { label: 'Analytics', href: '/ops/analytics', icon: BarChart3 },
    ],
  },
];

export function OpsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Employers', 'Candidates']);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  // Filter sections based on permissions
  const filterNavSections = (sections: NavSection[]): NavSection[] => {
    return sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Training ops can't see grants
        if (item.href === '/ops/grants' && !hasPermission('manage_grants')) {
          return false;
        }
        // Training ops has limited access
        if (item.href === '/ops/templates' && !hasPermission('manage_templates')) {
          return false;
        }
        return true;
      }),
    })).filter((section) => section.items.length > 0);
  };

  const filteredSections = filterNavSections(navSections);

  // Generate breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { label, path };
  });

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/ops" className="flex items-center space-x-2" onClick={onLinkClick}>
          <span className="text-lg font-bold text-foreground">AIHQ</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Ops</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredSections.map((section) => (
          <Collapsible
            key={section.label}
            open={expandedSections.includes(section.label)}
            onOpenChange={() => toggleSection(section.label)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground">
              {section.label}
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  expandedSections.includes(section.label) && 'rotate-180'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href ||
                  (item.href !== '/ops' && location.pathname.startsWith(item.href + '/'));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>

      {/* Back to public */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={onLinkClick}
        >
          ← Back to public site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="absolute right-4 top-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
                    <Link
                      to={crumb.path}
                      className={cn(
                        'transition-colors',
                        index === breadcrumbs.length - 1
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
