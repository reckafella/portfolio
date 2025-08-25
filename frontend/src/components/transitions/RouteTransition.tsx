import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../hooks/useLoading';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { setRouteLoading } = useLoading();

  useEffect(() => {
    // Show loading when route changes
    setRouteLoading(true);
    
    // Hide loading after a brief delay to allow the component to mount
    const timer = setTimeout(() => {
      setRouteLoading(false);
    }, 150);

    return () => {
      clearTimeout(timer);
      setRouteLoading(false);
    };
  }, [location.pathname, setRouteLoading]);

  return <>{children}</>;
};

export default RouteTransition;
