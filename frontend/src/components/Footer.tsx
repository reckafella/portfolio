import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

    return (
        <footer id="footer" className="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="row gy-3">
                        {/* Social Links */}
                        <div className="col-lg-3 col-md-6">
                            <h4>Social Links</h4>
                            <p>Connect with me on:</p>
                            <div className="social-links d-flex">
                            <Link to="https://www.linkedin.com/in/ethanmuthoni/" target='_blank' className="linkedin"><i className="bi bi-linkedin"></i></Link>
                            <Link to="https://github.com/reckafella" target='_blank' className="github"><i className="bi bi-github"></i></Link>
                            <Link to="https://twitter.com/frmundu" target='_blank' className="twitter"><i className="bi bi-twitter-x"></i></Link>
                            <Link to="https://www.instagram.com/frmundu/" target='_blank' className="instagram"><i className="bi bi-instagram"></i></Link>
                            </div>
                        </div>

                        {/* Contact Me */}
                        <div className="col-lg-3 col-md-6 footer-links">
                            <h4>Contact Me</h4>
                            <ul>
                            <li>
                                <Link to="mailto:ethanmuthoni@mail.com">
                                <i className="bi bi-envelope me-2"></i>Send Email
                                </Link>
                            </li>
                            </ul>
                        </div>

                        {/* Useful Links */}
                        <div className="col-lg-3 col-md-6 footer-links">
                            <h4>Useful Links</h4>
                            <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/projects">Projects</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li>
                                <Link to="/sitemap" target="_blank" rel="noopener noreferrer">
                                Sitemaps <i className="bi bi-box-arrow-up-right ms-1"></i>
                                </Link>
                            </li>
                            </ul>
                        </div>

                        {/* Services Offered */}
                        <div className="col-lg-3 col-md-6 footer-links">
                            <h4>Services Offered</h4>
                            <ul>
                            <li><Link to="#">Web Development</Link></li>
                            <li><Link to="#">Software Testing</Link></li>
                            <li><Link to="#">Website Maintenance</Link></li>
                            <li><Link to="#">SEO Optimization</Link></li>
                            <li><Link to="#">Domain Registration</Link></li>
                            <li><Link to="#">Technical Writing</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Copyright */}
                <div className="copyright text-center mt-4">
                    <p>
                        <strong>
                            © {currentYear} — Ethan Wanyoike — All Rights Reserved.
                        </strong>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
