import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';

interface Project {
  id: number;
  title: string;
  description: string;
  project_type: string;
  category: string;
  client?: string;
  project_url?: string;
  created_at: string;
  updated_at: string;
  slug: string;
  live: boolean;
  images: Array<{
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
    live: boolean;
  }>;
  videos: Array<{
    id: number;
    youtube_url: string;
    thumbnail_url: string;
    live: boolean;
  }>;
}

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProject(slug);
    }
  }, [slug]);

  const fetchProject = async (projectSlug: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/projects/${projectSlug}/`);
      
      if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'web': 'primary',
      'mobile': 'success',
      'desktop': 'info',
      'api': 'warning',
      'other': 'secondary'
    };
    return colors[type.toLowerCase()] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <AlertMessage type="danger" message={error} />
        <div className="mt-3">
          <Link to="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5">
        <AlertMessage type="warning" message="Project not found" />
        <div className="mt-3">
          <Link to="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/projects">Projects</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {project.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Project Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="display-5 fw-bold mb-2">{project.title}</h1>
              <div className="mb-3">
                <span className={`badge bg-${getBadgeColor(project.project_type)} me-2`}>
                  {project.project_type}
                </span>
                <span className="badge bg-light text-dark me-2">
                  {project.category}
                </span>
                {!project.live && (
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-eye-slash me-1"></i>
                    Draft
                  </span>
                )}
              </div>
            </div>
            
            <div className="btn-group" role="group">
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  View Live
                </a>
              )}
              <Link
                to={`/projects/${project.id}/edit`}
                className="btn btn-outline-secondary"
              >
                <i className="fas fa-edit me-2"></i>
                Edit
              </Link>
            </div>
          </div>

          {/* Project Meta */}
          <div className="row text-muted small mb-4">
            <div className="col-md-6">
              <i className="fas fa-calendar me-1"></i>
              Created: {formatDate(project.created_at)}
            </div>
            <div className="col-md-6">
              <i className="fas fa-clock me-1"></i>
              Updated: {formatDate(project.updated_at)}
            </div>
            {project.client && project.client !== 'Personal' && (
              <div className="col-md-6 mt-1">
                <i className="fas fa-user me-1"></i>
                Client: {project.client}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Images */}
      {project.images.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <h3 className="h4 mb-3">
              <i className="fas fa-images me-2"></i>
              Project Images
            </h3>
            <div className="row g-3">
              {project.images.filter(img => img.live).map((image, index) => (
                <div key={image.id} className="col-lg-4 col-md-6">
                  <div className="card">
                    <img
                      src={image.optimized_image_url || image.cloudinary_image_url}
                      className="card-img-top"
                      alt={`${project.title} - Image ${index + 1}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Videos */}
      {project.videos.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <h3 className="h4 mb-3">
              <i className="fas fa-video me-2"></i>
              Project Videos
            </h3>
            <div className="row g-3">
              {project.videos.filter(video => video.live).map((video) => (
                <div key={video.id} className="col-lg-6">
                  <div className="card">
                    <div className="card-body">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary w-100"
                      >
                        <i className="fab fa-youtube me-2"></i>
                        Watch Video
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Description */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="h4 mb-3">
            <i className="fas fa-info-circle me-2"></i>
            About This Project
          </h3>
          <div className="card">
            <div className="card-body">
              <div 
                className="project-description"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="row">
        <div className="col-12 text-center">
          <Link to="/projects" className="btn btn-outline-primary me-3">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Projects
          </Link>
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="fas fa-external-link-alt me-2"></i>
              Visit Project
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
