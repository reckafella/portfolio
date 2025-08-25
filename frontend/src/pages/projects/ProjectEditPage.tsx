import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UnifiedForm from '../../components/forms/UnifiedForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useProjectFormConfig, useUpdateProject, useProjectBySlug } from '../../hooks/queries/projectQueries';

export const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
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

  const updateProjectMutation = useUpdateProject();
  const [initialData, setInitialData] = useState<Record<string, string>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Populate initial data when project is loaded
  useEffect(() => {
    if (project && !dataLoaded) {
      const formData: Record<string, string> = {
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

  const handleSubmit = async (data: Record<string, string>) => {
    await updateProjectMutation.mutateAsync({
      slug: String(slug),
      data
    });
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
                                <p className="lead text-muted">
                                    Editing: <strong>{project.title}</strong>
                                </p>
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
                                        config={formConfig}
                                        onSubmit={handleSubmit}
                                        submitButtonText="Update Project"
                                        loadingText="Updating..."
                                        isLoading={updateProjectMutation.isPending}
                                        initialData={initialData}
                                        showProgressBar={true}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Loading State for Form */}
                        {updateProjectMutation.isPending && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-opacity-50" style={{ zIndex: 1050 }}>
                                <div className="bg-white p-4 rounded shadow">
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
