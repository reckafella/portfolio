// Reusable Field Validation Utility Class
class FieldValidator {
    constructor() {
        this.validationErrors = window.validationErrors || {};
        this.updateSubmitButton = window.updateSubmitButton || function() {};
    }

    /**
     * Clear all validation styling and messages from a field
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to remove from validationErrors object
     */
    clearFieldValidation(field, errorKey) {
        if (!field) return;
        
        field.classList.remove('char-warning', 'char-error', 'char-valid');
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        delete this.validationErrors[errorKey];
    }

    /**
     * Set field to error state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to set in validationErrors object
     * @param {string} message - The error message to display
     */
    setFieldError(field, errorKey, message) {
        if (!field) return;
        
        field.classList.add('char-error');
        this.validationErrors[errorKey] = message;

        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = message;
        field.parentElement.appendChild(errorMessage);
    }

    /**
     * Set field to success state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to remove from validationErrors object
     * @param {string} message - The success message to display
     */
    setFieldSuccess(field, errorKey, message) {
        if (!field) return;
        
        field.classList.add('char-valid');
        delete this.validationErrors[errorKey];

        const successMessage = document.createElement('div');
        successMessage.className = 'validation-message success';
        successMessage.textContent = message;
        field.parentElement.appendChild(successMessage);
    }

    /**
     * Set field to warning state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to set in validationErrors object
     * @param {string} message - The warning message to display
     */
    setFieldWarning(field, errorKey, message) {
        if (!field) return;
        
        field.classList.add('char-warning');
        this.validationErrors[errorKey] = message;

        const warningMessage = document.createElement('div');
        warningMessage.className = 'validation-message warning';
        warningMessage.textContent = message;
        field.parentElement.appendChild(warningMessage);
    }

    /**
     * Update the submit button state
     */
    updateSubmitButtonState() {
        this.updateSubmitButton();
    }
}

// Create a global instance for reuse
const fieldValidator = new FieldValidator();

// function to validate passwords for signup and login forms
export function updatePasswordValidation() {
    const password1Field = document.getElementById('password1');
    const password2Field = document.getElementById('password2');

    // Handle single password field case (login form)
    if (password1Field) {
        const password = password1Field.value;
        fieldValidator.clearFieldValidation(password1Field, 'password1');

        if (password.length === 0) {
            // Empty field - no validation needed yet
        } else {
            const analysis = analyzePassword(password);

            if (analysis.isStrong) {
                fieldValidator.setFieldSuccess(password1Field, 'password1', 'Password meets requirements');
            } else {
                fieldValidator.setFieldError(password1Field, 'password1', 'Password must meet all requirements');
            }
        }

        // Update password strength indicator
        updatePasswordStrengthIndicator('password1', password);
    }

    // Handle registration form case (password1 & password2)
    if (password1Field && password2Field) {
        const password1 = password1Field.value;
        const password2 = password2Field.value;

        // Clear previous validation for password2
        fieldValidator.clearFieldValidation(password2Field, 'password2');

        // Validate password2 match
        if (password2.length === 0) {
            // Empty field - no validation needed yet
        } else {
            if (password1 !== password2) {
                fieldValidator.setFieldError(password2Field, 'password2', 'Passwords do not match');
            } else if (password1.length > 0 && analyzePassword(password1).isStrong) {
                fieldValidator.setFieldSuccess(password2Field, 'password2', 'Passwords match');
            } else if (password1.length > 0) {
                fieldValidator.setFieldError(password2Field, 'password2', 'New password must meet all requirements first');
            }
        }
    }

    // Update submit button
    fieldValidator.updateSubmitButtonState();
}

// function to validate passwords for password change forms
export function updatePasswordChangeValidation() {
    const oldPasswordField = document.getElementById('id_old_password');
    const newPassword1Field = document.getElementById('id_new_password1');
    const newPassword2Field = document.getElementById('id_new_password2');

    // Validate old password field
    if (oldPasswordField) {
        const oldPassword = oldPasswordField.value;
        fieldValidator.clearFieldValidation(oldPasswordField, 'old_password');

        if (oldPassword.length === 0) {
            // Empty field - no validation needed yet
        } else if (oldPassword.length < 8) {
            // Basic length check for old password
            fieldValidator.setFieldError(oldPasswordField, 'old_password', 'Current password appears invalid');
        } else {
            // Old password has content and meets basic length - mark as valid for UI
            oldPasswordField.classList.add('char-valid');
        }
    }

    // Validate new password 1
    if (newPassword1Field) {
        const newPassword1 = newPassword1Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';
        
        fieldValidator.clearFieldValidation(newPassword1Field, 'new_password1');

        if (newPassword1.length === 0) {
            // Empty field - no validation needed yet
        } else {
            const analysis = analyzePassword(newPassword1);
            
            // Check if new password is same as old password
            if (oldPassword.length > 0 && newPassword1 === oldPassword) {
                fieldValidator.setFieldError(newPassword1Field, 'new_password1', 'New password must be different from current password');
            } else if (!analysis.isStrong) {
                fieldValidator.setFieldError(newPassword1Field, 'new_password1', 'Password must meet all requirements');
            } else {
                fieldValidator.setFieldSuccess(newPassword1Field, 'new_password1', 'Password meets requirements');
            }
        }

        // Update password strength indicator for new password
        updatePasswordStrengthIndicator('id_new_password1', newPassword1);
    }

    // Validate new password 2 (confirmation)
    if (newPassword2Field) {
        const newPassword1 = newPassword1Field ? newPassword1Field.value : '';
        const newPassword2 = newPassword2Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';

        fieldValidator.clearFieldValidation(newPassword2Field, 'new_password2');

        if (newPassword2.length === 0) {
            // Empty field - no validation needed yet
        } else {
            // Check if confirmation matches new password
            if (newPassword1 !== newPassword2) {
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'Passwords do not match');
            } 
            // Check if confirmation is same as old password
            else if (oldPassword.length > 0 && newPassword2 === oldPassword) {
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'New password must be different from current password');
            }
            // Check if new password meets strength requirements
            else if (newPassword1.length > 0 && !analyzePassword(newPassword1).isStrong) {
                // Don't mark as valid until the first password is strong
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'New password must meet all requirements first');
            }
            // All validations passed
            else if (newPassword1.length > 0) {
                fieldValidator.setFieldSuccess(newPassword2Field, 'new_password2', 'Passwords match');
            }
        }
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}

// Export the validator class for use in other modules
export { FieldValidator, fieldValidator };
