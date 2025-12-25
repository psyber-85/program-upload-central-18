import { Navigate } from 'react-router-dom';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';

interface EmployerProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function EmployerProtectedRoute({ children, requireAdmin = false }: EmployerProtectedRouteProps) {
  const { session, isLoading, isEmployer, isCompanyAdmin } = usePlacementAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Not an employer role
  if (!isEmployer()) {
    return <Navigate to="/login" replace />;
  }

  // Requires company admin but user is only hiring manager
  if (requireAdmin && !isCompanyAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This action requires Company Admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
