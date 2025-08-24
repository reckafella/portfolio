import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedForm from '../../components/forms/UnifiedForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useProjectFormConfig } from '../../hooks/useProjects';
import { projectApi } from '../../utils/api';

export const ProjectAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use the enhanced hook with fallback handling
  const {
    data: formConfig,
    loading,
    error: configError,
    isOnline,
    isServerOnline,
    refresh
  } = useProjectFormConfig();

  const handleSubmit = async (data: Record<string, string>) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await projectApi.create(data);

      if (!response.ok) {
        const responseData = await response.json();
        if (response.status === 400 && responseData.errors) {
          throw new Error(
            Object.values(responseData.errors).flat().join(', ')
          );
        }
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Project created successfully!');

      // Navigate to project list after a delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
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
    <section className="section project container py-5">
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
              <i className="bi bi-arrow-left me-2"></i>
              Back to Projects
            </button>
          </div>

          {/* Offline/Error Banner */}
          {!isOnline && (
            <div className="mb-4">
              <AlertMessage
                type="warning"
                message="You're currently offline. Form submission with file upload may not be available."
              />
            </div>
          )}

          {!isServerOnline && (
            <div className="mb-4">
              {configError && (
              <AlertMessage
                type="warning"
                message={`Unable to load form configuration: ${configError}`}
              />
              )}
              {refresh && (
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={refresh}>
                  <i className="bi bi-sync-alt me-2"></i>
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4">
              <AlertMessage type="success" message={success} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4">
              <AlertMessage type="danger" message={error} />
            </div>
          )}

          {/* Form */}
          {formConfig ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <UnifiedForm
                  formType="add_project"
                  onSubmit={handleSubmit}
                  isSubmitting={submitting}
                  error={error || undefined}
                  success={!!success}
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
                  <i className="bi bi-exclamation-triangle mb-3"></i>
                  <h3>Form Configuration Unavailable</h3>
                  <p>
                      Unable to load the project form configuration.
                    {!isServerOnline ? 'Server is offline': ''}
                    {!isOnline
                      ? ' Please check your internet connection and try again.'
                      : ' Please try refreshing the page.'
                    }
                  </p>
                  {refresh && (
                    <button className="btn btn-primary me-2" onClick={refresh}>
                      <i className="bi bi-sync-alt me-2"></i>
                      Try Again
                    </button>
                  )}
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
    </section>
  );
};
