import React, { useState, useEffect } from "react";
import { analyzePassword, PasswordAnalysis } from "@/utils/passwordStrength";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { PasswordRequirements } from "./PasswordRequirements";

interface PasswordInputProps {
    fieldName: string;
    value: string;
    onChange: (_fieldName: string, _value: string) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    showStrengthMeter?: boolean;
    showRequirements?: boolean;
    confirmPasswordValue?: string;
    oldPasswordValue?: string;
    isConfirmField?: boolean;
    className?: string;
}

/**
 * PasswordInput component with visibility toggle, strength meter, and requirements
 * Replicates functionality from app/static/assets/javascript/forms/validators/PasswordValidator.js
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
    fieldName,
    value,
    onChange,
    required = false,
    disabled = false,
    placeholder = "",
    maxLength,
    minLength,
    showStrengthMeter = true,
    showRequirements = true,
    confirmPasswordValue,
    oldPasswordValue,
    isConfirmField = false,
    className = "form-control",
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [analysis, setAnalysis] = useState<PasswordAnalysis>(
        analyzePassword(""),
    );
    const [isRequirementsExpanded, setIsRequirementsExpanded] = useState(false);

    // Analyze password whenever it changes
    useEffect(() => {
        const newAnalysis = analyzePassword(value);

        // Check if passwords match (for confirmation field or when comparing)
        if (
            confirmPasswordValue !== undefined &&
            value &&
            confirmPasswordValue
        ) {
            newAnalysis.match = value === confirmPasswordValue;
        }

        // Check if new password is different from old password
        if (oldPasswordValue !== undefined && value && oldPasswordValue) {
            newAnalysis.different = value !== oldPasswordValue;
        }

        setAnalysis(newAnalysis);
    }, [value, confirmPasswordValue, oldPasswordValue]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const uniqueId = `password-requirements-${fieldName}`;

    // Determine if we should show match or different requirements
    const showMatchRequirement =
        confirmPasswordValue !== undefined && !isConfirmField;
    const showDifferentRequirement = oldPasswordValue !== undefined;

    return (
        <div className="password-input-wrapper">
            {/* Password input with toggle button */}
            <div className="password-toggle-container">
                <input
                    type={showPassword ? "text" : "password"}
                    id={fieldName}
                    name={fieldName}
                    value={value}
                    onChange={(e) => onChange(fieldName, e.target.value)}
                    required={required}
                    disabled={disabled}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    minLength={minLength}
                    className={className}
                    autoComplete={
                        isConfirmField ? "new-password" : "current-password"
                    }
                />
                <button
                    type="button"
                    className="password-toggle-btn btn border-0 rounded-0"
                    onClick={togglePasswordVisibility}
                    title={showPassword ? "Hide Password" : "Show Password"}
                    disabled={disabled}
                    aria-label={
                        showPassword ? "Hide password" : "Show password"
                    }
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>

            {/* Show strength meter and requirements only for non-confirmation fields or when explicitly enabled */}
            {showStrengthMeter && !isConfirmField && value && (
                <div className="password-strength-indicator">
                    <PasswordStrengthMeter analysis={analysis} />
                    {showRequirements && (
                        <PasswordRequirements
                            analysis={analysis}
                            showMatchRequirement={showMatchRequirement}
                            showDifferentRequirement={showDifferentRequirement}
                            isExpanded={isRequirementsExpanded}
                            uniqueId={uniqueId}
                        />
                    )}
                </div>
            )}

            {/* For confirmation fields, show simple match indicator */}
            {isConfirmField && confirmPasswordValue && value && (
                <div className="password-match-indicator mt-2">
                    {value === confirmPasswordValue ? (
                        <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Passwords match
                        </small>
                    ) : (
                        <small className="text-danger">
                            <i className="bi bi-x-circle-fill me-1"></i>
                            Passwords do not match
                        </small>
                    )}
                </div>
            )}
        </div>
    );
};
