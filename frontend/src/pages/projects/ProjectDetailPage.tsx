import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaTags } from '@/hooks/useMetaTags';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useProjectBySlug, useDeleteProject } from '@/hooks/queries/projectQueries';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { canEditProjects, canDeleteProjects } = useStaffPermissions();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use TanStack Query to fetch project data
  const { 
    data: project, 
    isLoading: loading, 
    error
  } = useProjectBySlug(slug || '');

  const deleteProjectMutation = useDeleteProject();
  usePageTitle(project?.title || 'Project Details');
  
  // Set meta tags for SEO and social sharing
  useMetaTags({
    title: project?.title || 'Project Details',
    description: project?.description || 'View this project on Ethan Wanyoike\'s portfolio',
    keywords: `${project?.title || 'project'}, portfolio, software development, web development, Ethan Wanyoike`,
    ogTitle: `${project?.title || 'Project'} - Ethan Wanyoike`,
    ogDescription: project?.description || 'View this project on Ethan Wanyoike\'s portfolio',
    ogType: 'website',
    ogUrl: `${window.location.origin}/projects/${slug}`,
    ogImage: project?.first_image?.optimized_image_url || project?.first_image?.cloudinary_image_url,
    twitterTitle: `${project?.title || 'Project'} - Ethan Wanyoike`,
    twitterDescription: project?.description || 'View this project on Ethan Wanyoike\'s portfolio',
    twitterImage: project?.first_image?.optimized_image_url || project?.first_image?.cloudinary_image_url,
    canonical: `${window.location.origin}/projects/${slug}`
  });

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


  const nextImage = () => {
    if (project?.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project?.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <LoadingSpinner text="Loading project details..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <AlertMessage
              type="danger"
              message="Project not found or failed to load."
            />
            <div className="text-center mt-3">
              <Link to="/projects" className="btn btn-primary">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title with Breadcrumbs */}
      <div className="page-title">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <nav className="breadcrumbs">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/projects" className="text-decoration-none">Projects</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {project.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section id="project" className="project project-details">
        <div className="container">
          <div className="section-title text-center">
            <h2 className="mb-3">{project.title}</h2>
          </div>
          
          <div className="row justify-content-center align-items-center gy-4 project-details-row pb-5 mb-5">
            {/* Project Gallery */}
            <div className="col-12 col-lg-8">
              <div className="project-details-slider">
                {project.images && project.images.length > 0 ? (
                  <div className="position-relative">
                    <div className="project-gallery">
                      <img
                        src={project.images[currentImageIndex]?.optimized_image_url || project.images[currentImageIndex]?.cloudinary_image_url}
                        alt={`${project.title} - Image ${currentImageIndex + 1}`}
                        className="img-fluid rounded shadow"
                        style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                      />
                      
                      {/* Gallery Navigation */}
                      {project.images.length > 1 && (
                        <>
                          <button
                            className="btn btn-outline-light position-absolute top-50 start-0 translate-middle-y ms-3"
                            onClick={prevImage}
                            style={{ zIndex: 10 }}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          <button
                            className="btn btn-outline-light position-absolute top-50 end-0 translate-middle-y me-3"
                            onClick={nextImage}
                            style={{ zIndex: 10 }}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Gallery Indicators */}
                    {project.images.length > 1 && (
                      <div className="d-flex justify-content-center mt-3 gap-2">
                        {project.images.map((_: unknown, index: number) => (
                          <button
                            key={index}
                            className={`btn btn-sm ${index === currentImageIndex ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setCurrentImageIndex(index)}
                            style={{ width: '12px', height: '12px', borderRadius: '50%', padding: 0 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-image display-1 text-muted"></i>
                    <p className="text-muted mt-3">No images available for this project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Information Sidebar */}
            <div className="col-12 col-lg-4">
              <div className="row g-4">
                {/* Project Information Card */}
                <div className="col-12 col-md-6 col-lg-12">
                  <div className="project-info p-3 rounded border">
                    <h3 className="mb-3 border-bottom pb-2">Project Information</h3>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex align-items-center">
                        <i className="bi bi-tag-fill me-2 text-primary"></i>
                        <strong>Category:</strong> 
                        <span className="ms-2">{project.category || 'Web Development'}</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center">
                        <i className="bi bi-building me-2 text-primary"></i>
                        <strong>Client:</strong> 
                        <span className="ms-2">{project.client || 'Personal'}</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        <strong>Date:</strong> 
                        <span className="ms-2">{formatDate(project.created_at)}</span>
                      </li>
                      {project.project_url && (
                        <li className="list-group-item d-flex align-items-center">
                          <i className="bi bi-link-45deg me-2 text-primary"></i>
                          <strong>URL:</strong>
                          <a 
                            href={project.project_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ms-2 text-decoration-none"
                          >
                            Visit Project <i className="bi bi-box-arrow-up-right ms-1"></i>
                          </a>
                        </li>
                      )}
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        {(canEditProjects || canDeleteProjects) && (
                          <div className="btn-group gap-3" role="group">
                            {canEditProjects && (
                              <button
                                className="btn btn-primary btn-sm"
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
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: project.title,
                                text: project.description,
                                url: window.location.href
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              // You could add a toast notification here
                              alert('Project URL copied to clipboard!');
                            }
                          }}
                        >
                          <i className="bi bi-share-fill me-1"></i>
                          Share
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Project Description Card */}
                <div className="col-12 col-md-6 col-lg-12">
                  <div className="project-description p-3 rounded border">
                    <h3 className="mb-3 border-bottom pb-2">Project Overview</h3>
                    <div 
                      className="project-description-content"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="row mb-5">
              <div className="col-12">
                <h3 className="text-center mb-4">Technologies Used</h3>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {project.technologies.map((tech: string, index: number) => (
                    <span key={index} className="badge bg-secondary fs-6">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Images Gallery */}
          {project.images && project.images.length > 1 && (
            <div className="row mb-5">
              <div className="col-12">
                <h3 className="text-center mb-4">Project Gallery</h3>
                <div className="row g-3">
                  {project.images.map((image: { id: string; optimized_image_url?: string; cloudinary_image_url?: string }, index: number) => (
                    <div key={image.id} className="col-md-6 col-lg-4">
                      <div className="card h-100">
                        <img 
                          src={image.optimized_image_url || image.cloudinary_image_url} 
                          alt={`${project.title} - Image ${index + 1}`}
                          className="card-img-top"
                          style={{ height: '250px', objectFit: 'cover' }}
                          onClick={() => setCurrentImageIndex(index)}
                          role="button"
                        />
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title">Image {index + 1}</h6>
                          <button
                            className="btn btn-outline-primary btn-sm mt-auto"
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-flex" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title"
                  style={{ color: '#dc3545' }}
                >
                  Confirm Project Deletion!
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete "{project.title}"?</p>
                <p
                  className='mb-0'
                  style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#dc3545' }}
                >
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
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
    </>
  );
};
