import React from 'react';
import { PasswordAnalysis } from '@/utils/passwordStrength';

interface PasswordRequirementsProps {
    analysis: PasswordAnalysis;
    showMatchRequirement?: boolean;
    showDifferentRequirement?: boolean;
    isExpanded?: boolean;
    uniqueId: string;
}

/**
 * PasswordRequirements component displays password strength requirements
 * Shows which requirements are met with visual indicators
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    analysis,
    showMatchRequirement = false,
    showDifferentRequirement = false,
    isExpanded = false,
    uniqueId
}) => {
    const requirements = [
        {
            type: 'length',
            label: 'At least 8 characters',
            isMet: analysis.length
        },
        {
            type: 'uppercase',
            label: 'Uppercase letters (A-Z)',
            isMet: analysis.hasUpperCase
        },
        {
            type: 'lowercase',
            label: 'Lowercase letters (a-z)',
            isMet: analysis.hasLowerCase
        },
        {
            type: 'numbers',
            label: 'Numbers (0-9)',
            isMet: analysis.hasNumbers
        },
        {
            type: 'special',
            label: 'Special characters (!@#$%^&*)',
            isMet: analysis.hasSpecialChar
        }
    ];

    // Add conditional requirements
    if (showMatchRequirement) {
        requirements.push({
            type: 'match',
            label: 'Both passwords match',
            isMet: analysis.match ?? false
        });
    }

    if (showDifferentRequirement) {
        requirements.push({
            type: 'different',
            label: 'New password is different from old password',
            isMet: analysis.different ?? false
        });
    }

    return (
        <div className="accordion accordion-flush">
            <div className="accordion-item">
                <h4 className="accordion-header">
                    <button
                        className={`accordion-button ${isExpanded ? '' : 'collapsed'}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${uniqueId}`}
                        aria-expanded={isExpanded}
                        aria-controls={uniqueId}
                    >
                        Password Requirements
                    </button>
                </h4>
                <div
                    id={uniqueId}
                    className={`accordion-collapse collapse ${isExpanded ? 'show' : ''}`}
                >
                    <div className="accordion-body strength-requirements">
                        {requirements.map((req) => (
                            <div
                                key={req.type}
                                className={`requirement ${req.isMet ? 'met' : ''}`}
                                data-type={req.type}
                            >
                                <span className="requirement-icon">
                                    {req.isMet ? '✓' : '○'}
                                </span>{' '}
                                {req.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
