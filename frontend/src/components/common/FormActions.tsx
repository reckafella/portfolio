import React from 'react';
import { BsSave, BsX } from 'react-icons/bs';

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
            {submitText}
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
        {cancelText}
      </button>
    </div>
  );
};
