import React from 'react';
import { Link } from 'react-router-dom';


const AboutSection: React.FC = () => {
    return (
        <>
            {/* About Section */}
            <section id="about" className="section about py-4">
                <div className="container section-title">
                <h2>About Me</h2>
                <p>Get to Know Me Better</p>
                </div>

                <div className="container">
                <div className="row gy-4 justify-content-between">
                    <div className="col-lg-4 text-center">
                    <img 
                        src="https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/portfolio/profile/reckafella"
                        alt="Profile Picture" 
                        className="img-fluid rounded-circle shadow-lg mb-2 w-75" 
                        style={{ maxWidth: '390px' }} 
                        loading="lazy"
                    />
                    <div className="social-links mt-3">
                        <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>
                        <a href="#" className="github"><i className="bi bi-github"></i></a>
                        <a href="#" className="twitter"><i className="bi bi-twitter-x"></i></a>
                        <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
                        <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
                    </div>
                    </div>
                    <div className="col-lg-8 content">
                    <h2>Software Engineer</h2>
                    <p className="py-3 fst-italic">
                        I am a passionate software engineer with expertise in backend development, cloud architecture, and
                        DevOps practices. With a strong analytical mindset and attention to detail, I deliver robust solutions that drive
                        business growth and enhance user experience.
                    </p>
                    <div className="row">
                        <div className="col-lg-7">
                        <ul className="list-unstyled">
                            <li className="mb-2">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>Email:</strong> ethanmuthoni@mail.com
                            </li>
                            <li className="mb-2">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>Education:</strong> Software Engineering
                            </li>
                        </ul>
                        </div>
                        <div className="col-lg-5">
                        <ul className="list-unstyled">
                            <li className="mb-2">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>Experience:</strong> 2+ Years
                            </li>
                            <li className="mb-2">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>Availability:</strong> Open to Opportunities
                            </li>
                        </ul>
                        </div>
                    </div>
                    <p className="py-2">
                        I thrive in collaborative environments and am committed to continuous learning and professional growth. My approach combines technical expertise with effective communication skills to deliver solutions that exceed expectations. Whether working on complex backend systems or streamlining deployment processes, I'm dedicated to creating efficient, scalable, and maintainable code.
                    </p>
                    <div className="mt-4 d-flex justify-content-center">
                        <Link to="/about" className="btn btn-secondary me-3">
                        <i className="bi bi-file-earmark-text me-1"></i> View Resume
                        </Link>
                        <Link to="/contact" className="btn btn-success">
                        <i className="bi bi-envelope me-1"></i> Contact Me
                        </Link>
                    </div>
                    </div>
                </div>
                </div>
            </section>
        </>
    );
}

export default AboutSection;
