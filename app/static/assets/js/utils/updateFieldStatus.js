/**
 * FieldValidator class provides methods to manage field validation states
 * and update the submit button state based on validation results.
 */
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
export const fieldValidator = new FieldValidator();
