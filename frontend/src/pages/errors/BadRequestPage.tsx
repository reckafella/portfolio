import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';

const BadRequestPage: React.FC = () => {
    usePageTitle('400 - Bad Request');

    return (
        <section className="section http-errors min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 text-center">
                        <div className="error-content">
                            {/* Error Code */}
                            <div className="error-code mb-4">
                                <h1 className="display-1 fw-bold text-danger mb-0">400</h1>
                                <div className="error-divider mx-auto my-3" style={{ width: '100px', height: '4px', backgroundColor: '#dc3545' }}></div>
                            </div>
                            {/* Error Message */}
                            <div className="error-message mb-4">
                                <h2 className="h3 fw-bold mb-3">Bad Request</h2>
                                <p className="text-muted fs-5 mb-4">
                                    The request could not be understood by the server. This might be due to malformed syntax or invalid parameters.
                                </p>
                            </div>
                            {/* Error Info */}
                            <div className="error-info mb-4">
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
                                    <div className="text-start">
                                        <strong>Request Error:</strong><br />
                                        <small>The server cannot process this request due to invalid data or format.</small>
                                    </div>
                                </div>
                            </div>
                            {/* Suggestions */}
                            <div className="error-suggestions mb-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-arrow-clockwise fs-2 text-danger mb-2"></i>
                                            <h5 className="fw-semibold">Try Again</h5>
                                            <p className="text-muted small mb-0">Reload and retry your request</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="suggestion-card p-3 border rounded h-100">
                                            <i className="bi bi-arrow-left fs-2 text-danger mb-2"></i>
                                            <h5 className="fw-semibold">Go Back</h5>
                                            <p className="text-muted small mb-0">Return to the previous page</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="error-actions">
                                <button onClick={() => window.location.reload()}
                                    className="btn btn-danger btn-lg px-4 me-3">
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Try Again
                                </button>
                                <button onClick={() => window.history.back()}
                                    className="btn btn-outline-secondary btn-lg px-4">
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Go Back
                                </button>
                            </div>
                            {/* Additional Help */}
                            <div className="error-help mt-5 pt-4 border-top">
                                <p className="text-muted small mb-2">
                                    Issue persists?
                                    <Link to="/contact" className="text-decoration-none ms-1">
                                        Report this problem
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

export default BadRequestPage;
