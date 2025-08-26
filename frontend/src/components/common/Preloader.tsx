import React, { useEffect, useState } from 'react';
import { useLoading } from '@/hooks/useLoading';

interface PreloaderProps {
  showInitial?: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ 
  showInitial = true
}) => {
  const [isVisible, setIsVisible] = useState(showInitial);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { isLoading, isRouteLoading } = useLoading();

  // Handle initial app load
  useEffect(() => {
    if (showInitial && !initialLoadComplete) {
      // Hide preloader after initial load
      const timer = setTimeout(() => {
        setIsVisible(false);
        setInitialLoadComplete(true);
      }, 800); // Show for 800ms to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [showInitial, initialLoadComplete]);

  // Show if any loading state is active, but only after initial load is complete
  const shouldShowFullPreloader = (!initialLoadComplete && isVisible) || (initialLoadComplete && isLoading);
  const shouldShowRouteLoader = initialLoadComplete && isRouteLoading && !isLoading;

  return (
    <>
      {/* Full page preloader for initial load and manual loading states */}
      {shouldShowFullPreloader && (
        <div 
          id="preloader" 
          className="gap-2 d-flex align-items-center justify-content-center"
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
      {shouldShowRouteLoader && (
        <div key={Date.now()} className="route-loading"></div>
      )}
    </>
  );
};

export default Preloader;
