import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getLoginUrlWithNext } from '@/utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireStaff = false,
  redirectTo = '/login'
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container py-5">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Generate login URL with current path as next parameter
    const currentPath = location.pathname + location.search;
    if (redirectTo === '/login') {
      const loginUrl = getLoginUrlWithNext(currentPath);
      return <Navigate to={loginUrl} replace />;
    }
    // For other redirect destinations, use the original redirect
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireStaff && !user?.is_staff) {
    // Redirect to unauthorized page if staff access required but user is not staff
    return <Navigate to="/error/403" replace />;
  }

  return <>{children}</>;
};
