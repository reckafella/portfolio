import React, { useState, useEffect } from 'react';

// Type definitions
interface FormFieldOption {
  value: string;
  label: string;
}

interface FormValidation {
  min_length?: number;
  max_length?: number;
  pattern?: string;
}

interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  validation?: FormValidation;
  help_text?: string;
}

interface FormSchema {
  form_id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submit_url: string;
  method: string;
}

interface DynamicFormProps {
  schemaUrl: string;
  onSubmit?: (data: any) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schemaUrl,
  onSubmit,
  onSuccess,
  onError
}) => {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch form schema
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch(schemaUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch form schema');
        }
        const schemaData = await response.json();
        setSchema(schemaData);
        
        // Initialize form data with default values
        const initialData: Record<string, any> = {};
        schemaData.fields.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      } catch (error) {
        console.error('Error fetching form schema:', error);
        onError?.('Failed to load form configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [schemaUrl]);

  // Handle field value changes
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  // Validate individual field
  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (value && field.validation) {
      const { min_length, max_length, pattern } = field.validation;

      if (min_length && value.toString().length < min_length) {
        return `${field.label} must be at least ${min_length} characters`;
      }

      if (max_length && value.toString().length > max_length) {
        return `${field.label} must be no more than ${max_length} characters`;
      }

      if (pattern && !new RegExp(pattern).test(value.toString())) {
        return `${field.label} format is invalid`;
      }
    }

    return '';
  };

  // Validate entire form
  const validateForm = (): boolean => {
    if (!schema) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    schema.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schema || !validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Call custom onSubmit if provided
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission to the schema's submit_url
        const response = await fetch(schema.submit_url, {
          method: schema.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Form submission failed');
        }

        const result = await response.json();
        onSuccess?.(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Render form field based on type
  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const fieldValue = formData[field.name] || '';

    const commonProps = {
      id: field.name,
      name: field.name,
      className: `form-control ${fieldError ? 'is-invalid' : ''}`,
      placeholder: field.placeholder,
      required: field.required,
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleFieldChange(field.name, e.target.value);
      }
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'email':
      case 'url':
      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading form...</span>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="alert alert-danger" role="alert">
        Failed to load form configuration.
      </div>
    );
  }

  return (
    <div className="dynamic-form">
      {/* Form Header */}
      <div className="mb-4">
        <h2 className="h4 fw-bold text-dark mb-2">{schema.title}</h2>
        {schema.description && (
          <p className="text-muted mb-0">{schema.description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {schema.fields.map(field => (
          <div key={field.name} className="mb-3">
            {/* Field Label */}
            <label htmlFor={field.name} className="form-label fw-semibold">
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </label>

            {/* Field Input */}
            {renderField(field)}

            {/* Field Error */}
            {errors[field.name] && (
              <div className="invalid-feedback d-block">
                {errors[field.name]}
              </div>
            )}

            {/* Help Text */}
            {field.help_text && !errors[field.name] && (
              <div className="form-text">
                {field.help_text}
              </div>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
