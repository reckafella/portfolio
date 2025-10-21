import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import UnifiedForm from '@/components/forms/UnifiedForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useProjectFormConfig, useUpdateProject, useProjectBySlug } from '@/hooks/queries/projectQueries';
import { tabSyncService, TabSyncMessage } from '@/services/tabSyncService';
import { useAuth } from '@/hooks/useAuth';

export const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  // Use TanStack Query hooks
  const { 
    data: formConfig, 
    isLoading: configLoading, 
    error: configError,
  } = useProjectFormConfig();

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectBySlug(String(slug));

  usePageTitle(`Edit Project ${project?.title || 'Edit Project'}`);

  const updateProjectMutation = useUpdateProject();
  const [initialData, setInitialData] = useState<Record<string, string | number | boolean | File | File[]>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [beingEditedBy, setBeingEditedBy] = useState<string | null>(null);
  const [showContentUpdatedWarning, setShowContentUpdatedWarning] = useState(false);

  // Populate initial data when project is loaded
  useEffect(() => {
    if (project && !dataLoaded) {
      const formData: Record<string, string | number | boolean | File | File[]> = {
        title: project.title || '',
        description: project.description || '',
        short_description: project.short_description || '',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        status: project.status || '',
        priority: project.priority?.toString() || '',
        is_featured: project.is_featured ? 'true' : 'false',
        technologies: Array.isArray(project.technologies) 
          ? project.technologies.join(', ') 
          : project.technologies || '',
        slug: project.slug || '',
      };
      setInitialData(formData);
      setDataLoaded(true);
    }
  }, [project, dataLoaded]);

  // Broadcast edit start when editing begins
  useEffect(() => {
    if (slug && dataLoaded) {
      tabSyncService.broadcastEditStart('project', slug, user?.username);
    }

    return () => {
      if (slug) {
        tabSyncService.broadcastEditEnd('project', slug);
      }
    };
  }, [slug, dataLoaded, user]);

  // Listen for cross-tab edit and content update events
  useEffect(() => {
    const handleTabSyncMessage = (message: TabSyncMessage) => {
      if (message.type === 'EDIT_START' && message.payload.editType === 'project' && message.payload.editSection === slug) {
        const editor = message.payload.editUser || 'Another user';
        setBeingEditedBy(editor);
      } else if (message.type === 'EDIT_END' && message.payload.editType === 'project' && message.payload.editSection === slug) {
        setBeingEditedBy(null);
      } else if (message.type === 'CONTENT_UPDATED' && message.payload.contentType === 'project' && message.payload.contentId === slug) {
        // Show warning that content was updated in another tab
        setShowContentUpdatedWarning(true);
      }
    };

    tabSyncService.addListener(handleTabSyncMessage);

    return () => {
      tabSyncService.removeListener(handleTabSyncMessage);
    };
  }, [slug]);

  const handleSubmit = async (data: Record<string, string | boolean | File | File[]>) => {
    await updateProjectMutation.mutateAsync({
      slug: String(slug),
      data
    });

    if (slug) {
      tabSyncService.broadcastContentUpdate('project', slug);
    }
    
    // Navigate to project detail after successful update
    navigate(`/projects/${project?.slug || slug}`);
  };

  if (configLoading || projectLoading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <LoadingSpinner text="Loading project data..." />
          </div>
        </div>
      </div>
    );
  }

  if (configError || projectError || !project) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <AlertMessage
              type="danger"
              message="Failed to load project data. Please try again."
            />
            <div className="text-center mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/projects')}
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

    return (
        <section className="project section">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="section">
                            <h2 className="fw-bold">Edit Project</h2>
                        </div>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <p className="lead text-muted mb-2">
                                    Editing: <strong>{project.title}</strong>
                                </p>
                                {beingEditedBy && (
                                    <div className="alert alert-warning py-2" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        <strong>{beingEditedBy}</strong> is also editing this project
                                    </div>
                                )}
                                {showContentUpdatedWarning && (
                                    <div className="alert alert-info py-2" role="alert">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        Content updated in another tab.
                                        <button 
                                            className="btn btn-sm btn-link p-0 ms-2"
                                            onClick={() => window.location.reload()}
                                        >
                                            Reload to see changes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="btn-group">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate('/projects')}
                                >
                                    Back to Projects
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => navigate(`/projects/${project.slug || slug}`)}
                                >
                                    View Project
                                </button>
                            </div>
                        </div>
                        {/* Error Display */}
                        {updateProjectMutation.isError && (
                            <AlertMessage
                                type="danger"
                                message="Failed to update project. Please check your input and try again."
                                className="mb-4"
                            />
                        )}
                        {/* Form */}
                        {formConfig && dataLoaded && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <UnifiedForm
                                        formType="update_project"
                                        onSubmit={handleSubmit}
                                        isSubmitting={updateProjectMutation.isPending}
                                        error={updateProjectMutation.isError ? "Failed to update project. Please try again." : undefined}
                                        title="Edit Project"
                                        slug={project.slug}
                                        submitButtonText="Update Project"
                                        loadingText="Updating..."
                                        initialData={initialData as Record<string, string | boolean>}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Loading State for Form */}
                        {updateProjectMutation.isPending && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-opacity-50" style={{ zIndex: 1050 }}>
                                <div className="p-4 rounded shadow">
                                    <LoadingSpinner text="Updating project..." />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
