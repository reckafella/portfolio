import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../hooks/useLoading';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { setRouteLoading } = useLoading();
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only trigger loading if the path actually changed
    if (previousPathRef.current !== '' && previousPathRef.current !== currentPath) {
      // Show loading when route changes
      setRouteLoading(true);
      
      // Hide loading after a brief delay to allow the component to mount
      const timer = setTimeout(() => {
        setRouteLoading(false);
      }, 150);

      return () => {
        clearTimeout(timer);
      };
    }
    
    // Update the previous path reference
    previousPathRef.current = currentPath;
  }, [location.pathname, setRouteLoading]);

  return <>{children}</>;
};

export default RouteTransition;
