import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { ArrayEditForm } from './ArrayEditForm';
import { FormField } from '../../common/FormField';
import { DateRangeField } from '../../common/DateRangeField';
import { aboutApi, EducationEntry } from '../../../utils/aboutApi';

interface EducationEditFormProps {
  data: EducationEntry[];
  onUpdate: (_data: EducationEntry[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

/**
 * Updated EducationEditForm with proper date range support
 * Features start/end dates with "Currently studying" checkbox
 */
const EducationEditForm: React.FC<EducationEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const createNewEntry = (): EducationEntry => ({
    degree: '',
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: null,
    is_current: false,
    period: '',
    institution: '',
    description: ''
  });

  const submitFunction = async (entries: EducationEntry[]) => {
    const updatedEntries: EducationEntry[] = [];
    
    for (const entry of entries) {
      const isExistingEntry = entry.id !== undefined;

      if (isExistingEntry) {
        // UPDATE existing database record
        const response = await aboutApi.education.update(entry.id!, {
          degree: entry.degree,
          start_date: entry.start_date,
          end_date: entry.end_date || null,
          is_current: entry.is_current,
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
          start_date: entry.start_date,
          end_date: entry.end_date || null,
          is_current: entry.is_current,
          institution: entry.institution,
          description: entry.description,
          period: entry.period
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
    onChange: (_field: keyof EducationEntry, _value: string | boolean | string[]) => void, 
    onRemove: () => void, 
    isLoading: boolean
  ): React.ReactNode => (
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
          className="btn btn-danger btn-sm"
          onClick={onRemove}
          disabled={isLoading}
        >
          <BsTrash />
        </button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <FormField
            label="Degree"
            name="degree"
            type="text"
            value={entry.degree}
            onChange={(value) => onChange('degree', value)}
            required
            disabled={isLoading}
            className="form-control form-control-sm"
          />
        </div>
        
        <div className="col-md-6 mb-3">
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
      </div>

      <DateRangeField
        startDate={entry.start_date}
        endDate={entry.end_date}
        isCurrent={entry.is_current}
        onStartDateChange={(date) => onChange('start_date', date)}
        onEndDateChange={(date) => onChange('end_date', date)}
        onCurrentChange={(isCurrent) => onChange('is_current', isCurrent)}
        disabled={isLoading}
        currentLabel="Currently studying here"
        startLabel="Start Date"
        endLabel="End Date"
        className="mb-3"
      />

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

export default EducationEditForm;
