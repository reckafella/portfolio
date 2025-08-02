import { FieldValidator } from './FieldValidator.js';

/**
 * NameValidator extends FieldValidator with name-specific validation methods
 */
export class NameValidator extends FieldValidator {
    /**
     * Validate name format and length
     * @param {string} fieldId - Name field ID
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const name = field.value.trim();
        const nameRegex = /^[a-zA-Z\s\-']+$/; // Letters, spaces, hyphens, apostrophes

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!name) {
            //this.setFieldError(field, fieldId, 'Name is required');
        } else if (name.length < 2) {
            this.setFieldError(field, fieldId, 'Name must be at least 2 characters');
        } else if (name.length > 50) {
            this.setFieldError(field, fieldId, 'Name must be less than 50 characters');
        } else if (!nameRegex.test(name)) {
            this.setFieldError(
                field, 
                fieldId, 
                'Name can only contain letters, spaces, hyphens, and apostrophes'
            );
        } else {
            this.setFieldSuccess(field, fieldId, '');
        }
    }
}
