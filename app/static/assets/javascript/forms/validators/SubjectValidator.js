import { FieldValidator } from './FieldValidator.js';

/**
 * SubjectValidator extends FieldValidator with subject-specific validation methods
 */
export class SubjectValidator extends FieldValidator {
    /**
     * Validate subject length and content
     * @param {string} fieldId - Subject field ID
     */
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const subject = field.value.trim();

        // Get field configuration (merge with data attributes)
        const config = this.getFieldConfig(fieldId);
        const minLength = config.min || 15;
        const maxLength = config.max || 150;
        const required = this.isFieldRequired(fieldId);
        // Use field name from config or parameter, fallback to 'Subject'
        fieldName = fieldName || this.getFieldDisplayName(fieldId) || 'Subject';

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!subject) {
            //this.setFieldError(field, fieldId, 'Subject is required');
        } else if (subject.length < minLength) {
            this.setFieldError(field, fieldId, `${fieldName} must be at least ${minLength} characters`);
        } else if (subject.length < (minLength + 30)) {
            this.setFieldWarning(field, fieldId, `Consider adding more details to your ${fieldName}`);
        } else if (subject.length > maxLength) {
            this.setFieldError(field, fieldId, `${fieldName} must be less than ${maxLength} characters`);
        } else {
            this.setFieldSuccess(field, fieldId, '');
        }
    }

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_subject': 'Subject',
            // Add more field IDs and their display names as needed
        };
        return displayNames[fieldId] || super.getFieldDisplayName(fieldId) || 'Subject';
    }
}
