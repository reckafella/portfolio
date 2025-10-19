import { usePageTitle } from '@/hooks/usePageTitle';
import React from 'react';
import { Link } from 'react-router-dom';
import { useMetaTags } from '@/hooks/useMetaTags';

const NotFoundPage: React.FC = () => {
    usePageTitle('404 - Not Found');
    useMetaTags({
        title: '404 - Not Found',
        description: 'The page you are looking for does not exist.',
        keywords: '404, not found, error, page not found',
        ogTitle: '404 - Not Found',
        ogDescription: 'The page you are looking for does not exist.',
        ogType: 'website',
    });
    return (
        <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 text-center">
                        <div className="error-content">
                            {/* Error Code */}
                            <div className="error-code mb-4">
                                <h1 className="fw-bold mb-0" style={{ color: 'var(--text-error-color)' }}>404</h1>
                                <div className="error-divider mx-auto my-3" style={{ width: '100px', height: '4px', backgroundColor: 'var(--text-error-color)' }}></div>
                            </div>
                            {/* Error Message */}
                            <div className="error-message mb-4">
                                <h2 className="h3 fw-bold mb-3">Page Not Found</h2>
                                <p className="text-muted fs-5 mb-4">
                                    The page you're looking for doesn't exist or has been moved to a different location.
                                </p>
                            </div>
                            {/* Suggestions */}
                            <div className="error-suggestions mb-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-house-door fs-2 text-primary mb-2"></i>
                                            <h5 className="fw-semibold">Go Home</h5>
                                            <p className="text-muted small mb-0">Return to the main page</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-search fs-2 text-primary mb-2"></i>
                                            <h5 className="fw-semibold">Search</h5>
                                            <p className="text-muted small mb-0">Find what you're looking for</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="error-actions">
                                <Link to="/" className="btn btn-primary btn-lg px-4 me-3">
                                    <i className="bi bi-house-door me-2"></i>
                                    Go Home
                                </Link>
                                <button onClick={() => window.history.back()} className="btn btn-outline-secondary btn-lg px-4">
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Go Back
                                </button>
                            </div>
                            {/* Additional Help */}
                            <div className="error-help mt-5 pt-4 border-top">
                                <p className="text-muted small mb-2">
                                    Still need help?
                                    <Link to="/contact" className="text-decoration-none bg-dark-light ms-1">
                                        Contact me
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

export default NotFoundPage;
