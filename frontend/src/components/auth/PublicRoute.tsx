import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the next parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get('next') || '/';

  if (isLoading) {
    return (
      <div className="container py-5">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  // If user is authenticated, redirect to the next URL or home
  if (isAuthenticated) {
    return <Navigate to={next} replace />;
  }

  return <>{children}</>;
};
