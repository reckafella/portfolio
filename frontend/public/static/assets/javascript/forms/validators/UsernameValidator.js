import { FieldValidator } from "./FieldValidator.js";

/**
 * UsernameValidator class for validating username fields
 * Extends FieldValidator to provide username-specific validation logic
 * @class UsernameValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the username input field
 */
export class UsernameValidator extends FieldValidator {
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const username = field.value.trim();
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        // Get field configuration (merge with data attributes)
        const required = this.isFieldRequired(fieldId);

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!username) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            }
        } else if (username.length < 3) {
            this.setFieldError(field, fieldId, 'Username must be at least 3 characters.');
        } else if (username.length > 20) {
            this.setFieldError(field, fieldId, 'Username exceeds maximum length of 20 characters.');
        } else if (!usernameRegex.test(username)) {
            this.setFieldError(field, fieldId, 'Username can only contain letters, numbers, and underscores.');
        } else {
            this.setFieldSuccess(field, fieldId, 'Username is valid.');
        }
    }
}
