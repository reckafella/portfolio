import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../hooks/useLoading';

interface PreloaderProps {
  showInitial?: boolean;
  showOnRouteChange?: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ 
  showInitial = true, 
  showOnRouteChange = true 
}) => {
  const [isVisible, setIsVisible] = useState(showInitial);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const location = useLocation();
  const { isLoading, isRouteLoading } = useLoading();

  // Handle initial app load
  useEffect(() => {
    if (showInitial) {
      // Hide preloader after initial load
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 800); // Show for 800ms to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [showInitial]);

  // Handle route changes
  useEffect(() => {
    if (showOnRouteChange && !showInitial) {
      setIsRouteChanging(true);
      
      // Show briefly for route transitions
      const timer = setTimeout(() => {
        setIsRouteChanging(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, showOnRouteChange, showInitial]);

  // Show if any loading state is active
  const shouldShow = isVisible || isRouteChanging || isLoading || isRouteLoading;

  // Don't render if not visible
  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Full page preloader for initial load and manual loading states */}
      {(isVisible || isLoading) && (
        <div 
          id="preloader" 
          className={`gap-2 d-flex align-items-center justify-content-center ${
            (!isVisible && !isLoading) ? 'fade-out' : ''
          }`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            backgroundColor: 'var(--preloader-background-color, #fff)',
            transition: 'all 0.6s ease-out',
            width: '100%',
            height: '100vh'
          }}
        >
          <div className="spinner-grow spinner-grow-sm text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="spinner-grow text-info" 
            role="status"
            style={{ width: "20px", height: "20px" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="spinner-grow text-warning" 
            role="status"
            style={{ width: "25px", height: "25px" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="spinner-grow text-danger" 
            role="status"
            style={{ width: "30px", height: "30px" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="spinner-grow text-primary" 
            role="status"
            style={{ width: "35px", height: "35px" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="spinner-grow text-success" 
            role="status"
            style={{ width: "40px", height: "40px" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Minimal loading bar for route transitions */}
      {(isRouteChanging || isRouteLoading) && !isVisible && !isLoading && (
        <div className="route-loading"></div>
      )}
    </>
  );
};

export default Preloader;
