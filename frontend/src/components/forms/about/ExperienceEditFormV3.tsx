import React from 'react';
import { BsTrash, BsPlus } from 'react-icons/bs';
import { ArrayEditForm } from './ArrayEditForm';
import { FormField } from '../../common/FormField';
import { DateRangeField } from '../../common/DateRangeField';
import { aboutApi, ExperienceEntry } from '../../../utils/aboutApi';

interface ExperienceEditFormProps {
  data: ExperienceEntry[];
  onUpdate: (_data: ExperienceEntry[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

/**
 * Updated ExperienceEditForm with proper date range support
 * Features start/end dates with "Currently working" checkbox
 */
const ExperienceEditFormV3: React.FC<ExperienceEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const iconOptions = [
    { value: 'building', label: '🏢 Company' },
    { value: 'laptop', label: '💻 Remote' },
    { value: 'graph-up', label: '📈 Analytics' },
    { value: 'code-slash', label: '💻 Development' },
    { value: 'globe', label: '🌐 Global' },
  ];

  const createNewEntry = (): ExperienceEntry => ({
    title: '',
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: null,
    is_current: false,
    period: '',
    company: '',
    icon_type: 'building',
    responsibilities: ['']
  });

  const submitFunction = async (entries: ExperienceEntry[]) => {
    const updatedEntries: ExperienceEntry[] = [];
    
    for (const entry of entries) {
      const isExistingEntry = entry.id !== undefined;

      if (isExistingEntry) {
        // UPDATE existing database record
        const response = await aboutApi.experience.update(entry.id!, {
          title: entry.title,
          start_date: entry.start_date,
          end_date: entry.end_date || null,
          is_current: entry.is_current,
          company: entry.company,
          icon_type: entry.icon_type,
          responsibilities: entry.responsibilities.filter(r => r.trim() !== '')
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            updatedEntries.push(result.data);
          } else {
            throw new Error(result.message || 'Failed to update experience entry');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // CREATE new database record
        const response = await aboutApi.experience.create({
          title: entry.title,
          start_date: entry.start_date,
          end_date: entry.end_date || null,
          is_current: entry.is_current,
          company: entry.company,
          icon_type: entry.icon_type,
          responsibilities: entry.responsibilities.filter(r => r.trim() !== ''),
          period: entry.period
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            updatedEntries.push(result.data);
          } else {
            throw new Error(result.message || 'Failed to create experience entry');
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
    entry: ExperienceEntry, 
    index: number, 
    onChange: (_field: keyof ExperienceEntry, _value: string | boolean | string[]) => void, 
    onRemove: () => void, 
    isLoading: boolean
  ) => {
    const handleResponsibilityChange = (respIndex: number, value: string) => {
      const newResponsibilities = [...entry.responsibilities];
      newResponsibilities[respIndex] = value;
      onChange('responsibilities', newResponsibilities);
    };

    const addResponsibility = () => {
      onChange('responsibilities', [...entry.responsibilities, '']);
    };

    const removeResponsibility = (respIndex: number) => {
      const newResponsibilities = entry.responsibilities.filter((_, i) => i !== respIndex);
      onChange('responsibilities', newResponsibilities);
    };

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            Experience #{index + 1}
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
          <div className="col-md-8 mb-3">
            <FormField
              label="Job Title"
              name="title"
              type="text"
              value={entry.title}
              onChange={(value) => onChange('title', value)}
              required
              disabled={isLoading}
              className="form-control-sm"
            />
          </div>
          
          <div className="col-md-4 mb-3">
            <FormField
              label="Company Type"
              name="icon_type"
              type="select"
              value={entry.icon_type}
              onChange={(value) => onChange('icon_type', value)}
              options={iconOptions}
              disabled={isLoading}
              className="form-control-sm"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <FormField
              label="Company"
              name="company"
              type="text"
              value={entry.company}
              onChange={(value) => onChange('company', value)}
              required
              disabled={isLoading}
              className="form-control-sm"
            />
          </div>
          
          <div className="col-md-6 mb-3">
            <DateRangeField
              startDate={entry.start_date}
              endDate={entry.end_date}
              isCurrent={entry.is_current}
              onStartDateChange={(date) => onChange('start_date', date)}
              onEndDateChange={(date) => onChange('end_date', date)}
              onCurrentChange={(isCurrent) => onChange('is_current', isCurrent)}
              disabled={isLoading}
              currentLabel="Currently working here"
              startLabel="Start Date"
              endLabel="End Date"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">
              <strong>Responsibilities</strong>
              <span className="text-danger ms-1">*</span>
            </label>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addResponsibility}
              disabled={isLoading}
            >
              <BsPlus className="me-1" />
              Add Responsibility
            </button>
          </div>
          
          {entry.responsibilities.map((responsibility, respIndex) => (
            <div key={respIndex} className="mb-2 d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={responsibility}
                onChange={(e) => handleResponsibilityChange(respIndex, e.target.value)}
                disabled={isLoading}
                placeholder="Describe a key responsibility or achievement"
              />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeResponsibility(respIndex)}
                disabled={isLoading}
              >
                <BsTrash />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <ArrayEditForm
      data={data}
      onUpdate={onUpdate}
      onError={onError}
      onCancel={onCancel}
      submitFunction={submitFunction}
      createNewEntry={createNewEntry}
      renderEntry={(
        entry,
        index,
        onChange: (_field: keyof ExperienceEntry, _value: string) => void,
        onRemove,
        isLoading
      ) =>
        renderEntry(
          entry,
          index,
          // Wrap onChange to accept string | boolean | string[] but only pass string
          (field, value) => onChange(field, typeof value === "string" ? value : ""),
          onRemove,
          isLoading
        )
      }
      sectionTitle="Experience Entries"
      errorMessage="Failed to update experience. Please try again later."
    />
  );
};

export default ExperienceEditFormV3;
