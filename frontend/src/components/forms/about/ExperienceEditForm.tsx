import React, { useState } from 'react';
import { BsSave, BsX, BsPlus, BsTrash } from 'react-icons/bs';
import { aboutApi, ExperienceEntry } from '../../../utils/aboutApi';
import { handleApiError } from '../../../utils/api';

interface ExperienceEditFormProps {
  data: ExperienceEntry[];
  onUpdate: (_data: ExperienceEntry[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

const ExperienceEditForm: React.FC<ExperienceEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const [entries, setEntries] = useState<ExperienceEntry[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [_newEntryIds, setNewEntryIds] = useState<Set<number>>(new Set()); // Track which entries are newly added

  const iconOptions = [
    { value: 'building', label: '🏢 Company' },
    { value: 'laptop', label: '💻 Remote' },
    { value: 'graph-up', label: '📈 Analytics' },
    { value: 'code-slash', label: '💻 Development' },
    { value: 'globe', label: '🌐 Global' }
  ];

  const handleChange = (index: number, field: keyof ExperienceEntry, value: string | string[]) => {
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
      
      if (entry.title.trim() && entry.title.trim().length < 3) {
        entryErrors.title = 'Job title must be at least 3 characters long';
      }
      if (entry.company.trim() && entry.company.trim().length < 2) {
        entryErrors.company = 'Company name must be at least 2 characters long';
      }
      if (entry.responsibilities.length > 0) {
        const invalidResponsibilities = entry.responsibilities.some(r => 
          r.trim() && r.trim().length < 10
        );
        if (invalidResponsibilities) {
          entryErrors.responsibilities = 'Each responsibility must be at least 10 characters long';
        }
      }
      
      if (Object.keys(entryErrors).length > 0) {
        errors[index] = entryErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResponsibilityChange = (entryIndex: number, respIndex: number, value: string) => {
    setEntries(prev => prev.map((entry, i) => {
      if (i === entryIndex) {
        const newResponsibilities = [...entry.responsibilities];
        newResponsibilities[respIndex] = value;
        return { ...entry, responsibilities: newResponsibilities };
      }
      return entry;
    }));
  };

  const addResponsibility = (entryIndex: number) => {
    setEntries(prev => prev.map((entry, i) => 
      i === entryIndex 
        ? { ...entry, responsibilities: [...entry.responsibilities, ''] }
        : entry
    ));
  };

  const removeResponsibility = (entryIndex: number, respIndex: number) => {
    setEntries(prev => prev.map((entry, i) => 
      i === entryIndex 
        ? { ...entry, responsibilities: entry.responsibilities.filter((_, ri) => ri !== respIndex) }
        : entry
    ));
  };

  const addNewEntry = () => {
    const newEntry: ExperienceEntry = {
      // Don't include an id for new entries - this marks them as new
      title: '',
      period: '',
      company: '',
      icon_type: 'building',
      responsibilities: [''],
      start_date: '',
      is_current: false
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
      const updatedEntries: ExperienceEntry[] = [];
      
      for (const [_index, entry] of entries.entries()) {
        // Skip completely empty entries
        const hasContent = entry.title.trim() || entry.period.trim() || entry.company.trim() || 
                          entry.responsibilities.some(r => r.trim());
        
        if (!hasContent) {
          continue; // Skip empty entries
        }

        // Clean up responsibilities (remove empty ones)
        const cleanedEntry = {
          ...entry,
          responsibilities: entry.responsibilities.filter(r => r.trim() !== '')
        };

        // Determine if this is an existing entry (has ID from database) or new entry (no ID)
        const isExistingEntry = entry.id !== undefined;

        if (isExistingEntry) {
          // UPDATE existing database record
          const response = await aboutApi.experience.update(entry.id!, {
            title: cleanedEntry.title,
            period: cleanedEntry.period,
            company: cleanedEntry.company,
            icon_type: cleanedEntry.icon_type,
            responsibilities: cleanedEntry.responsibilities,
            start_date: entry.start_date || '',
            end_date: entry.end_date || null,
            is_current: entry.is_current || false
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              updatedEntries.push({
                ...result.data,
                type: result.data.icon_type // Map backend field to frontend field
              });
            } else {
              onError(result.message || 'Failed to update experience entry');
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
          const response = await aboutApi.experience.create({
            title: cleanedEntry.title,
            period: cleanedEntry.period,
            company: cleanedEntry.company,
            icon_type: cleanedEntry.icon_type,
            responsibilities: cleanedEntry.responsibilities,
            start_date: entry.start_date || '',
            end_date: entry.end_date || null,
            is_current: entry.is_current || false
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              updatedEntries.push({
                ...result.data,
                type: result.data.icon_type // Map backend field to frontend field
              });
            } else {
              onError(result.message || 'Failed to create experience entry');
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
      onError('Failed to update experience. Please try again later.');
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="experience-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label mb-0">
              <strong>Experience Entries</strong>
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
                Experience #{index + 1}
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
            <div className="col-md-8 mb-2">
              <input
                type="text"
                className={`form-control form-control-sm ${validationErrors[index]?.title ? 'is-invalid' : ''}`}
                value={entry.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
                placeholder="Job Title"
                disabled={isLoading}
              />
              {validationErrors[index]?.title && (
                <div className="invalid-feedback">{validationErrors[index].title}</div>
              )}
            </div>
            <div className="col-md-4 mb-2">
              <select
                className="form-control form-control-sm"
                value={entry.icon_type}
                onChange={(e) => handleChange(index, 'icon_type', e.target.value)}
                disabled={isLoading}
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <input
                type="text"
                className={`form-control form-control-sm ${validationErrors[index]?.company ? 'is-invalid' : ''}`}
                value={entry.company}
                onChange={(e) => handleChange(index, 'company', e.target.value)}
                placeholder="Company"
                disabled={isLoading}
              />
              {validationErrors[index]?.company && (
                <div className="invalid-feedback">{validationErrors[index].company}</div>
              )}
            </div>
            <div className="col-md-6 mb-2">
              <input
                type="text"
                className={`form-control form-control-sm ${validationErrors[index]?.period ? 'is-invalid' : ''}`}
                value={entry.period}
                onChange={(e) => handleChange(index, 'period', e.target.value)}
                placeholder="Period (e.g., 2022 - Present)"
                disabled={isLoading}
              />
              {validationErrors[index]?.period && (
                <div className="invalid-feedback">{validationErrors[index].period}</div>
              )}
            </div>
            
            {/* Responsibilities */}
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">
                  <small><strong>Responsibilities</strong></small>
                </label>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => addResponsibility(index)}
                  disabled={isLoading}
                >
                  <BsPlus />
                </button>
              </div>
              
              {entry.responsibilities.map((resp, respIndex) => (
                <div key={respIndex} className="d-flex mb-1">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)}
                    placeholder="Responsibility or achievement (minimum 10 characters)"
                    disabled={isLoading}
                  />
                  {entry.responsibilities.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm ms-1"
                      onClick={() => removeResponsibility(index, respIndex)}
                      disabled={isLoading}
                    >
                      <BsTrash />
                    </button>
                  )}
                </div>
              ))}
              {validationErrors[index]?.responsibilities && (
                <div className="text-danger small mt-1">{validationErrors[index].responsibilities}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="text-muted text-center py-3">
          No experience entries. Add some using the button above.
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

export default ExperienceEditForm;
