import { Navigate } from 'react-router-dom';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';

interface OpsProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function OpsProtectedRoute({ children, requireAdmin = false }: OpsProtectedRouteProps) {
  const { session, isLoading, isOps, isAdmin } = usePlacementAuth();

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

  // Not an ops role
  if (!isOps()) {
    return <Navigate to="/login" replace />;
  }

  // Requires admin but user is only ops
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This action requires Admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
