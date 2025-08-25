import React from 'react';

const ServicesSection: React.FC = () => {
    return (
        <section id="services" className="section services py-2 py-md-3 py-lg-4">
        <div className="container">
          <div className="section-title">
            <h2>Services</h2>
            <p className="">What I Can Do For You</p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {[
              {
                icon: "bi-laptop",
                title: "Web Development",
                description: "Full-stack web applications using modern frameworks and best practices."
              },
              {
                icon: "bi-check-circle",
                title: "Software Testing",
                description: "Comprehensive testing strategies to ensure your applications work flawlessly."
              },
              {
                icon: "bi-gear",
                title: "Website Maintenance",
                description: "Ongoing support and maintenance to keep your website running smoothly."
              },
              {
                icon: "bi-search",
                title: "SEO Optimization",
                description: "Improve your website's visibility and ranking in search engines."
              },
              {
                icon: "bi-globe",
                title: "Domain Registration",
                description: "Help you secure the perfect domain name for your online presence."
              },
              {
                icon: "bi-pencil-square",
                title: "Technical Writing",
                description: "Clear and comprehensive documentation for your technical projects."
              }
            ].map((service, index) => (
              <div key={index} className="col">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className={`${service.icon} display-4 text-primary`}></i>
                    </div>
                    <h3 className="card-title h5">{service.title}</h3>
                    <p className="card-text ">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}

export default ServicesSection;
