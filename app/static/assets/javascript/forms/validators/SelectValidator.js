import { FieldValidator } from "./FieldValidator.js";

/**
 * SelectValidator class for validating select/dropdown fields
 * Extends FieldValidator to provide select-specific validation logic
 * @class SelectValidator
 * @extends FieldValidator
 */
export class SelectValidator extends FieldValidator {
    /**
     * Validate select field
     * @param {string} fieldId - The field ID to validate
     * @param {string} fieldName - Human-readable field name for error messages
     * @param {boolean} required - Whether the field is required
     */
    validate(fieldId, fieldName = 'Field', required = true) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value.trim();

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (required && (!value || value === '')) {
            this.setFieldError(field, fieldId, `${fieldName} is required.`);
        } else if (value && value !== '') {
            // Check if the selected value is valid (exists in options)
            const selectedOption = field.querySelector(`option[value="${value}"]`);
            if (!selectedOption) {
                this.setFieldError(field, fieldId, `Invalid ${fieldName.toLowerCase()} selection.`);
            } else {
                this.setFieldSuccess(field, fieldId, `${fieldName} selected.`);
            }
        }
        // If not required and empty, no validation needed
    }
}

/**
 * BooleanValidator class for validating checkbox/boolean fields
 * Extends FieldValidator to provide boolean-specific validation logic
 * @class BooleanValidator
 * @extends FieldValidator
 */
export class BooleanValidator extends FieldValidator {
    /**
     * Validate boolean field (typically checkboxes)
     * @param {string} fieldId - The field ID to validate
     * @param {string} fieldName - Human-readable field name for error messages
     * @param {boolean} required - Whether the field must be checked
     */
    validate(fieldId, fieldName = 'Field', required = false) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const isChecked = field.checked;

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (required && !isChecked) {
            this.setFieldError(field, fieldId, `${fieldName} must be checked.`);
        } else if (isChecked) {
            this.setFieldSuccess(field, fieldId, `${fieldName} is enabled.`);
        }
        // For non-required boolean fields, both checked and unchecked are valid
    }
}
