import React, { useState } from 'react';
import DynamicForm from '../components/DynamicForm';

const DynamicFormExample: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<string>('contact');
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const formOptions = [
    { value: 'contact', label: 'Contact Form', url: '/api/forms/contact' },
    { value: 'project', label: 'Project Submission', url: '/api/forms/project' }
  ];

  const handleSuccess = (response: any) => {
    setSubmissionResult(response);
    setError('');
    console.log('Form submitted successfully:', response);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSubmissionResult(null);
    console.error('Form submission error:', errorMessage);
  };

  const currentFormOption = formOptions.find(option => option.value === selectedForm);

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <section className="bg-white shadow-sm py-4">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="h2 fw-bold text-dark mb-3">Dynamic Forms Example</h1>
              <p className="text-muted mb-4">
                This demonstrates how to render forms dynamically based on API schemas, 
                similar to Django's form rendering but for React.
              </p>

              {/* Form Selector */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label htmlFor="formSelector" className="form-label fw-semibold">
                    Select Form Type:
                  </label>
                  <select
                    id="formSelector"
                    className="form-select"
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                  >
                    {formOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Success Message */}
              {submissionResult && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                  <h5 className="alert-heading">Success!</h5>
                  <p className="mb-0">{submissionResult.message || 'Form submitted successfully!'}</p>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSubmissionResult(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                  <h5 className="alert-heading">Error</h5>
                  <p className="mb-0">{error}</p>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {/* Dynamic Form */}
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  {currentFormOption && (
                    <DynamicForm
                      key={selectedForm} // Force re-render when form type changes
                      schemaUrl={currentFormOption.url}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  )}
                </div>
              </div>

              {/* API Information */}
              <div className="mt-5">
                <h3 className="h5 fw-semibold mb-3">How it works:</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="card border-primary h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-server me-2"></i>
                          Backend (FastAPI)
                        </h5>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Defines form schemas with field types, validation, options
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Exposes <code>/api/forms/{'{form_type}'}</code> endpoints
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Returns JSON configuration for each form
                          </li>
                          <li className="mb-0">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Handles form submission with validation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-info h-100">
                      <div className="card-header bg-info text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-code-slash me-2"></i>
                          Frontend (React)
                        </h5>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Fetches form schema from API
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Dynamically renders form fields
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Handles validation based on schema rules
                          </li>
                          <li className="mb-0">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Submits data back to API endpoints
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code Examples */}
                <div className="mt-4">
                  <h4 className="h6 fw-semibold mb-3">Current API Endpoints:</h4>
                  <div className="bg-light p-3 rounded">
                    <code>
                      GET /api/forms/contact - Contact form schema<br/>
                      GET /api/forms/project - Project submission form schema<br/>
                      POST /api/contact - Submit contact form<br/>
                      POST /api/projects - Submit project form
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DynamicFormExample;
