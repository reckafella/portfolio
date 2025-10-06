import React from 'react';

interface DateRangeFieldProps {
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  onStartDateChange: (_date: string) => void;
  onEndDateChange: (_date: string) => void;
  onCurrentChange: (_isCurrent: boolean) => void;
  disabled?: boolean;
  currentLabel?: string;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

/**
 * Reusable date range input component with "Currently working/studying" checkbox
 * Handles date formatting and validation
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({
  startDate,
  endDate,
  isCurrent,
  onStartDateChange,
  onEndDateChange,
  onCurrentChange,
  disabled = false,
  currentLabel = "Currently working here",
  startLabel = "Start Date",
  endLabel = "End Date",
  className = ""
}) => {
  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCurrentChange(e.target.checked);
    if (e.target.checked) {
      // Clear end date when marking as current
      onEndDateChange('');
    }
  };

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      // Convert ISO date string to YYYY-MM-DD format for input
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <div className={`date-range-field ${className}`}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label">
            <strong>{startLabel}</strong> <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={formatDateForInput(startDate)}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        
        <div className="col-md-6 mb-2">
          <label className="form-label">
            <strong>{endLabel}</strong>
            {!isCurrent && <span className="text-danger">*</span>}
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={formatDateForInput(endDate)}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={disabled || isCurrent}
            required={!isCurrent}
          />
        </div>
      </div>
      
      <div className="mb-2">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="is-current"
            checked={isCurrent}
            onChange={handleCurrentChange}
            disabled={disabled}
          />
          <label className="form-check-label" htmlFor="is-current">
            <strong>{currentLabel}</strong>
          </label>
        </div>
        {isCurrent && (
          <small className="text-muted">
            End date will be automatically set to "Present"
          </small>
        )}
      </div>
    </div>
  );
};
