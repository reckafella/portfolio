import { TagsValidator } from '../validators/TagsValidator.js';

/**
 * FormManager is the central module for managing forms in the application.
 * It handles form initialization, validation, and submission.
 * @param {string} formId - The ID of the form to manage
 * @param {Object} fieldConfigs - Configuration for form fields
 */
export class FormManager {
    constructor(formId, fieldConfigs = {}) {
        this.form = document.getElementById(formId);
        this.fieldConfigs = fieldConfigs;
        this.validationErrors = window.validationErrors || {};
        this.submitButton = window.submitButton || document.querySelector('#submitButton');
        this.updateSubmitButton = window.updateSubmitButton || function() {};
        this.originalSubmitText = this.submitButton?.textContent || 'Submit';
        this.validators = new Map();
        this.plugins = [];

        if (this.form) {
            this.setupForm();
        } else {
            console.warn(`Form with ID ${formId} not found.`);
            window.toastManager?.show('error', `Form with ID ${formId} not found.`);
        }

        if (!this.submitButton) {
            console.warn('Submit button not found. Ensure your form has a submit button with ID "submitButton" or a button of type "submit".');
            window.toastManager?.show('error', 'Submit button not found. Ensure your form has a submit button with ID "submitButton" or a button of type "submit".');
        }
    }

    /**
     * Initialize the form setup
     */
    setupForm() {
        this.setupEventListeners();
        // Don't automatically setup fields - let the calling code control this
        this.setButtonState();
    }

    /**
     * Register a custom validator for a field
     * @param {string} fieldId - The ID of the field to validate
     * @param {Function} validator - The validation function
     * @returns {FormManager} - Returns the instance for chaining
     */
    registerValidator(fieldId, validator) {
        if (typeof validator === 'function') {
            this.validators.set(fieldId, validator);
        } else {
            console.warn(`Validator for field ${fieldId} is not a function.`);
        }
        return this;
    }

    /**
     * Register a plugin to extend form functionality
     * @param {Object} plugin - The plugin object with an `init` method
     * @returns {FormManager} - Returns the instance for chaining
     */
    registerPlugin(plugin) {
        if (plugin && typeof plugin.setup === 'function') {
            plugin.setup();
            this.plugins.push(plugin);
        } else {
            console.warn('Invalid plugin provided.');
        }
        return this;
    }

    /**
     * Set up fields based on provided configurations
     */
    setupFields() {
        Object.entries(this.fieldConfigs).forEach(([fieldId, config]) => {
            this.setupField(fieldId, config);
        })
    }

    /**
     * Set up a single field with its configuration
     * @param {string} fieldId - The ID of the field to set up
     * @param {Object} config - Configuration for the field
     */
    setupField(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        if (config.counterId) this.setupCharacterCount(field, config);
        // Always set up validation if a validator is registered or config has validate function
        if (this.validators.has(fieldId) || (config.validate && typeof config.validate === 'function')) {
            this.setupFieldValidation(field, fieldId, config);
        }
    }

    /**
     * Set up character count for a field
     * @param {HTMLElement} field - The input field element
     * @param {Object} config - Configuration for the field
     */
    setupCharacterCount(field, config) {
        const counter = document.getElementById(config.counterId);
        if (!counter) return;

        const updateCount = () => {
            const currentLength = field.value.length;
            const min = config.min || config.length;
            const max = config.max || config.length;
            let chars;
            if (currentLength == 1) {
                chars = 'char';
            } else {
                chars = 'chars';
            }
            counter.classList.remove('text-danger', 'text-success', 'text-warning');

            counter.textContent = `${currentLength} / ${max} ${chars}`;

            if (currentLength < min) {
                counter.classList.add('text-danger');
                counter.classList.remove('text-success', 'text-warning');
            } else if (currentLength > max) {
                counter.classList.add('text-danger');
                counter.classList.remove('text-success', 'text-warning');
            } else {
                counter.classList.add('text-success');
                counter.classList.remove('text-danger', 'text-warning');
            }
        };
        field.addEventListener('input', updateCount);
        updateCount();
        this.setButtonState();
    }
    /**
     * Set up validation for a field
     * @param {HTMLElement} field - The input field element
     * @param {string} fieldId - The ID of the field
     * @param {Object} config - Configuration for the field
     */
    setupFieldValidation(field, fieldId, config) {
        const validationHandler = () => {
            const customValidator = this.validators.get(fieldId);
            if (customValidator) {
                customValidator(fieldId);
            } else if (config.validate && typeof config.validate === 'function') {
                config.validate(fieldId);
            }
        };

        ['input', 'change', 'blur', 'paste'].forEach(event => {
            if (event === 'paste') {
                field.addEventListener(event, () => setTimeout(validationHandler, 10));
            } else {
                field.addEventListener(event, validationHandler);
            }
        });
        // Initial validation
        setTimeout(validationHandler, 100);
    }

