import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, User, ChevronDown } from 'lucide-react';
import { AppRole } from '@/lib/dal/types';

const RoleSwitcher = () => {
  const { user, isAdmin, switchRole } = useAuth();

  if (!user) return null;

  const handleSwitchRole = async (role: AppRole) => {
    await switchRole(role);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-background shadow-lg border-2"
          >
            {isAdmin ? (
              <Shield className="h-4 w-4 mr-2 text-amber-500" />
            ) : (
              <User className="h-4 w-4 mr-2 text-blue-500" />
            )}
            <span className="hidden sm:inline mr-1">{user.name}</span>
            <Badge 
              variant={isAdmin ? "default" : "secondary"} 
              className="ml-1 text-xs"
            >
              {user.role}
            </Badge>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Dev Mode: Switch Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleSwitchRole('admin')}
            className={isAdmin ? 'bg-accent' : ''}
          >
            <Shield className="h-4 w-4 mr-2 text-amber-500" />
            Admin
            {isAdmin && <span className="ml-auto text-xs">Active</span>}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSwitchRole('staff')}
            className={!isAdmin ? 'bg-accent' : ''}
          >
            <User className="h-4 w-4 mr-2 text-blue-500" />
            Staff
            {!isAdmin && <span className="ml-auto text-xs">Active</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoleSwitcher;
