import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { ArrayEditForm } from './ArrayEditForm';
import { FormField } from '../../common/FormField';
import { aboutApi, EducationEntry } from '../../../utils/aboutApi';

interface EducationEditFormProps {
  data: EducationEntry[];
  onUpdate: (data: EducationEntry[]) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

/**
 * Refactored EducationEditForm using shared ArrayEditForm component
 * Reduced from ~323 lines to ~120 lines with improved maintainability
 */
const EducationEditFormV2: React.FC<EducationEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const createNewEntry = (): EducationEntry => ({
    degree: '',
    period: '',
    institution: '',
    description: ''
  });

  const submitFunction = async (entries: EducationEntry[]) => {
    // Process each education entry
    const updatedEntries: EducationEntry[] = [];
    
    for (const entry of entries) {
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
            throw new Error(result.message || 'Failed to update education entry');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // CREATE new database record
        const response = await aboutApi.education.create({
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
            throw new Error(result.message || 'Failed to create education entry');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    }

    // Return a mock response for the form submission hook
    return new Response(JSON.stringify({
      success: true,
      data: updatedEntries
    }), { status: 200 });
  };

  const renderEntry = (
    entry: EducationEntry, 
    index: number, 
    onChange: (field: keyof EducationEntry, value: string) => void, 
    onRemove: () => void, 
    isLoading: boolean
  ) => (
    <>
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
          onClick={onRemove}
          disabled={isLoading}
        >
          <BsTrash />
        </button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <FormField
            label="Degree"
            name="degree"
            type="text"
            value={entry.degree}
            onChange={(value) => onChange('degree', value)}
            required
            disabled={isLoading}
            className="form-control-sm"
          />
        </div>
        
        <div className="col-md-6 mb-2">
          <FormField
            label="Period"
            name="period"
            type="text"
            value={entry.period}
            onChange={(value) => onChange('period', value)}
            required
            disabled={isLoading}
            className="form-control-sm"
          />
        </div>
      </div>

      <div className="mb-2">
        <FormField
          label="Institution"
          name="institution"
          type="text"
          value={entry.institution}
          onChange={(value) => onChange('institution', value)}
          required
          disabled={isLoading}
          className="form-control-sm"
        />
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        rows={3}
        value={entry.description}
        onChange={(value) => onChange('description', value)}
        required
        disabled={isLoading}
        className="form-control-sm"
      />
    </>
  );

  return (
    <ArrayEditForm
      data={data}
      onUpdate={onUpdate}
      onError={onError}
      onCancel={onCancel}
      submitFunction={submitFunction}
      createNewEntry={createNewEntry}
      renderEntry={renderEntry}
      sectionTitle="Education Entries"
      errorMessage="Failed to update education. Please try again later."
    />
  );
};

export default EducationEditFormV2;
