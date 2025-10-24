import React, { useState } from 'react';
import { FormActions } from '../../common/FormActions';
import { FormField } from '../../common/FormField';
import { useFormSubmission } from '../../../hooks/useFormSubmission';
import { useValidation } from '../../../hooks/useValidation';
import { sanitizeTextDuringInput, sanitizeEmail } from '../../../utils/inputSanitization';

interface BaseEditFormProps<T> {
  data: T;
  onUpdate: (_data: T) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
  submitFunction: () => Promise<Response>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationRules: Record<string, any>;
  errorMessage?: string;
}

/**
 * Base edit form component that provides common functionality for all edit forms
 * Significantly reduces code duplication and provides consistent behavior
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BaseEditForm<T extends Record<string, any>>({
  data,
  onUpdate,
  onError,
  onCancel,
  submitFunction,
  validationRules,
  errorMessage = 'Failed to update. Please try again later.'
}: BaseEditFormProps<T>) {
  const [formData, setFormData] = useState<T>(data);
  const { errors, validateForm, validateSingleField, clearError } = useValidation(validationRules);

  const { isLoading, submitForm } = useFormSubmission({
    onSuccess: onUpdate,
    onError,
    submitFunction,
    errorMessage
  });

  const handleChange = (name: string, value: string) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'email') {
      sanitizedValue = sanitizeEmail(value);
    } else if (name.includes('skills') || name.includes('responsibilities')) {
      // Handle arrays separately
      return;
    } else {
      sanitizedValue = sanitizeTextDuringInput(value);
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
    
    // Validate field in real-time
    validateSingleField(name, sanitizedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm(formData)) {
      await submitForm();
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    FormActions: () => (
      <FormActions
        isLoading={isLoading}
        onCancel={onCancel}
      />
    ),
    FormField: (props: React.ComponentProps<typeof FormField>) => (
      <FormField
        {...props}
        value={String(formData[props.name] || '')}
        onChange={(value: string) => handleChange(props.name, value)}
        error={errors[props.name]}
      />
    )
  };
}
