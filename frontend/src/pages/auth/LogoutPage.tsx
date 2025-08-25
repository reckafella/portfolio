import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LogoutPage: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState('');
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      if (isAuthenticated) {
        try {
          await logout();
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } catch (err: any) {
          setError(err.message || 'Logout failed');
          setIsLoggingOut(false);
        }
      } else {
        // User is already logged out
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    };

    handleLogout();
  }, [logout, isAuthenticated, navigate]);

  const handleManualRedirect = () => {
    navigate('/', { replace: true });
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Logout Error</h4>
                  <p>{error}</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleManualRedirect}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-4">
                {isLoggingOut ? (
                  <>
                    <div className="d-flex justify-content-center align-items-center mb-3">
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
                    <h4>Logging you out...</h4>
                    <p className="text-muted">Please wait while we sign you out securely.</p>
                  </>
                ) : (
                  <>
                    <div className="text-success mb-3">
                      <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h4>Successfully logged out!</h4>
                    <p className="text-muted">You have been signed out. Redirecting to home page...</p>
                  </>
                )}
              </div>
              
              <button 
                className="btn btn-outline-primary"
                onClick={handleManualRedirect}
                disabled={isLoggingOut}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
