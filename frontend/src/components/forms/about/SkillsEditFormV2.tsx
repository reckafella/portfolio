import React, { useState } from 'react';
import { BsPlus, BsTrash } from 'react-icons/bs';
import { FormActions } from '../../common/FormActions';
import { useFormSubmission } from '../../../hooks/useFormSubmission';
import { sanitizeText, sanitizeStringArray } from '../../../utils/inputSanitization';
import { aboutApi } from '../../../utils/aboutApi';

interface SkillsEditFormProps {
  data: string[];
  onUpdate: (_data: string[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

/**
 * Refactored SkillsEditForm using shared components
 * Reduced from ~213 lines to ~120 lines with improved security
 */
const SkillsEditFormV2: React.FC<SkillsEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const [skills, setSkills] = useState<string[]>(data);
  const [validationError, setValidationError] = useState('');

  const { isLoading, submitForm } = useFormSubmission({
    onSuccess: onUpdate,
    onError,
    submitFunction: async () => {
      const filteredSkills = sanitizeStringArray(skills.filter(skill => skill.trim() !== ''));
      return aboutApi.skills.bulkCreate({ 
        skills: filteredSkills, 
        category: 'Technical Skills', 
        proficiency_level: 3 
      });
    },
    errorMessage: 'Failed to update skills. Please try again later.'
  });

  const handleAddSkill = () => {
    setSkills(prev => [...prev, '']);
  };

  const handleSkillChange = (index: number, value: string) => {
    const sanitizedValue = sanitizeText(value);
    setSkills(prev => prev.map((skill, i) => i === index ? sanitizedValue : skill));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const filteredSkills = skills.filter(skill => skill.trim() !== '');
    
    if (filteredSkills.length === 0) {
      setValidationError('At least one skill is required');
      return false;
    }

    // Check for duplicates
    const uniqueSkills = new Set(filteredSkills.map(skill => skill.toLowerCase()));
    if (uniqueSkills.size !== filteredSkills.length) {
      setValidationError('Duplicate skills are not allowed');
      return false;
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
    <div className="skills-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label mb-0">
              <strong>Technical Skills</strong>
              <small className="text-muted ms-2">
                ({skills.filter(s => s.trim()).length} skills)
              </small>
            </label>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleAddSkill}
              disabled={isLoading}
            >
              <BsPlus className="me-1" />
              Add Skill
            </button>
          </div>
        </div>

        {skills.map((skill, index) => (
          <div key={index} className="mb-2 d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              disabled={isLoading}
              placeholder="Enter skill name"
            />
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleRemoveSkill(index)}
              disabled={isLoading}
            >
              <BsTrash />
            </button>
          </div>
        ))}

        {validationError && (
          <div className="text-danger small mt-2">{validationError}</div>
        )}

        <FormActions
          isLoading={isLoading}
          onCancel={onCancel}
          submitText="Update Skills"
        />
      </form>
    </div>
  );
};

export default SkillsEditFormV2;
