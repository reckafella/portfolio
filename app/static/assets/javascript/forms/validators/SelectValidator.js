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
    validate(fieldId, fieldName) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value.trim();

        // Use field name from config or parameter, fallback to 'Field'
        fieldName = fieldName || this.getFieldDisplayName(fieldId) || 'Field';
        // Check if the field is required
        const required = this.isFieldRequired(fieldId);

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

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_select_field': 'Select Field',
            'id_project_type': 'Project Type',
            'id_category': 'Category',
            'id_status': 'Status',
            'id_priority': 'Priority',
            'id_dropdown_menu': 'Dropdown Menu',
            // Add more field IDs and their display names as needed
        };
        return displayNames[fieldId] || super.getFieldDisplayName(fieldId) || 'Select Field';
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
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const isChecked = field.checked;

        // Use field name from config or parameter, fallback to 'Boolean Field'
        fieldName = fieldName || this.getFieldDisplayName(fieldId) || 'Boolean Field';
        // Check if the field is required
        const required = this.isFieldRequired(fieldId);


        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (required && !isChecked) {
            this.setFieldError(field, fieldId, `${fieldName} must be checked.`);
        } else if (isChecked) {
            this.setFieldSuccess(field, fieldId, `${fieldName} is enabled.`);
        }
        // For non-required boolean fields, both checked and unchecked are valid
    }

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_live': 'Boolean Field',
            'id_privacy_policy': 'Privacy Policy',
            'id_subscribe': 'Subscribe to Newsletter',
            'id_published': 'Boolean Field',
            'id_newsletter': 'Newsletter Subscription',
            'id_notifications': 'Notifications',
            // Add more field IDs and their display names as needed
        };
        return displayNames[fieldId] || super.getFieldDisplayName(fieldId) || 'Boolean Field';
    }

}
