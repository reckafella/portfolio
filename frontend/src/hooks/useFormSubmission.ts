import { useState } from 'react';
import { handleApiError } from '../utils/api';

interface UseFormSubmissionOptions<T> {
  onSuccess: (data: T) => void;
  onError: (error: string) => void;
  submitFunction: () => Promise<Response>;
  errorMessage?: string;
}

interface UseFormSubmissionReturn {
  isLoading: boolean;
  submitForm: () => Promise<void>;
}

/**
 * Custom hook for handling form submissions with loading states and error handling
 * Reduces duplication across all forms
 */
export function useFormSubmission<T>({
  onSuccess,
  onError,
  submitFunction,
  errorMessage = 'Failed to submit form. Please try again later.'
}: UseFormSubmissionOptions<T>): UseFormSubmissionReturn {
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async () => {
    setIsLoading(true);

    try {
      const response = await submitFunction();

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onSuccess(result.data);
        } else {
          onError(result.message || 'Operation failed');
        }
      } else {
        // Handle different HTTP status codes
        if (response.status === 401) {
          onError('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.errors) {
            // For validation errors, we'll let individual forms handle them
            onError(errorData.message || 'Validation failed');
          } else {
            onError(errorData.message || 'Validation failed');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      onError(errorMessage);
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, submitForm };
}
