import React from 'react';
import { ReactTyped } from 'react-typed';

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
                        <h2 className="source-serif-4-bold">Ethan Wanyoike</h2>
                        <div>
                            <p>A Software Engineer specializing in:</p>
                            <p>
                                <ReactTyped
                                    strings={[
                                        'Backend Development',
                                        'Frontend Development',
                                        'Software Testing',
                                        'DevOps Engineering',
                                        'Database Management',
                                        'Cloud Computing & Security',
                                        'Machine Learning',
                                        'Technical Writing'
                                    ]}
                                    typeSpeed={100}
                                    backSpeed={100}
                                    backDelay={2000}
                                    loop
                                    className="text-decoration-underline satisfy-regular"
                                    style={{ textDecorationThickness: '4%' }}
                                />
                            </p>
                        </div>
                        <div className="d-flex flex-column mt-3">
                            <p>Let's bring your project to life!</p>
                            <p>
                                <button type="button" className="btn btn-lg bg-success text-light py-2 pacifico-regular" onClick={() => location.href = '/contact'}>
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
