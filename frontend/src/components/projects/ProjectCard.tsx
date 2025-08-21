import React from 'react';
import { Link } from 'react-router-dom';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';

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
  first_image?: {
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
  };
  images: Array<{
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
    live: boolean;
  }>;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { canEditProjects } = useStaffPermissions();
  
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = () => {
    if (project.first_image?.optimized_image_url) {
      return project.first_image.optimized_image_url;
    }
    if (project.first_image?.cloudinary_image_url) {
      return project.first_image.cloudinary_image_url;
    }
    return '/static/assets/images/placeholder-project.jpg';
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

  return (
    <div className="card h-100 shadow-sm project-card">
      {/* Project Image */}
      <div className="position-relative">
        <img
          src={getImageUrl()}
          className="card-img-top"
          alt={project.title}
          style={{ height: '200px', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/static/assets/images/placeholder-project.jpg';
          }}
        />
        {!project.live && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-warning text-dark">
              <i className="fas fa-eye-slash me-1"></i>
              Draft
            </span>
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        {/* Project Type & Category */}
        <div className="mb-2">
          <span className={`badge bg-${getBadgeColor(project.project_type)} me-2`}>
            {project.project_type}
          </span>
          {project.category && (
            <span className="badge bg-light text-dark">
              {project.category}
            </span>
          )}
        </div>

        {/* Project Title */}
        <h5 className="card-title">
          <Link 
            to={`/projects/${project.slug}`} 
            className="text-decoration-none text-inherit"
          >
            {project.title}
          </Link>
        </h5>

        {/* Client */}
        {project.client && (
          <p className="text-muted small mb-2">
            <i className="fas fa-user me-1"></i>
            {project.client}
          </p>
        )}

        {/* Description */}
        <p className="card-text text-muted flex-grow-1">
          {truncateText(project.description)}
        </p>

        {/* Card Footer */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="fas fa-calendar me-1"></i>
              {formatDate(project.created_at)}
            </small>
            
            <div className="btn-group" role="group">
              <Link
                to={`/projects/${project.slug}`}
                className="btn btn-sm btn-outline-primary"
                title="View Project"
              >
                <i className="fas fa-eye"></i>
              </Link>
              
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-success"
                  title="Visit Live Site"
                >
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
              
              {canEditProjects && (
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="btn btn-sm btn-outline-secondary"
                  title="Edit Project"
                >
                  <i className="fas fa-edit"></i>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
