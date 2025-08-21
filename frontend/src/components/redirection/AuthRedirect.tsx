import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthRedirectProps {
  to: string;
  replace?: boolean;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ to, replace = true }) => {
  const location = useLocation();

  useEffect(() => {
    // Optional: Track redirects for analytics @ future implementation
  }, [location.pathname, to]);

  return <Navigate to={to} replace={replace} state={{ from: location }} />;
};

// Specific redirect components
export const SigninRedirect: React.FC = () => <AuthRedirect to="/login" />;
export const SignupRedirect: React.FC = () => <AuthRedirect to="/register" />;
export const SignoutRedirect: React.FC = () => <AuthRedirect to="/logout" />;

export default AuthRedirect;
