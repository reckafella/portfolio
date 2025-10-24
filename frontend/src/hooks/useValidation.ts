import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Custom hook for form validation with reusable validation rules
 * Provides consistent validation across all forms
 */
export function useValidation<T extends Record<string, any>>(
  rules: ValidationRules
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    const stringValue = String(value);

    // Min length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (data: T): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSingleField = (name: string, value: any): boolean => {
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    }
  };

  const clearError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearError,
    clearAllErrors
  };
}
