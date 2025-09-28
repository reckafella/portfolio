import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLoginUrlWithNext } from '@/utils/authUtils';
import { usePageTitle } from '@/hooks/usePageTitle';


const ForbiddenPage: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname + location.search;
    usePageTitle('403 - Forbidden');

    return (
        <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 text-center">
                        <div className="error-content">
                            {/* Error Code */}
                            <div className="error-code mb-4">
                                <h1 className="display-1 fw-bold text-warning mb-0">403</h1>
                                <div className="error-divider mx-auto my-3" style={{ width: '100px', height: '4px', backgroundColor: 'var(--text-error-color)' }}></div>
                            </div>
                            {/* Error Message */}
                            <div className="error-message mb-4">
                                <h2 className="h3 fw-bold mb-3">Access Forbidden</h2>
                                <p className="text-muted fs-5 mb-4">
                                    You don't have permission to access this resource. This could be because you're not logged in or don't have the required privileges.
                                </p>
                            </div>
                            {/* Security Info */}
                            <div className="error-info mb-4">
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <i className="bi bi-shield-exclamation fs-4 me-3"></i>
                                    <div className="text-start">
                                        <strong>Security Notice:</strong><br />
                                        <small>This action requires authentication or elevated permissions.</small>
                                    </div>
                                </div>
                            </div>
                            {/* Suggestions */}
                            <div className="error-suggestions mb-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-person-circle fs-2 text-warning mb-2"></i>
                                            <h5 className="fw-semibold">Sign In</h5>
                                            <p className="text-muted small mb-0">Log in to your account</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-house-door fs-2 text-warning mb-2"></i>
                                            <h5 className="fw-semibold">Go Home</h5>
                                            <p className="text-muted small mb-0">Return to the main page</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="error-actions">
                                <Link to={getLoginUrlWithNext(currentPath)} className="btn btn-warning btn-lg px-4 me-3">
                                    <i className="bi bi-person-circle me-2"></i> Sign In
                                </Link>
                                <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
                                    <i className="bi bi-house-door me-2"></i>
                                    Go Home
                                </Link>
                            </div>
                            {/* Additional Help */}
                            <div className="error-help mt-5 pt-4 border-top">
                                <p className="text-muted small mb-2">
                                    Need access?
                                    <Link to="/contact" className="text-decoration-none ms-1">
                                        Contact me
                                    </Link>
                                    for assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForbiddenPage;
