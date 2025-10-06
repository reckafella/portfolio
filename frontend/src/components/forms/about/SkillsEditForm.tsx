import React, { useState } from 'react';
import { BsSave, BsX, BsPlus, BsTrash } from 'react-icons/bs';
import { aboutApi } from '../../../utils/aboutApi';
import { handleApiError } from '../../../utils/api';

interface SkillsEditFormProps {
  data: string[];
  onUpdate: (_data: string[]) => void;
  onError: (_error: string) => void;
  onCancel: () => void;
}

const SkillsEditForm: React.FC<SkillsEditFormProps> = ({ 
  data, onUpdate, onError, onCancel 
}) => {
  const [skills, setSkills] = useState<string[]>(data);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) {
      setValidationError('Skill name cannot be empty');
      return;
    }

    if (skills.includes(trimmedSkill)) {
      setValidationError('This skill already exists');
      return;
    }

    setSkills(prev => [...prev, trimmedSkill]);
    setNewSkill('');
    setValidationError('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, value: string) => {
    setSkills(prev => prev.map((skill, i) => i === index ? value : skill));
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty skills
    const filteredSkills = skills.filter(skill => skill.trim() !== '');
    
    if (filteredSkills.length === 0) {
      setValidationError('At least one skill is required');
      return;
    }

    setValidationError('');
    setIsLoading(true);

    try {
      const response = await aboutApi.skills.bulkCreate({
        skills: filteredSkills,
        category: 'Technical Skills',
        proficiency_level: 3
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onUpdate(filteredSkills);
        } else {
          onError(result.message || 'Failed to update skills');
        }
      } else {
        // Handle different HTTP status codes
        if (response.status === 401) {
          onError('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.errors?.skills) {
            setValidationError(Array.isArray(errorData.errors.skills) 
              ? errorData.errors.skills[0] 
              : errorData.errors.skills);
          } else {
            onError(errorData.message || 'Validation failed');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      onError('Failed to update skills. Please try again later.');
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="skills-edit-form p-3 rounded border-start border-primary border-3">
      <form onSubmit={handleSubmit}>
        {/* Add new skill */}
        <div className="mb-3">
          <label className="form-label">
            <strong>Add New Skill</strong>
          </label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., React, Python, AWS"
              disabled={isLoading}
            />
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.trim()}
            >
              <BsPlus />
            </button>
          </div>
        </div>

        {/* Current skills list */}
        <div className="mb-3">
          <label className="form-label">
            <strong>Current Skills ({skills.length})</strong>
          </label>
          <div className="row g-2">
            {skills.map((skill, index) => (
              <div key={index} className="col-md-6">
                <div className="d-flex gap-1">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveSkill(index)}
                    disabled={isLoading}
                    title="Remove skill"
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {skills.length === 0 && (
            <div className="text-muted text-center py-3">
              No skills added yet. Add some skills above.
            </div>
          )}

          {validationError && (
            <div className="text-danger small mt-2">{validationError}</div>
          )}
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-success btn-sm"
            disabled={isLoading || skills.length === 0}
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

export default SkillsEditForm;
