import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to home page after logout
      navigate('/');
    } catch (err: any) {
      localStorage.removeItem('token');
      navigate('/');
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
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Logging out...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default LogoutButton;
