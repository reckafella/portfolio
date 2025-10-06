import React, { useState } from 'react';
import { BsSave, BsX } from 'react-icons/bs';
import { aboutApi, ProfileData } from '../../../utils/aboutApi';
import { handleApiError } from '../../../utils/api';

interface ProfileEditFormProps {
  data: ProfileData;
  onUpdate: (_data: ProfileData) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: data.name,
    title: data.title,
    location: data.location,
    email: data.email,
    summary: data.summary
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.summary.trim()) errors.summary = 'Summary is required';
    else if (formData.summary.trim().length < 50) {
      errors.summary = 'Summary must be at least 50 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await aboutApi.updateProfile(formData);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onUpdate(result.data);
        } else {
          onError(result.message || 'Failed to update profile');
        }
      } else {
        // Handle different HTTP status codes
        if (response.status === 401) {
          onError('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.errors) {
            const formattedErrors: Record<string, string> = {};
            Object.keys(errorData.errors).forEach(field => {
              const fieldErrors = errorData.errors[field];
              formattedErrors[field] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
            });
            setValidationErrors(formattedErrors);
          } else {
            onError(errorData.message || 'Validation failed');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      onError('Failed to update profile. Please try again later.');
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="name" className="form-label">
              <strong>Full Name</strong> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {validationErrors.name && (
              <div className="invalid-feedback">{validationErrors.name}</div>
            )}
          </div>
          
          <div className="col-md-6 mb-3">
            <label htmlFor="title" className="form-label">
              <strong>Professional Title</strong> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
            />
            {validationErrors.title && (
              <div className="invalid-feedback">{validationErrors.title}</div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="location" className="form-label">
              <strong>Location</strong> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.location ? 'is-invalid' : ''}`}
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isLoading}
            />
            {validationErrors.location && (
              <div className="invalid-feedback">{validationErrors.location}</div>
            )}
          </div>
          
          <div className="col-md-6 mb-3">
            <label htmlFor="email" className="form-label">
              <strong>Email Address</strong> <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <div className="invalid-feedback">{validationErrors.email}</div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="summary" className="form-label">
            <strong>Professional Summary</strong> <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-control ${validationErrors.summary ? 'is-invalid' : ''}`}
            id="summary"
            name="summary"
            rows={4}
            value={formData.summary}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="form-text">{formData.summary.length}/50 minimum characters</div>
          {validationErrors.summary && (
            <div className="invalid-feedback">{validationErrors.summary}</div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-success btn-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <BsSave className="me-2" />
                Save
              </>
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <BsX className="me-2" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
