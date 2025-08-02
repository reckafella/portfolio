import { FormManager } from "../manager/FormManager.js";

/**
 * FieldValidator provides methods to manage field validation states
 * @param {FormManager} formManager - Instance of FormManager to handle form state
 */
export class FieldValidator {
    constructor(formManager) {
        this.formManager = formManager;
        this.validationErrors = this.formManager.validationErrors || {};
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
        delete this.formManager.validationErrors[errorKey];
        if (window.validationErrors) {
            delete window.validationErrors[errorKey];
        }
        this.formManager.updateSubmitButton('default');
    }

    /**
     * Set field to error state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to set in validationErrors object
     * @param {string} message - The error message to display
     */
    setFieldError(field, errorKey, message) {
        if (!field) return;

        field.classList.remove('char-warning', 'char-valid');
        field.classList.add('char-error');
        this.formManager.validationErrors[errorKey] = message;
        if (window.validationErrors) {
            window.validationErrors[errorKey] = message;
        }

        // Remove existing message first
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = message;
        field.parentElement.appendChild(errorMessage);
        this.formManager.updateSubmitButton('disabled');
    }

    /**
     * Set field to success state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to remove from validationErrors object
     * @param {string} message - The success message to display
     */
    setFieldSuccess(field, errorKey, message) {
        if (!field) return;

        field.classList.remove('char-warning', 'char-error');
        field.classList.add('char-valid');
        delete this.formManager.validationErrors[errorKey];
        if (window.validationErrors) {
            delete window.validationErrors[errorKey];
        }

        // Remove existing message first
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        /*
        const successMessage = document.createElement('div');
        successMessage.className = 'validation-message success';
        successMessage.textContent = message;
        field.parentElement.appendChild(successMessage);
        */
        this.formManager.updateSubmitButton('default');
    }

    /**
     * Set field to warning state with message
     * @param {HTMLElement} field - The input field element
     * @param {string} errorKey - The key to set in validationErrors object
     * @param {string} message - The warning message to display
     */
    setFieldWarning(field, errorKey, message) {
        if (!field) return;

        field.classList.remove('char-error', 'char-valid');
        field.classList.add('char-warning');
        this.formManager.validationErrors[errorKey] = message;
        if (window.validationErrors) {
            window.validationErrors[errorKey] = message;
        }

        // Remove existing message first
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const warningMessage = document.createElement('div');
        warningMessage.className = 'validation-message warning';
        warningMessage.textContent = message;
        field.parentElement.appendChild(warningMessage);
        this.formManager.updateSubmitButton('default');
    }
}
