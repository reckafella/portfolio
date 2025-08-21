import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 text-center">
            <div className="error-content">
              {/* Error Code */}
              <div className="error-code mb-4">
                <h1 className="display-1 fw-bold text-info mb-0">401</h1>
                <div className="error-divider mx-auto my-3" style={{width: '100px', height: '4px', backgroundColor: '#0dcaf0'}}></div>
              </div>

              {/* Error Message */}
              <div className="error-message mb-4">
                <h2 className="h3 fw-bold text-dark mb-3">Authentication Required</h2>
                <p className="text-muted fs-5 mb-4">
                  You need to sign in to access this content. Please log in with your credentials.
                </p>
              </div>

              {/* Auth Info */}
              <div className="error-info mb-4">
                <div className="alert alert-info d-flex align-items-center" role="alert">
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
                    <div className="suggestion-card p-3 border rounded bg-white h-100">
                      <i className="bi bi-box-arrow-in-right fs-2 text-info mb-2"></i>
                      <h5 className="fw-semibold">Sign In</h5>
                      <p className="text-muted small mb-0">Access your account</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="suggestion-card p-3 border rounded bg-white h-100">
                      <i className="bi bi-person-plus fs-2 text-info mb-2"></i>
                      <h5 className="fw-semibold">Create Account</h5>
                      <p className="text-muted small mb-0">Join our community</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="error-actions">
                <Link
                  to="/login"
                  className="btn btn-info btn-lg px-4 me-3"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-info btn-lg px-4"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Sign Up
                </Link>
              </div>

              {/* Additional Help */}
              <div className="error-help mt-5 pt-4 border-top">
                <p className="text-muted small mb-2">
                  Forgot your password?
                  <Link to="/login" className="text-decoration-none ms-1">
                    Reset it here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnauthorizedPage;
