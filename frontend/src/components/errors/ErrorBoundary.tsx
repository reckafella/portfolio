import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {

    this.setState({
      error,
      errorInfo
    });

    // Here you could also log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10 text-center">
                <div className="error-content">
                  {/* Error Icon */}
                  <div className="error-icon mb-4">
                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '5rem' }}></i>
                  </div>

                  {/* Error Message */}
                  <div className="error-message mb-4">
                    <h1 className="h2 fw-bold text-dark mb-3">Something went wrong</h1>
                    <p className="text-muted fs-5 mb-4">
                      An unexpected error occurred. Don't worry, it's not your fault!
                    </p>
                  </div>

                  {/* Error Details (Development Only)
                  {import.meta.env.MODE === 'development' && this.state.error && (
                    <div className="error-details mb-4">
                      <div className="alert alert-danger text-start" role="alert">
                        <h6 className="alert-heading">
                          <i className="bi bi-bug me-2"></i>
                          Development Error Details:
                        </h6>
                        <hr />
                        <p className="mb-2">
                          <strong>Error:</strong> {this.state.error.message}
                        </p>
                        {this.state.errorInfo && (
                          <details className="mt-2">
                            <summary className="fw-semibold">Component Stack</summary>
                            <pre className="mt-2 text-dark" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  )} */}

                  {/* Action Buttons */}
                  <div className="error-actions mb-4">
                    <button 
                      onClick={this.handleRetry}
                      className="btn btn-primary btn-lg px-4 me-3"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Try Again
                    </button>
                    <Link 
                      to="/" 
                      className="btn btn-outline-secondary btn-lg px-4 me-3"
                    >
                      <i className="bi bi-house-door me-2"></i>
                      Go Home
                    </Link>
                    <button 
                      onClick={() => window.location.reload()}
                      className="btn btn-outline-secondary btn-lg px-4"
                    >
                      <i className="bi bi-bootstrap-reboot me-2"></i>
                      Reload Page
                    </button>
                  </div>

                  {/* Help Section */}
                  <div className="error-help">
                    <div className="card border-0 bg-light">
                      <div className="card-body py-3">
                        <h6 className="card-title mb-2">
                          <i className="bi bi-info-circle me-2"></i>
                          What can you do?
                        </h6>
                        <div className="row g-3 text-start">
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-arrow-clockwise me-1"></i>
                              <strong>Refresh</strong><br />
                              Try reloading the page
                            </small>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-arrow-left me-1"></i>
                              <strong>Go Back</strong><br />
                              Return to previous page
                            </small>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-envelope me-1"></i>
                              <strong>Report</strong><br />
                              <Link to="/contact" className="bg-light-dark bg-dark-light text-decoration-none">
                                Contact support
                              </Link>
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
