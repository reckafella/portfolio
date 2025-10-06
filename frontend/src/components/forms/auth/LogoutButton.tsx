import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  buttonText?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = 'btn btn-outline-danger',
  buttonText = 'Logout'
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Force a full page reload to ensure all authentication state is cleared
      window.location.href = '/';
    } catch {
      // Clear local storage and reload on error as well
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <>
          <div className="d-flex justify-content-center align-items-center me-2">
            <div className="spinner-grow spinner-grow-sm text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow text-info">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow spinner-grow-lg text-success">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          Logging out...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default LogoutButton;
