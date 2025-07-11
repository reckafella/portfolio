/**
 * FormValidator - A reusable form validation class
 * 
 * Usage:
 * const validator = new FormValidator('my-form-id', {
 *     fields: {
 *         'id_username': { 
 *             type: 'text', 
 *             maxLength: 30, 
 *             pattern: /^[a-zA-Z0-9_]+$/, 
 *             errorMessage: 'Username can only contain letters, numbers, and underscores' 
 *         },
 *         'id_email': { type: 'email' },
 *         'id_password': { type: 'password', minLength: 8 }
 *     }
 * });
 */
/* 
import { toastManager } from './toast.js';

export default class FormInputValidator {
    constructor(formId, config = {}) {
        this.formId = formId;
        this.form = document.getElementById(formId);
        this.submitButton = config.submitButtonId ? 
            document.getElementById(config.submitButtonId) : 
            (this.form ? this.form.querySelector('button[type="submit"]') : null);
        
        this.config = {
            fields: {},
            showCharacterCount: true,
            showValidationMessages: true,
            validateOnInput: true,
            validateOnBlur: true,
            validateOnPaste: true,
            loadingTimeout: 10000,
            ...config
        };
        
        this.validationErrors = {};
        this.validators = this.initializeValidators();
        
        if (this.form) {
            this.init();
        } else {
            toastManager.show('error', `Form with id "${formId}" not found`);
        }
    }
    
    /**
     * Initialize built-in validators
     */
    /*
    initializeValidators() {
        return {
            email: {
                validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage: 'Please enter a valid email address'
            },
            text: {
                validate: (value) => /^[a-zA-Z\s]+$/.test(value),
                errorMessage: 'Please enter a valid name (letters and spaces only)'
            },
            alphanumeric: {
                validate: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
                errorMessage: 'Please enter valid text (letters, numbers, and spaces only)'
            },
            captcha: {
                validate: (value) => /^[a-zA-Z0-9]+$/.test(value),
                errorMessage: 'Please enter a valid captcha code (letters and numbers only)'
            },
            username: {
                validate: (value) => /^[a-zA-Z0-9_]+$/.test(value),
                errorMessage: 'Username can only contain letters, numbers, and underscores'
            },
            password: {
                validate: (value) => value.length >= 8,
                errorMessage: 'Password must be at least 8 characters long'
            }
        };
    }
    
    /**
     * Initialize the form validator
     *//*
    init() {
        this.setupFieldValidation();
        this.setupFormSubmission();
        this.initialValidation();
    }
    
    /**
     * Setup validation for individual fields
     *//*
    setupFieldValidation() {
        Object.entries(this.config.fields).forEach(([fieldId, fieldConfig]) => {
            const field = document.getElementById(fieldId);
            if (!field) {
                toastManager.show('warning', `Field with id "${fieldId}" not found`);
                return;
            }
            
            // Setup character counting if enabled and maxLength is specified
            if (this.config.showCharacterCount && fieldConfig.maxLength && fieldConfig.showCharacterCount !== false) {
                this.setupCharacterCounter(fieldId, fieldConfig);
            }
            
            // Setup validation event listeners
            if (this.config.validateOnInput) {
                field.addEventListener('input', () => this.validateField(fieldId, fieldConfig));
            }
            
            if (this.config.validateOnBlur) {
                field.addEventListener('blur', () => this.validateField(fieldId, fieldConfig));
            }
            
            if (this.config.validateOnPaste) {
                field.addEventListener('paste', () => {
                    setTimeout(() => this.validateField(fieldId, fieldConfig), 10);
                });
            }
            
            // Add change listener for submit button state
            field.addEventListener('input', () => this.updateSubmitButton());
            field.addEventListener('change', () => this.updateSubmitButton());
        });
    }
    
    /**
     * Setup character counter for a field
     *//*
    setupCharacterCounter(fieldId, fieldConfig) {
        const field = document.getElementById(fieldId);
        const counterId = fieldConfig.counterId || `${fieldId}-count`;
        const counter = document.getElementById(counterId);
        
        if (!counter) {
            // console.warn(`Character counter with id "${counterId}" not found for field "${fieldId}"`);
            toastManager.show('warning', `Character counter with id "${counterId}" not found for field "${fieldId}"`);
            return;
        }
        
        field.addEventListener('input', () => this.updateCharacterCount(fieldId, fieldConfig));
        field.addEventListener('paste', () => {
            setTimeout(() => this.updateCharacterCount(fieldId, fieldConfig), 10);
        });
        field.addEventListener('keyup', () => this.updateCharacterCount(fieldId, fieldConfig));
    }
    
    /**
     * Update character count and styling
     *//*
    updateCharacterCount(fieldId, fieldConfig) {
        const field = document.getElementById(fieldId);
        const counterId = fieldConfig.counterId || `${fieldId}-count`;
        const counter = document.getElementById(counterId);
        
        if (!field || !counter) return;
        
        const currentLength = field.value.length;
        const maxLength = fieldConfig.maxLength;
        const percentage = (currentLength / maxLength) * 100;
        
        // Update counter text
        counter.textContent = currentLength;
        
        // Remove previous classes
        field.classList.remove('char-warning', 'char-error', 'char-valid');
        
        // Handle counter container styling if it exists
        const counterContainer = counter.parentElement?.parentElement;
        if (counterContainer) {
            counterContainer.classList.remove('warning', 'error');
        }
        
        // Remove previous character count message
        this.removeValidationMessage(field, 'char-count');
        
        // Apply styling based on character count
        if (currentLength > maxLength) {
            // Over limit - error state
            field.classList.add('char-error');
            if (counterContainer) counterContainer.classList.add('error');
            
            this.validationErrors[fieldId] = `Character limit exceeded by ${currentLength - maxLength} characters`;
            this.showValidationMessage(field, this.validationErrors[fieldId], 'error', 'char-count');
            
        } else if (percentage >= 90) {
            // Near limit - warning state
            field.classList.add('char-warning');
            if (counterContainer) counterContainer.classList.add('warning');
            
            // Remove character count error but keep other validation errors
            if (this.validationErrors[fieldId] && this.validationErrors[fieldId].includes('Character limit exceeded')) {
                delete this.validationErrors[fieldId];
            }
            
            const remaining = maxLength - currentLength;
            this.showValidationMessage(field, `Only ${remaining} characters remaining`, 'warning', 'char-count');
            
        } else if (currentLength > 0) {
            // Valid state
            field.classList.add('char-valid');
            
            // Remove character count error but keep other validation errors
            if (this.validationErrors[fieldId] && this.validationErrors[fieldId].includes('Character limit exceeded')) {
                delete this.validationErrors[fieldId];
            }
        }
        
        this.updateSubmitButton();
    }
    
    /**
     * Validate a specific field
     *//*
    validateField(fieldId, fieldConfig) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const value = field.value.trim();
        
        // Remove previous validation classes and messages (but not char-count messages)
        field.classList.remove('char-warning', 'char-error', 'char-valid');
        this.removeValidationMessage(field, 'validation');
        
        // Skip validation if field is empty (unless it's required)
        if (value.length === 0) {
            if (!fieldConfig.required) {
                delete this.validationErrors[fieldId];
                this.updateSubmitButton();
                return;
            }
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Check minimum length
        if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
            isValid = false;
            errorMessage = fieldConfig.minLengthMessage || `Minimum length is ${fieldConfig.minLength} characters`;
        }
        
        // Check maximum length (only for validation, not character counting)
        else if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
            isValid = false;
            errorMessage = `Maximum length is ${fieldConfig.maxLength} characters`;
        }

        // Check pattern or use built-in validator
        else if (value.length > 0) {
            if (fieldConfig.pattern) {
                isValid = fieldConfig.pattern.test(value);
                errorMessage = fieldConfig.errorMessage || 'Invalid format';
            } else if (fieldConfig.type && this.validators[fieldConfig.type]) {
                const validator = this.validators[fieldConfig.type];
                isValid = validator.validate(value);
                errorMessage = fieldConfig.errorMessage || validator.errorMessage;
            }
        }
        
        // Apply validation results
        if (!isValid) {
            field.classList.add('char-error');
            this.validationErrors[fieldId] = errorMessage;
            
            if (this.config.showValidationMessages) {
                this.showValidationMessage(field, errorMessage, 'error', 'validation');
            }
        } else if (value.length > 0) {
            field.classList.add('char-valid');
            // Only remove validation errors, not character count errors
            if (this.validationErrors[fieldId] && !this.validationErrors[fieldId].includes('Character limit exceeded')) {
                delete this.validationErrors[fieldId];
            }
        }
        
        this.updateSubmitButton();
    }
    
    /**
     * Show validation message
     *//*
    showValidationMessage(field, message, type, category) {
        if (!this.config.showValidationMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `validation-message ${type} ${category}`;
        messageElement.textContent = message;
        field.parentElement.appendChild(messageElement);
    }
    
    /**
     * Remove validation message
     *//*
    removeValidationMessage(field, category) {
        const existingMessage = field.parentElement.querySelector(`.validation-message.${category}`);
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    /**
     * Update submit button state
     *//*
    updateSubmitButton() {
        if (!this.submitButton) return;
        
        const hasErrors = Object.keys(this.validationErrors).length > 0;
        const isEmpty = !this.isFormValid();
        
        if (hasErrors) {
            this.submitButton.disabled = true;
            this.submitButton.title = 'Please fix validation errors before submitting';
        } else if (isEmpty) {
            this.submitButton.disabled = true;
            this.submitButton.title = 'Please fill in all required fields';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.title = '';
        }
    }
    
    /**
     * Check if form is valid (all required fields filled)
     *//*
    isFormValid() {
        const requiredFields = Object.entries(this.config.fields)
            .filter(([fieldId, config]) => config.required)
            .map(([fieldId, config]) => fieldId);
        
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim().length > 0;
        });
    }
    
    /**
     * Setup form submission handler
     *//*
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            // Final validation before submission
            this.validateAllFields();
            
            const hasErrors = Object.keys(this.validationErrors).length > 0;
            const isEmpty = !this.isFormValid();
            
            if (hasErrors || isEmpty) {
                e.preventDefault();
                
                // Show alert with specific issues
                let alertMessage = 'Please fix the following issues:\n\n';
                if (isEmpty) {
                    alertMessage += '• All required fields must be filled\n';
                }
                if (hasErrors) {
                    Object.values(this.validationErrors).forEach(error => {
                        alertMessage += '• ' + error + '\n';
                    });
                }
                
                toastManager.show('warning', alertMessage);
                return false;
            }
            
            // Show loading state
            this.showLoadingState();
        });
    }
    
    /**
     * Validate all fields
     *//*
    validateAllFields() {
        Object.entries(this.config.fields).forEach(([fieldId, fieldConfig]) => {
            this.validateField(fieldId, fieldConfig);
        });
    }
    
    /**
     * Show loading state on submit button
     *//*
    showLoadingState() {
        if (!this.submitButton) return;
        
        const originalText = this.submitButton.textContent;
        const loadingText = this.submitButton.getAttribute('data-loading-text') || 'Processing...';
        
        this.submitButton.disabled = true;
        this.submitButton.textContent = loadingText;
        
        // Reset button after timeout
        setTimeout(() => {
            this.submitButton.disabled = false;
            this.submitButton.textContent = originalText;
        }, this.config.loadingTimeout);
    }
    
    /**
     * Initial validation run
     *//*
    initialValidation() {
        // Update character counts
        Object.entries(this.config.fields).forEach(([fieldId, fieldConfig]) => {
            if (fieldConfig.maxLength) {
                this.updateCharacterCount(fieldId, fieldConfig);
            }
            this.validateField(fieldId, fieldConfig);
        });
        
        this.updateSubmitButton();
    }
    
    /**
     * Add custom validator
     *//*
    addValidator(name, validateFn, errorMessage) {
        this.validators[name] = {
            validate: validateFn,
            errorMessage: errorMessage
        };
    }
    
    /**
     * Get validation errors
     *//*
    getValidationErrors() {
        return { ...this.validationErrors };
    }
    
    /**
     * Clear all validation errors
     *//*
    clearValidationErrors() {
        this.validationErrors = {};
        
        // Remove all validation messages and classes
        Object.keys(this.config.fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('char-warning', 'char-error', 'char-valid');
                this.removeValidationMessage(field, 'validation');
                this.removeValidationMessage(field, 'char-count');
            }
        });
        
        this.updateSubmitButton();
    }
    
    /**
     * Destroy the validator (remove event listeners)
     *//*
    destroy() {
        if (!this.form) return;
        
        // Remove all event listeners
        this.form.removeEventListener('submit', this.setupFormSubmission);
        
        Object.entries(this.config.fields).forEach(([fieldId, fieldConfig]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.removeEventListener('input', this.validateField.bind(this, fieldId, fieldConfig));
                field.removeEventListener('blur', this.validateField.bind(this, fieldId, fieldConfig));
                field.removeEventListener('paste', () => {
                    setTimeout(() => this.validateField(fieldId, fieldConfig), 10);
                });
            }
        });
        
        // Clear validation errors
        this.clearValidationErrors();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        const formId = form.id;
        const config = {
            fields: {}
        };
        form.querySelectorAll('input, textarea').forEach(input => {
            const fieldId = input.id;
            if (fieldId) {
                // Check if it's a checkbox or boolean type
                const isBoolean = input.type === 'checkbox' || input.type === 'radio';
                
                config.fields[fieldId] = {
                    type: input.type,
                    required: input.required || false,
                    errorMessage: input.dataset.errorMessage || ''
                };
                
                // Only add length validations for non-boolean fields
                if (!isBoolean) {
                    config.fields[fieldId].maxLength = input.maxLength || null;
                    config.fields[fieldId].minLength = input.minLength || null;
                    config.fields[fieldId].pattern = input.pattern ? new RegExp(input.pattern) : null;
                    config.fields[fieldId].counterId = input.dataset.counterId || null;
                    config.fields[fieldId].showCharacterCount = input.dataset.showCharacterCount !== 'false';
                }

                // captcha field set to 6 characters
                if (fieldId === 'id_captcha_0' || fieldId === 'id_captcha_1') {
                    config.fields[fieldId] = {
                        type: 'captcha',
                        required: input.required || false,
                        maxLength: 6,
                        minLength: 6,
                        counterId: input.dataset.counterId || 'id_captcha-count',
                        pattern: input.pattern ? new RegExp(input.pattern) : null,
                        errorMessage: input.dataset.errorMessage || '',
                        showCharacterCount: true
                    };
                }
            }
        });
        new FormInputValidator(formId, config);
    });
});

export const formInputValidator = new FormInputValidator();
 */
