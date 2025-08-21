import React, { useState, useEffect } from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  image_url?: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/v1/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100  d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 ">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100  d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="text-danger display-1 mb-3">⚠️</div>
          <h2 className="fw-bold  mb-2">Error Loading Projects</h2>
          <p className="">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="section projects">
      {/* Header */}
      <div id="projects-header" className="section py-5 shadow-sm">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="display-4 fw-bold  mb-4">My Projects</h1>
                <p className="lead  mx-auto" style={{ maxWidth: '600px' }}>
                  A showcase of my recent work and personal projects. Each project 
                  represents a unique challenge and learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div id="projects-grid" className="section py-5">
        <div className="container">
          {projects.length === 0 ? (
            <div className="text-center py-5">
              <div className=" display-1 mb-4">📁</div>
              <h3 className="fw-semibold  mb-2">No Projects Yet</h3>
              <p className="">
                Projects will appear here once they're added to the portfolio.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {projects.map((project) => (
                <div key={project.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 hover-shadow">
                    {project.image_url && (
                      <div className="card-img-top" style={{ height: '200px' }}>
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    )}
                    
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-bold mb-3">
                        {project.title}
                      </h5>

                      <p className="card-text mb-4 flex-grow-1">
                        {project.description}
                      </p>
                      
                      <div className="mb-3">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="badge bg-primary me-2 mb-2"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="d-flex gap-3 mt-auto">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark btn-sm d-flex align-items-center"
                          >
                            <i className="bi bi-github me-2"></i>
                            Code
                          </a>
                        )}
                        
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm d-flex align-items-center"
                          >
                            <i className="bi bi-box-arrow-up-right me-2"></i>
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;
