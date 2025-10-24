import React from 'react';
import { BsSave, BsX } from 'react-icons/bs';
import { LoadingSpinner } from './LoadingSpinner';

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  className?: string;
}

/**
 * Reusable form action buttons component
 * Provides consistent styling and loading states for all forms
 */
export const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  className = ''
}) => {
  return (
    <div className={`d-flex gap-2 ${className}`}>
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="d-flex align-items-center gap-1">
            <LoadingSpinner size="sm" text="Saving..." />
            Saving...
          </div>
        ) : (
          <div className="d-flex align-items-center gap-1">
            <BsSave className="me-2" />
            {submitText}
          </div>
        )}
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={onCancel}
        disabled={isLoading}
      >
        <BsX size={20} />
        {cancelText}
      </button>
    </div>
  );
};
