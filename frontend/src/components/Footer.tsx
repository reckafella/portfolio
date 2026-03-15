import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="footer" className="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="row row-cols-2 row-cols-md-4 row-cols-lg-4 g-3 justify-content-center gy-2">
                        {/* Social Links */}
                        <div className="col footer-info h-100">
                            <h4>Social Links</h4>
                            <div className="social-links d-flex flex-wrap gap-2">
                                <Link
                                    to="https://github.com/reckafella"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="github"
                                    title="View my GitHub profile"
                                >
                                    <i className="bi bi-github"></i>
                                </Link>
                                <Link
                                    to="https://www.linkedin.com/in/ethanmuthoni/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="linkedin"
                                    title="Connect with me on LinkedIn"
                                >
                                    <i className="bi bi-linkedin"></i>
                                </Link>
                                <Link
                                    to="https://twitter.com/frmundu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="twitter"
                                    title="Follow me on X (Twitter)"
                                >
                                    <i className="bi bi-twitter-x"></i>
                                </Link>
                            </div>
                        </div>

                        {/* Contact Me */}
                        <div className="col footer-links h-100">
                            <h4>Contact Me</h4>
                            <ul>
                                <li>
                                    <Link
                                        to="mailto:ethanmuthoni@mail.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Send me an email"
                                    >
                                        <i className="bi bi-envelope me-1"></i>
                                        Email Me
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Useful Links */}
                        <div className="col footer-links h-100">
                            <h4>Useful Links</h4>
                            <ul>
                                <li>
                                    <i className="bi bi-house me-1"></i>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <i className="bi bi-journal-text me-1"></i>
                                    <Link to="/blog">Blog</Link>
                                </li>
                                <li>
                                    <i className="bi bi-person me-1"></i>
                                    <Link to="/contact">Contact</Link>
                                </li>
                                <li>
                                    <i className="bi bi-briefcase me-1"></i>
                                    <Link to="/projects">Projects</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Services</Link>
                                </li>
                                <li>
                                    <i className="bi bi-diagram-3 me-1"></i>
                                    <Link
                                        to="/sitemap"
                                        title="View website sitemap"
                                    >
                                        Sitemap
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Services Offered */}
                        <div className="col footer-links h-100">
                            <h4>Services Offered</h4>
                            <ul>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Web Development</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Quality Assurance</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Website Maintenance</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">SEO Optimization</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Domain Registration</Link>
                                </li>
                                <li>
                                    <i className="bi bi-gear me-1"></i>
                                    <Link to="/services">Technical Writing</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Copyright */}
                <div className="copyright mt-1">
                    <p className="text-center text-muted">
                        &copy;{currentYear}. Ethan Wanyoike. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
