import { usePageTitle } from '@/hooks/usePageTitle';
import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage: React.FC = () => {
  usePageTitle('500 - Server Error');

    return (
        <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 text-center">
            <div className="error-content">
              {/* Error Code */}
              <div className="error-code mb-4">
                <h1 className="display-1 fw-bold mb-0">500</h1>
                <div className="error-divider mx-auto my-3" style={{width: '100px', height: '4px', backgroundColor: 'var(--text-error-color)'}}></div>
              </div>

              {/* Error Message */}
              <div className="error-message mb-4">
                <h2 className="h3 fw-bold mb-3">Server Error</h2>
                <p className="text-muted fs-5 mb-4">
                  Something went wrong on our end. We're working to fix this issue as quickly as possible.
                </p>
              </div>

              {/* Error Info */}
              <div className="error-info mb-4">
                <div className="alert alert-secondary d-flex align-items-center" role="alert">
                  <i className="bi bi-tools fs-4 me-3"></i>
                  <div className="text-start">
                    <strong>We're on it!</strong><br />
                    <small>Our team has been notified and is working to resolve this issue.</small>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="error-suggestions mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="suggestion-card p-3 border rounded h-100">
                      <i className="bi bi-clock-history fs-2 text-secondary mb-2"></i>
                      <h5 className="fw-semibold">Wait & Retry</h5>
                      <p className="text-muted small mb-0">Try again in a few moments</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="suggestion-card p-3 border rounded h-100">
                      <i className="bi bi-house-door fs-2 text-secondary mb-2"></i>
                      <h5 className="fw-semibold">Go Home</h5>
                      <p className="text-muted small mb-0">Return to the main page</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="error-actions">
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-secondary btn-lg px-4 me-3"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </button>
                <Link 
                  to="/" 
                  className="btn btn-outline-secondary btn-lg px-4"
                >
                  <i className="bi bi-house-door me-2"></i>
                  Go Home
                </Link>
              </div>

              {/* Additional Help */}
              <div className="error-help mt-5 pt-4 border-top">
                <p className="text-muted small mb-2">
                  Need immediate assistance? 
                  <Link to="/contact" className="text-decoration-none ms-1">
                    Contact support
                  </Link>
                </p>
                <p className="text-muted small">
                  Error ID: <code className="">{Date.now()}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerErrorPage;
