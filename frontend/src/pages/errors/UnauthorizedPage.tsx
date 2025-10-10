import React from 'react';
import { Navigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { getLoginUrlWithNext, getSignupUrlWithNext } from '@/utils/authUtils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { AuthService } from '@/services/authService';

// check if a user is logged in && authorized
const isLoggedIn = AuthService.isAuthenticated();
const isAuthorized = AuthService.getCurrentUser()?.is_staff;



const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  usePageTitle('401 - Unauthorized');

  if (isLoggedIn && isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 text-center">
            <div className="error-content">
              {/* Error Code */}
              <div className="error-code mb-4">
                <h1 className="fw-bold mb-0" style={{ color: 'var(--text-error-color)' }}>401</h1>
                <div className="error-divider mx-auto my-3" style={{ width: 'auto', height: '.35rem', backgroundColor: 'var(--text-error-color)' }}></div>
              </div>

              {/* Error Message */}
              <div className="error-message mb-4">
                <h2 className="h3 fw-bold mb-3">Authentication Required</h2>
                <p className="text-muted fs-5 mb-4">
                  You need to permission to access this content. Please log in with your credentials.
                </p>
              </div>

              {/* Auth Info */}
              <div className="error-info mb-4">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle fs-4 me-3"></i>
                  <div className="text-start">
                    <strong>Sign In Required:</strong><br />
                    <small>This content is only available to authenticated users.</small>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="error-suggestions mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="suggestion-card p-3 border rounded h-100">
                      <i className="bi bi-box-arrow-in-right fs-2 text-danger mb-2"></i>
                      <h5 className="fw-semibold">Sign In</h5>
                      <p className="text-muted small mb-0">Access your account</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="suggestion-card p-3 border rounded h-100">
                      <i className="bi bi-person-plus fs-2 text-danger mb-2"></i>
                      <h5 className="fw-semibold">Create Account</h5>
                      <p className="text-muted small mb-0">Join our community</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}

              {isLoggedIn ? (
              <div className="error-actions">
                <Link
                  to={getLoginUrlWithNext(currentPath)}
                  className="btn btn-danger btn-lg px-4 me-3"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Link>
                <Link
                  to={getSignupUrlWithNext(currentPath)}
                  className="btn btn-outline-danger btn-lg px-4"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Sign Up
                </Link>
                </div>) : (
                  <div className="error-actions">
                    <Link
                      to={getLoginUrlWithNext(currentPath)}
                      className="btn btn-danger btn-lg px-4 me-3"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </Link>
                  </div>
                )}

              {/* Additional Help */}
              {/* <div className="error-help mt-5 pt-4 border-top">
                <p className="text-muted small mb-2">
                  Forgot your password?
                  <Link to={getLoginUrlWithNext(currentPath)}
                    className="text-decoration-none ms-1" style={{ color: 'var(--text-error-color)' }}>
                    Reset it here
                  </Link>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnauthorizedPage;
