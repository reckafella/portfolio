import React from "react";

interface FormFieldProps {
    label: string;
    name: string;
    type?: "text" | "email" | "textarea" | "select";
    value: string;
    onChange: (_value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    options?: Array<{ value: string; label: string }>;
    helpText?: string;
    className?: string;
}

/**
 * Reusable form field component that handles all common form input types
 * Reduces duplication and provides consistent styling and validation display
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder,
    rows = 3,
    options = [],
    helpText,
    className = "",
}) => {
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        onChange(e.target.value);
    };

    const baseClasses = `form-control ${error ? "is-invalid" : ""} ${className}`;

    const renderInput = () => {
        switch (type) {
            case "textarea":
                return (
                    <textarea
                        className={baseClasses}
                        id={name}
                        name={name}
                        rows={rows}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                );

            case "select":
                return (
                    <select
                        className={baseClasses}
                        id={name}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        type={type}
                        className={baseClasses}
                        id={name}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                );
        }
    };

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label">
                <strong>{label}</strong>
                {required && <span className="text-danger ms-1">*</span>}
            </label>

            {renderInput()}

            {helpText && <div className="form-text">{helpText}</div>}

            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};
