import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Home } from 'lucide-react';

const StaffNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/staff" className="flex items-center px-4 text-lg font-medium">
              HRDC Staff Portal
            </Link>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/staff/participant-manager"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/staff/participant-manager') && "bg-accent/50"
                      )}
                    >
                      Participant Manager
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/staff/birthday-dashboard"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/staff/birthday-dashboard') && "bg-accent/50"
                      )}
                    >
                      Birthday Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/staff/register-tracker"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/staff/register-tracker') && "bg-accent/50"
                      )}
                    >
                      Registration Tracker
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {/* Temporarily hidden: CRM Campaign Tracker
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/staff/crm-tracker"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/staff/crm-tracker') && "bg-accent/50"
                      )}
                    >
                      CRM Campaign Tracker
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                */}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Public Site</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StaffNavigation;
