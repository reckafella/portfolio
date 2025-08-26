import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useProjectBySlug, useDeleteProject } from '@/hooks/queries/projectQueries';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { canEditProjects, canDeleteProjects } = useStaffPermissions();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use TanStack Query to fetch project data
  const { 
    data: project, 
    isLoading: loading, 
    error,
    refetch
  } = useProjectBySlug(slug || '');

  const deleteProjectMutation = useDeleteProject();
  usePageTitle(project?.title || 'Project Details');

  const handleDelete = async () => {
    if (!project) return;
    
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      navigate('/projects');
    } catch {
      // Error is handled by the mutation's error state
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

  if (!slug) {
    return (
      <section className="section project">
        <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <div className="section-title">
                <h2 className="fw-bold">Project Not Found</h2>
              </div>
              <AlertMessage type="danger" message="No project slug provided" />
              <Link to="/projects" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section project">
        <div className="section-title">
          <h2 className="fw-bold">Project Details</h2>
        </div>
        <div className="container py-5">
          <LoadingSpinner text="Loading project..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="section-title">
              <h2 className="fw-bold">Project Not Found</h2>
            </div>
            <AlertMessage type="danger" message={error.message} />
            <div className="mt-3">
              <button className="btn btn-outline-primary me-2" onClick={() => refetch()}>
                <i className="bi bi-sync-alt me-2"></i>
                Try Again
              </button>
              <Link to="/projects" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="section-title">
              <h2 className="fw-bold">Project Not Found</h2>
            </div>
            <AlertMessage type="warning" message="Project not found" />
            <Link to="/projects" className="btn btn-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="section project">
      <div className="container py-5">
      <div className="section-title">
        <h2 className="fw-bold">{project.title}</h2>
      </div>
      {/* Navigation
      <div className="row mb-4">
        <div className="col-12">
          <Link to="/projects" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Projects
          </Link>
        </div>
      </div> */}

      {/* Project Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <span className={`badge bg-${getBadgeColor(project.project_type)} fs-6`}>
                  {project.project_type}
                </span>
                <span className="badge bg-secondary fs-6">{project.category}</span>
                {project.client && (
                  <span className="badge bg-info fs-6">Client: {project.client}</span>
                )}
              </div>
            </div>
            
            {/* Edit/Delete Buttons */}
            {(canEditProjects || canDeleteProjects) && (
              <div className="btn-group" role="group">
                {canEditProjects && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/projects/edit/${project.slug}`)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                )}
                {canDeleteProjects && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </button>
                )}
              </div>
            )}
            {project.project_url && (
              <a 
                href={project.project_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="bi bi-external-link-alt me-2"></i>
                View Live
              </a>
            )}
          </div>
          <p className="lead text-muted">{project.description}</p>
          <div className="text-muted small">
            <i className="bi bi-calendar me-2"></i>
            Created: {formatDate(project.created_at)}
            {project.updated_at !== project.created_at && (
              <span className="ms-3">
                <i className="bi bi-pencil me-2"></i>
                Updated: {formatDate(project.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Project Images */}
      {project.images && project.images.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="h3 mb-4">Project Gallery</h2>
            <div className="row g-3">
              {project.images.map((image: { id: number; cloudinary_image_url: string; optimized_image_url: string; live: boolean }, index: number) => (
                <div key={image.id} className="col-md-6 col-lg-4">
                  <div className="card h-100">
                    <img 
                      src={image.optimized_image_url || image.cloudinary_image_url} 
                      alt={`${project.title} - Image ${index + 1}`}
                      className="card-img-top"
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    <div className="card-body p-2">
                      <small className="text-muted">
                        Image {index + 1}
                        {!image.live && <span className="badge bg-warning ms-2">Draft</span>}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Videos */}
      {project.videos && project.videos.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="h3 mb-4">Project Videos</h2>
            <div className="row g-3">
              {project.videos.map((video: { id: number; youtube_url: string; thumbnail_url: string; live: boolean }, index: number) => (
                <div key={video.id} className="col-md-6 col-lg-4">
                  <div className="card h-100">
                    <div className="position-relative">
                      <img 
                        src={video.thumbnail_url} 
                        alt={`${project.title} - Video ${index + 1}`}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <a 
                          href={video.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-danger btn-lg rounded-circle"
                        >
                          <i className="bi bi-youtube"></i>
                        </a>
                      </div>
                    </div>
                    <div className="card-body p-2">
                      <small className="text-muted">
                        Video {index + 1}
                        {!video.live && <span className="badge bg-warning ms-2">Draft</span>}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Actions */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/projects" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Projects
            </Link>
            {project.project_url && (
              <a 
                href={project.project_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="bi bi-external-link-alt me-2"></i>
                View Live Project
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this project?</p>
                <p className="text-muted">
                  <strong>"{project?.title}"</strong>
                </p>
                <p className="text-danger">
                  <small>This action cannot be undone.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteProjectMutation.isPending}
                >
                  {deleteProjectMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="me-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <div className="modal-backdrop show"></div>}
      </div>
    </section>
  );
};
