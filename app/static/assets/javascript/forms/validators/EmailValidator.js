import { FieldValidator } from "./FieldValidator.js";

/**
 * EmailValidator class for validating email fields
 * Extends FieldValidator to provide email-specific validation logic
 * @class EmailValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the email input field
 */
export class EmailValidator extends FieldValidator {
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (email === '') {
            //this.setFieldError(field, fieldId, 'Email cannot be empty.');
        } else if (email.length > 70) {
            this.setFieldError(field, fieldId, 'Email exceeds maximum length of 70 characters.');
        } else if (!emailRegex.test(email)) {
            this.setFieldError(field, fieldId, 'Please enter a valid email address.');
        } else {
            this.setFieldSuccess(field, fieldId, 'Email is valid.');
        }
    }
}