    /**
     * Handle form submission
     * @async
     * @param {Event} event - The submit event
     * @returns {Promise<void>}
     * @throws {Error} If form submission fails
     * @description This method should be overridden in subclasses to implement specific submission logic.
     */
    async handleFormSubmission(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            console.warn('Form validation failed. Submission aborted.');
            return;
        };
        this.setButtonState('loading');

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            if (data.success) {
                this.handleFormSubmissionSuccess(data);
            } else {
                this.handleFormSubmissionError(data);
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            this.handleFormSubmissionException(error);
        } finally {
            this.setButtonState('default');
        }
    }
    /**
     * handle successful form submission
     * @param {Object} data - The response data from the server
     */
    handleFormSubmissionSuccess(data) {
        this.setButtonState('success');
        if (window.toastManager) {
            window.toastManager.show('success', data.message, data.messages);
        }
        if (data.redirect_url) {
            setTimeout(() => {
                window.location.href = data.redirect_url;
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    /**
     * Handle form submission error
     * @param {Object} data - The error response data from the server
     */
    handleFormSubmissionError(data) {
        this.setButtonState('error');
        const hasCaptchaError =
            (data.errors &&
                (data.errors.captcha ||
                    data.captcha_error ||
                    (typeof data.errors === 'string' && data.errors.toLowerCase().includes('captcha'))));
        if (hasCaptchaError && this.captchaRefreshButton) {
            this.captchaRefreshButton.click();
            this.captchaRefreshButton.classList.add('rotating');
            setTimeout(() => {
                this.captchaRefreshButton.classList.remove('rotating');
            }, 1000);
        }
        this.displayFieldErrors(data.errors);
        if (window.toastManager) {
            window.toastManager.show('danger', 'Please correct the following errors:', data.errors);
        }
    }

    /**
     * Handle form submission exception
     * @param {Error} error - The error that occurred during submission
     */
    handleFormSubmissionException(error) {
        this.setButtonState('danger');
        if (window.toastManager) {
            console.log('An unexpected error occurred during form submission:', error.message);
            window.toastManager.show('danger', 'An unexpected error occurred:', [error.message]);
        } else {
            alert('An unexpected error occurred. Please try again later.' + error.message);
        }
    }

    /**
     * Setup event listeners for the form
     */
    setupEventListeners() {
        if (!this.form) return;
        this.form.addEventListener('submit', this.handleFormSubmission.bind(this));
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.clearFieldErrors());
            window.toastManager?.setupCloseButton();
        });
    }

    /**
     * Display field validation errors
     * @param {Object} errors - An object containing field IDs and their error messages
     */
    displayFieldErrors(errors) {
        Object.entries(errors).forEach(([fieldId, message]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                const errorMessage = Array.isArray(message) ? message[0] : message;
                this.fieldValidator.setFieldError(field, fieldId, errorMessage);
            }
        });
    }

    /**
     * Clear all field validation errors
     */
    clearFieldErrors() {
        Object.keys(this.validationErrors).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                delete this.validationErrors[fieldId];
                field.classList.remove('char-warning', 'char-error', 'char-valid');
                const existingMessage = field.parentElement.querySelector('.validation-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                this.updateSubmitButton('default');
            }
        });
        this.validationErrors = {};
        this.setButtonState();
    }

    /**
     * Check if the form is valid
     * @returns {boolean} - True if the form is valid, false otherwise
     */
    isFormValid() {
        return Object.keys(this.validationErrors).length === 0 || this.submitButton.disabled === false;
    }

    /**
     * Update the submit button state
     * @param {string} state - The state to set ('default', 'loading', 'disabled')
     */
    setButtonState(state) {
        if (!this.submitButton) return;

        switch (state) {
            case 'loading':
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> ${this.submitButton.getAttribute('data-loading-text') || 'Loading...'}`;
                break;
            case 'disabled':
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `<i class="bi bi-lock-fill"></i> ${this.originalSubmitText}`;
                break;
            case 'success':
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = `<i class="bi bi-check-circle-fill"></i> Success`;
                setTimeout(() => this.setButtonState('default'), 2000);
                break;
            case 'error':
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Try Again`;
                setTimeout(() => this.setButtonState('default'), 2000);
                break;
            default:
                this.submitButton.disabled = false;
                this.submitButton.textContent = this.originalSubmitText;
                break;
        }
    }

    /**
     * Set the form manager's button state based on current validation errors
     * @param {string} state - The state to set ('default', 'loading', 'disabled', 'success', 'error')
     * @description This method is used to update the submit button state based on validation results.
     * It can be called from field validators or plugins to ensure the button reflects the current form state.
     */
    updateSubmitButton(state) {
        if (window.updateSubmitButton && typeof window.updateSubmitButton === 'function') {
            window.updateSubmitButton(state);
        } else {
            this.setButtonState(state);
        }
    }
}
