import React from 'react';
//import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
    return (
        <section id="hero" className="section hero py-5">
            <div className="hero-background" data-aos="fade-in">
                <img src="https://res.cloudinary.com/dg4sl9jhw/image/upload/image_2025-07-10_at_15.55.17_wwo7tj"
                    alt="Hero Background" className="img-fluid" loading="lazy" />
            </div>
            <div className="overlay"></div>
            <div className="container text-center" data-aos="fade-in" data-aos-delay="200">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h2 className="stix-two-text-bold">Ethan Wanyoike</h2>
                        <div>
                            <p>A Software Engineer specializing in:</p>
                            <p>
                                <span className="text-decoration-underline typed source-serif-4-bold"
                                    data-typed-items="DevOps Engineering,
                                    Backend Development, Frontend Development,
                                    Technical Writing"
                                    style={{ textDecorationThickness: '10%' }}>
                                </span>
                                <span className="typed-cursor typed-cursor--blink" aria-hidden="true"></span>
                            </p>
                        </div>
                        <div className="d-flex flex-column mt-3">
                            <p>Let's bring your project to life!</p>
                            <p>
                                <button type="button" className="btn btn-lg btn-light-dark py-2 fw-bold" onClick={() => location.href = '/contact'}>
                                    Get in Touch <i className="bi bi-arrow-right"></i>
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
