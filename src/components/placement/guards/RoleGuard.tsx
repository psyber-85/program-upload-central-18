import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/placement/AuthContext';
import { UserRole } from '@/lib/placement/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { user, hasRole, isEmployer, isAIHQ } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    // Redirect to appropriate dashboard based on user type
    const defaultRedirect = isEmployer ? '/employer' : isAIHQ ? '/ops' : '/';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
}
