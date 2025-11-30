import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalsService from '@/services/goalsService';
import type { GoalFormData } from '@/types/goals';
import Toast from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import '@/styles/goals/GoalForm.css';

interface GoalFormProps {
    initialData?: Partial<GoalFormData>;
    isEditing?: boolean;
    goalId?: number;
}

const GoalForm: React.FC<GoalFormProps> = ({ initialData, isEditing = false, goalId }) => {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<GoalFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        goal_type: initialData?.goal_type || 'BUILD_HABIT',
        category: initialData?.category || 'OTHER',
        target_frequency: initialData?.target_frequency || 'DAILY',
        start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
        target_date: initialData?.target_date || '',
        is_private: initialData?.is_private ?? true,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : null;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing && goalId) {
                await GoalsService.updateGoal(goalId, formData);
                showToast('Goal updated successfully!', 'success');
            } else {
                await GoalsService.createGoal(formData);
                showToast('Goal created successfully!', 'success');
            }

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                navigate('/goals');
            }, 1000);
        } catch (err: any) {
            console.error('Form submission error:', err);

            // Handle validation errors from backend
            if (err.response?.data) {
                const errorData = err.response.data;

                // Check for title uniqueness error
                if (errorData.title) {
                    const titleError = Array.isArray(errorData.title)
                        ? errorData.title[0]
                        : errorData.title;
                    showToast(titleError, 'error');
                    setError(titleError);
                } else if (errorData.detail) {
                    showToast(errorData.detail, 'error');
                    setError(errorData.detail);
                } else if (errorData.non_field_errors) {
                    const nfError = Array.isArray(errorData.non_field_errors)
                        ? errorData.non_field_errors[0]
                        : errorData.non_field_errors;
                    showToast(nfError, 'error');
                    setError(nfError);
                } else {
                    // Generic error
                    const message = isEditing ? 'Failed to update goal' : 'Failed to create goal';
                    showToast(message, 'error');
                    setError(message);
                }
            } else {
                const message = isEditing ? 'Failed to update goal' : 'Failed to create goal';
                showToast(message, 'error');
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(isEditing ? `/goals/${goalId}` : '/goals');
    };

    return (
        <div className="goal-form-container">
            <div className="goal-form-card">
                <h2 className="goal-form-title">{isEditing ? 'Edit Goal' : 'Create New Goal'}</h2>

                {error && (
                    <div className="goal-form-error">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="goal-form">
                    {/* Title */}
                    <div className="goal-form-group">
                        <label htmlFor="title" className="goal-form-label">
                            Title <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={200}
                            className="goal-form-input"
                            placeholder="e.g., Exercise daily, Quit smoking"
                        />
                    </div>

                    {/* Description */}
                    <div className="goal-form-group">
                        <label htmlFor="description" className="goal-form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="goal-form-textarea"
                            placeholder="Describe your goal and why it's important to you..."
                        />
                    </div>

                    {/* Goal Type */}
                    <div className="goal-form-group">
                        <label className="goal-form-label">
                            Goal Type <span className="required">*</span>
                        </label>
                        <div className="goal-form-radio-group">
                            <label className="goal-form-radio">
                                <input
                                    type="radio"
                                    name="goal_type"
                                    value="BUILD_HABIT"
                                    checked={formData.goal_type === 'BUILD_HABIT'}
                                    onChange={handleChange}
                                />
                                <span>🎯 Build Habit</span>
                            </label>
                            <label className="goal-form-radio">
                                <input
                                    type="radio"
                                    name="goal_type"
                                    value="QUIT_BEHAVIOR"
                                    checked={formData.goal_type === 'QUIT_BEHAVIOR'}
                                    onChange={handleChange}
                                />
                                <span>🚫 Quit Behavior</span>
                            </label>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="goal-form-group">
                        <label htmlFor="category" className="goal-form-label">
                            Category <span className="required">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="goal-form-select"
                        >
                            <option value="HEALTH">Health</option>
                            <option value="PRODUCTIVITY">Productivity</option>
                            <option value="SOCIAL">Social</option>
                            <option value="PERSONAL_DEVELOPMENT">Personal Development</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Frequency */}
                    <div className="goal-form-group">
                        <label htmlFor="target_frequency" className="goal-form-label">
                            Frequency <span className="required">*</span>
                        </label>
                        <select
                            id="target_frequency"
                            name="target_frequency"
                            value={formData.target_frequency}
                            onChange={handleChange}
                            required
                            className="goal-form-select"
                        >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="goal-form-row">
                        <div className="goal-form-group">
                            <label htmlFor="start_date" className="goal-form-label">
                                Start Date <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                                className="goal-form-input"
                            />
                        </div>
                        <div className="goal-form-group">
                            <label htmlFor="target_date" className="goal-form-label">
                                Target Date
                            </label>
                            <input
                                type="date"
                                id="target_date"
                                name="target_date"
                                value={formData.target_date}
                                onChange={handleChange}
                                className="goal-form-input"
                                min={formData.start_date}
                            />
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="goal-form-group">
                        <label className="goal-form-checkbox">
                            <input
                                type="checkbox"
                                name="is_private"
                                checked={formData.is_private}
                                onChange={handleChange}
                            />
                            <span>Keep this goal private</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="goal-form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="goal-form-btn goal-form-btn-cancel"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="goal-form-btn goal-form-btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default GoalForm;
