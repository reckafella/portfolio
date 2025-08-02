import { FieldValidator } from './FieldValidator.js';

/**
 * SubjectValidator extends FieldValidator with subject-specific validation methods
 */
export class SubjectValidator extends FieldValidator {
    /**
     * Validate subject length and content
     * @param {string} fieldId - Subject field ID
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const subject = field.value.trim();

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!subject) {
            //this.setFieldError(field, fieldId, 'Subject is required');
        } else if (subject.length < 15) {
            this.setFieldError(field, fieldId, 'Subject must be at least 15 characters');
        } else if (subject.length < 20) {
            this.setFieldWarning(field, fieldId, 'Consider adding more details to your subject');
        } else if (subject.length > 150) {
            this.setFieldError(field, fieldId, 'Subject must be less than 150 characters');
        } else {
            this.setFieldSuccess(field, fieldId, '');
        }
    }
}
