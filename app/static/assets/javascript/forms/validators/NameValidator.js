import { FieldValidator } from './FieldValidator.js';

/**
 * NameValidator extends FieldValidator with name-specific validation methods
 */
export class NameValidator extends FieldValidator {
    /**
     * Validate name format and length using field configuration
     * @param {string} fieldId - Name field ID
     * @param {string} fieldName - Human-readable field name for error messages (optional)
     */
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const name = field.value.trim();
        const nameRegex = /^[a-zA-Z\s\-']+$/; // Letters, spaces, hyphens, apostrophes

        // Get field config
        const config = this.getFieldConfig(fieldId);
        const minLength = config.min || 2;
        const maxLength = config.max || 100;
        const required = this.isFieldRequired(fieldId);
        
        // Use field name from config or parameter, fallback to 'Name'
        const displayName = fieldName || this.getFieldDisplayName(fieldId) || 'Name';

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!name) {
            if (required) {
                this.setFieldError(field, fieldId, `${displayName} is required`);
            }
            // If not required and empty, no validation error
        } else if (name.length < minLength) {
            this.setFieldError(field, fieldId, `${displayName} must be at least ${minLength} characters`);
        } else if (name.length > maxLength) {
            this.setFieldError(field, fieldId, `${displayName} must be less than ${maxLength} characters`);
        } else if (!nameRegex.test(name)) {
            this.setFieldError(
                field, 
                fieldId, 
                `${displayName} can only contain letters, spaces, hyphens, and apostrophes`
            );
        } else {
            this.setFieldSuccess(field, fieldId, `${displayName} is valid`);
        }
    }

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_first_name': 'First name',
            'id_last_name': 'Last name',
            'id_username': 'Username',
            'id_title': 'Project title',
            'id_client': 'Client name'
        };
        return displayNames[fieldId] || 'Name';
    }
}
