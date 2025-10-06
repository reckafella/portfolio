import React, { useState } from 'react';
import { BsPlus, BsTrash } from 'react-icons/bs';
import { FormActions } from '../../common/FormActions';
import { FormField } from '../../common/FormField';
import { useFormSubmission } from '../../../hooks/useFormSubmission';
import { sanitizeText, sanitizeStringArray } from '../../../utils/inputSanitization';

interface ArrayEditFormProps<T> {
  data: T[];
  onUpdate: (data: T[]) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  submitFunction: (entries: T[]) => Promise<Response>;
  createNewEntry: () => T;
  renderEntry: (entry: T, index: number, onChange: (field: keyof T, value: string) => void, onRemove: () => void, isLoading: boolean) => React.ReactNode;
  validationFunction?: (entries: T[]) => string | null;
  errorMessage?: string;
  sectionTitle: string;
}

/**
 * Generic array edit form component for Education and Experience
 * Handles arrays of objects with create/update logic
 */
export function ArrayEditForm<T extends Record<string, any>>({
  data,
  onUpdate,
  onError,
  onCancel,
  submitFunction,
  createNewEntry,
  renderEntry,
  validationFunction,
  errorMessage = 'Failed to update entries. Please try again later.',
  sectionTitle
}: ArrayEditFormProps<T>) {
  const [entries, setEntries] = useState<T[]>(data);
  const [validationError, setValidationError] = useState('');

  const { isLoading, submitForm } = useFormSubmission({
    onSuccess: onUpdate,
    onError,
    submitFunction: async () => {
      // Filter out empty entries
      const filteredEntries = entries.filter(entry => {
        return Object.values(entry).some(value => {
          if (Array.isArray(value)) {
            return value.some(item => sanitizeText(item).trim() !== '');
          }
          return sanitizeText(String(value)).trim() !== '';
        });
      });

      return submitFunction(filteredEntries);
    },
    errorMessage
  });

  const handleChange = (index: number, field: keyof T, value: string) => {
    let sanitizedValue = value;
    
    if (Array.isArray(entries[index][field])) {
      // Handle array fields (like responsibilities)
      return;
    } else {
      sanitizedValue = sanitizeText(value);
    }

    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: sanitizedValue } : entry
    ));

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleArrayChange = (index: number, field: keyof T, values: string[]) => {
    const sanitizedValues = sanitizeStringArray(values);
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: sanitizedValues } : entry
    ));
  };

  const addNewEntry = () => {
    setEntries(prev => [...prev, createNewEntry()]);
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (validationFunction) {
      const error = validationFunction(entries);
      if (error) {
        setValidationError(error);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await submitForm();
    }
  };

  return (
    <div className="array-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label mb-0">
              <strong>{sectionTitle}</strong>
              <small className="text-muted ms-2">
                ({entries.filter(e => e.id).length} existing, {entries.filter(e => !e.id).length} new)
              </small>
            </label>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addNewEntry}
              disabled={isLoading}
            >
              <BsPlus className="me-1" />
              Add Entry
            </button>
          </div>
        </div>

        {entries.map((entry, index) => (
          <div key={index} className="mb-4 p-3 bg-white rounded border">
            {renderEntry(
              entry, 
              index, 
              (field, value) => handleChange(index, field, value),
              () => removeEntry(index),
              isLoading
            )}
          </div>
        ))}

        {validationError && (
          <div className="text-danger small mt-2">{validationError}</div>
        )}

        <FormActions
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
}
