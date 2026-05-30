import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PortalNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/staff" className="flex items-center text-lg font-semibold">
              AIHQ Staff Portal
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/staff"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === '/staff' 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Home
              </Link>
              <Link
                to="/staff/marketing"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive('/staff/marketing')
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Marketing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="mailto:wani@theaihq.net?subject=IT%20Support%20Request">
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">IT Support</span>
              </a>
            </Button>
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

export default PortalNavigation;
