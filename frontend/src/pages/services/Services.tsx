import React from "react";

const ServicesSection: React.FC = () => {
    return (
        <section
            id="services"
            className="section services py-2 py-md-3 py-lg-4"
        >
            <div className="container text-center">
                <div className="section-title pb-2 pb-lg-4">
                    <h1 className="display-3">Services</h1>
                </div>
                <p className="lead text-muted">
                    List of Services I offer (Not exhaustive)
                </p>

                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {[
                        {
                            icon: "bi-laptop",
                            title: "Web Development",
                            description: "Full-stack web applications using modern frameworks and best practices.",
                        },
                        {
                            icon: "bi-check-circle",
                            title: "Quality Assurance",
                            description: "Comprehensive testing strategies to ensure your applications work flawlessly.",
                        },
                        {
                            icon: "bi-gear",
                            title: "Website Maintenance",
                            description: "Ongoing support and maintenance to keep your website running smoothly.",
                        },
                        {
                            icon: "bi-search",
                            title: "SEO Optimization",
                            description: "Improve your website's visibility and ranking in search engines.",
                        },
                        {
                            icon: "bi-globe",
                            title: "Domain Name Registration",
                            description: "Help you secure the perfect domain name for your online presence.",
                        },
                        {
                            icon: "bi-pencil-square",
                            title: "Technical Writing",
                            description: "Clear and comprehensive documentation for your technical projects.",
                        },
                    ].map((service, index) => (
                        <div key={index} className="col">
                            <div className="card h-100 border shadow-sm">
                                <div className="card-body text-center">
                                    <h3 className="card-title h4">
                                        {service.title}
                                    </h3>
                                    <div className="mb-3">
                                        <i
                                            className={`${service.icon} display-3 text-success`}
                                        ></i>
                                    </div>
                                    <p className="card-text text-muted">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <hr />
                <p className="text-center text-muted">
                    &copy; {new Date().getFullYear()} Ethan Muthoni. All rights
                    reserved.
                </p>
            </div>
        </section>
    );
};

export default ServicesSection;
