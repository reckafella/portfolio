import { FieldValidator } from "./FieldValidator.js";

/**
 * EmailValidator class for validating email fields
 * Extends FieldValidator to provide email-specific validation logic
 * @class EmailValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the email input field
 */
export class EmailValidator extends FieldValidator {
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const config = this.getFieldConfig(fieldId);
        const maxLength = config?.maxLength || 70;
        const displayName = fieldName || this.getFieldDisplayName(fieldId) || 'Email';
        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!email) {
            if (this.isFieldRequired(fieldId)) {
                this.setFieldError(field, fieldId, '');
            }
        } else if (email.length > maxLength) {
            this.setFieldError(field, fieldId, `Email exceeds maximum length of ${maxLength} characters.`);
        } else if (!emailRegex.test(email)) {
            this.setFieldError(field, fieldId, `Please enter a valid ${displayName}.`);
        } else {
            this.setFieldSuccess(field, fieldId, `${displayName} is valid.`);
        }
    }

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_email': 'Email Adddress',
            'id_contact_email': 'Contact Email',
            'id_user_email': 'User Email'
        };
        return displayNames[fieldId] || super.getFieldDisplayName(fieldId);
    }
}
