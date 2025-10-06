import React, { useState } from 'react';
import { BsSave, BsX, BsPlus, BsTrash } from 'react-icons/bs';
import { aboutApi, EducationEntry } from '../../../utils/aboutApi';
import { handleApiError } from '../../../utils/api';

interface EducationEditFormProps {
  data: EducationEntry[];
  onUpdate: (_data: EducationEntry[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

const EducationEditForm: React.FC<EducationEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const [entries, setEntries] = useState<EducationEntry[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [_newEntryIds, setNewEntryIds] = useState<Set<number>>(new Set()); // Track which entries are newly added

  const handleChange = (index: number, field: keyof EducationEntry, value: string) => {
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
    
    // Clear validation error when user starts typing
    if (validationErrors[index]?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' }
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<number, Record<string, string>> = {};

    entries.forEach((entry, index) => {
      const entryErrors: Record<string, string> = {};
      
      if (entry.degree.trim() && entry.degree.trim().length < 3) {
        entryErrors.degree = 'Degree must be at least 3 characters long';
      }
      if (entry.institution.trim() && entry.institution.trim().length < 3) {
        entryErrors.institution = 'Institution must be at least 3 characters long';
      }
      if (entry.description.trim() && entry.description.trim().length < 20) {
        entryErrors.description = 'Description must be at least 20 characters long';
      }
      
      if (Object.keys(entryErrors).length > 0) {
        errors[index] = entryErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addNewEntry = () => {
    const newEntry: EducationEntry = {
      // Don't include an id for new entries - this marks them as new
      degree: '',
      period: '',
      start_date: '',
      end_date: '',
      is_current: false,
      institution: '',
      description: ''
    };
    setEntries(prev => [...prev, newEntry]);
    // Track that this new entry (at the new index) is newly added
    setNewEntryIds(prev => new Set([...prev, entries.length]));
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updatedEntries: EducationEntry[] = [];
      
      for (const [_index, entry] of entries.entries()) {
        // Skip completely empty entries
        const hasContent = entry.degree.trim() || entry.period.trim() || 
                          entry.institution.trim() || entry.description.trim();
        
        if (!hasContent) {
          continue; // Skip empty entries
        }

        // Determine if this is an existing entry (has ID from database) or new entry (no ID)
        const isExistingEntry = entry.id !== undefined;

        if (isExistingEntry) {
          // UPDATE existing database record
          const response = await aboutApi.education.update(entry.id!, {
            degree: entry.degree,
            period: entry.period,
            institution: entry.institution,
            description: entry.description
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              updatedEntries.push(result.data);
            } else {
              onError(result.message || 'Failed to update education entry');
              return;
            }
          } else {
            if (response.status === 401) {
              onError('Authentication failed. Please log in again.');
              return;
            } else if (response.status === 400) {
              const errorData = await response.json();
              if (errorData.errors) {
                const firstError = Object.values(errorData.errors)[0];
                onError(Array.isArray(firstError) ? firstError[0] : firstError);
              } else {
                onError(errorData.message || 'Validation failed');
              }
              return;
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }
        } else {
          // CREATE new database record (only for entries without IDs)
          const response = await aboutApi.education.create({
            degree: entry.degree,
            period: entry.period,
            institution: entry.institution,
            description: entry.description,
            start_date: entry.start_date || '',
            end_date: entry.end_date || null,
            is_current: entry.is_current || false
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              updatedEntries.push(result.data);
            } else {
              onError(result.message || 'Failed to create education entry');
              return;
            }
          } else {
            if (response.status === 401) {
              onError('Authentication failed. Please log in again.');
              return;
            } else if (response.status === 400) {
              const errorData = await response.json();
              if (errorData.errors) {
                const firstError = Object.values(errorData.errors)[0];
                onError(Array.isArray(firstError) ? firstError[0] : firstError);
              } else {
                onError(errorData.message || 'Validation failed');
              }
              return;
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }
        }
      }

      // Update UI with successfully saved entries
      onUpdate(updatedEntries);
      
    } catch (err) {
      onError('Failed to update education. Please try again later.');
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="education-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label mb-0">
              <strong>Education Entries</strong>
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                Education #{index + 1} 
                <small className="text-muted ms-2">
                  {entry.id ? `(ID: ${entry.id} - will UPDATE)` : '(NEW - will CREATE)'}
                </small>
              </h6>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeEntry(index)}
                disabled={isLoading}
              >
                <BsTrash />
              </button>
            </div>

            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className={`form-control form-control-sm ${validationErrors[index]?.degree ? 'is-invalid' : ''}`}
                  value={entry.degree}
                  onChange={(e) => handleChange(index, 'degree', e.target.value)}
                  placeholder="Degree/Program"
                  disabled={isLoading}
                />
                {validationErrors[index]?.degree && (
                  <div className="invalid-feedback">{validationErrors[index].degree}</div>
                )}
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className={`form-control form-control-sm ${validationErrors[index]?.period ? 'is-invalid' : ''}`}
                  value={entry.period}
                  onChange={(e) => handleChange(index, 'period', e.target.value)}
                  placeholder="Period (e.g., 2020-2024)"
                  disabled={isLoading}
                />
                {validationErrors[index]?.period && (
                  <div className="invalid-feedback">{validationErrors[index].period}</div>
                )}
              </div>
              <div className="col-12 mb-2">
                <input
                  type="text"
                  className={`form-control form-control-sm ${validationErrors[index]?.institution ? 'is-invalid' : ''}`}
                  value={entry.institution}
                  onChange={(e) => handleChange(index, 'institution', e.target.value)}
                  placeholder="Institution"
                  disabled={isLoading}
                />
                {validationErrors[index]?.institution && (
                  <div className="invalid-feedback">{validationErrors[index].institution}</div>
                )}
              </div>
              <div className="col-12 mb-2">
                <textarea
                  className={`form-control form-control-sm ${validationErrors[index]?.description ? 'is-invalid' : ''}`}
                  rows={2}
                  value={entry.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  placeholder="Description (minimum 20 characters)"
                  disabled={isLoading}
                />
                <div className="form-text">{entry.description.length}/20 minimum characters</div>
                {validationErrors[index]?.description && (
                  <div className="invalid-feedback">{validationErrors[index].description}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-muted text-center py-3">
            No education entries. Add some using the button above.
          </div>
        )}

        {/* Action buttons */}
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

export default EducationEditForm;
