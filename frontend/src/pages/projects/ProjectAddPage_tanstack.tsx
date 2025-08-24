import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedForm from '../../components/forms/UnifiedForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useProjectFormConfig, useCreateProject } from '../../hooks/queries/projectQueries';

export const ProjectAddPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use TanStack Query hooks
  const { 
    data: formConfig, 
    isLoading: loading, 
    error: configError,
    refetch
  } = useProjectFormConfig();

  const createProjectMutation = useCreateProject();

  const handleSubmit = async (data: Record<string, string>) => {
    await createProjectMutation.mutateAsync(data);
    // Navigate to project list after successful creation
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <LoadingSpinner text="Loading form configuration..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="display-4 fw-bold">Add Project</h1>
              <p className="lead text-muted">Create a new project for your portfolio</p>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/projects')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Projects
            </button>
          </div>

          {/* Configuration Error */}
          {configError && (
            <div className="mb-4">
              <AlertMessage 
                type="warning" 
                message={`Unable to load form configuration: ${configError.message}`} 
              />
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => refetch()}>
                <i className="fas fa-sync-alt me-2"></i>
                Try Again
              </button>
            </div>
          )}

          {/* Form */}
          {formConfig ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <UnifiedForm
                  formType="add_project"
                  onSubmit={handleSubmit}
                  isSubmitting={createProjectMutation.isPending}
                  error={createProjectMutation.error?.message}
                  success={createProjectMutation.isSuccess}
                  title="Add New Project"
                  submitButtonText="Create Project"
                  loadingText="Creating project..."
                />
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="text-muted">
                  <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                  <h3>Form Configuration Unavailable</h3>
                  <p>
                    Unable to load the project form configuration.
                    Please try refreshing the page.
                  </p>
                  <button className="btn btn-primary me-2" onClick={() => refetch()}>
                    <i className="fas fa-sync-alt me-2"></i>
                    Try Again
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/projects')}
                  >
                    Back to Projects
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
