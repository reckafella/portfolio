import { FieldValidator } from "./FieldValidator.js";

/**
 * CaptchaValidator class for validating captcha fields
 * Extends FieldValidator to provide captcha-specific validation logic
 * @class CaptchaValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the captcha input field
 */
export class CaptchaValidator extends FieldValidator { 
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const captchaValue = field.value.trim();
        // More flexible regex - allow letters and numbers, not just letters
        const captchaRegex = /^[a-zA-Z0-9]{4,8}$/;

        const required = this.isFieldRequired(fieldId);
        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!captchaValue) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            }
        } else if (!captchaRegex.test(captchaValue)) {
            this.setFieldError(field, fieldId, 'Please enter the characters from the image.');
        } else {
            this.setFieldSuccess(field, fieldId, '');
        }
    }

    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_captcha_1': 'Captcha',
        };
        return displayNames[fieldId] || super.getFieldDisplayName(fieldId) || 'Captcha';
    }

    /**
     * Setup captcha input with refresh button
     * @param {string} fieldId - The ID of the captcha input field
     */
    setupCaptcha(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const captchaImage = this.formManager.form.querySelector('.captcha');
        if (!captchaImage) return;

        if (!field.parentElement.classList.contains('captcha-input-container')) {
            const container = document.createElement('div');
            container.className = 'captcha-input-container';
            field.parentElement.insertBefore(container, field);
            container.appendChild(field);
        }
        field.classList.add('captcha-input-with-refresh');

        // create refresh button if it doesn't exist
        if (!field.parentElement.querySelector('.captcha-refresh-btn')) {
            const refreshButton = document.createElement('button');
            refreshButton.type = 'button';
            refreshButton.className = 'captcha-refresh-btn';
            refreshButton.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
            refreshButton.title = 'Refresh Captcha';
            refreshButton.addEventListener('click', (event) => {
                // Trigger captcha refresh logic
                event.preventDefault();
                this.refreshCaptcha();
            });
            field.parentElement.appendChild(refreshButton);
            this.captchaRefreshButton = refreshButton;
        }

        // Store reference to FormManager for form submission error handling
        this.formManager.captchaRefreshButton = this.captchaRefreshButton;
    }

    /**
     * Handle form submission errors - automatically refresh captcha if there are any validation errors
     * This should be called by FormManager when form submission fails
     */
    handleFormSubmissionError() {
        console.log('CaptchaValidator: Form submission failed, refreshing captcha...');
        this.refreshCaptcha();
    }

    /**
     * Check if captcha needs refresh based on error response
     * @param {Object} errors - Error response from server
     * @returns {boolean} - True if captcha should be refreshed
     */
    shouldRefreshCaptcha(errors) {
        // Refresh captcha if:
        // 1. There are any validation errors (captcha becomes invalid after failed submission)
        // 2. Specific captcha error is present
        // 3. Any server error occurred
        return !!(errors && (
            Object.keys(errors).length > 0 || 
            errors.captcha ||
            errors.captcha_error ||
            (typeof errors === 'string' && errors.toLowerCase().includes('captcha'))
        ));
    }

    /**
     * Refresh captcha image
     */
    async refreshCaptcha() {
        // apply rotation to the captcha button
        if (this.captchaRefreshButton) {
            this.captchaRefreshButton.classList.add('rotating');
            this.captchaRefreshButton.disabled = true;
        }

        const captchaImage = this.formManager.form.querySelector('.captcha');
        const captchaTextInput = this.formManager.form.querySelector('input[name="captcha_1"]');
        const captchaHiddenInput = this.formManager.form.querySelector('input[name="captcha_0"]');

        const originalSrc = captchaImage?.src;
        if (captchaImage) {
            captchaImage.style.opacity = '0.5';
        }
        if (captchaTextInput) {
            captchaTextInput.value = '';
        }

        try {
            this.clearFieldValidation(captchaTextInput, 'id_captcha_1');

            // Fetch new captcha from the server
            console.log('CaptchaValidator: Fetching new captcha...');
            const response = await fetch('/captcha/refresh/');

            if (!response.ok) {
                console.error('CaptchaValidator: Refresh failed with status:', response.status);
                this.setFieldError(captchaTextInput, 'id_captcha_1', 'Failed to refresh captcha. Please try again.');
                if (window.toastManager) {
                    window.toastManager.show('danger', 'Error', ['Captcha refresh failed. Please try again.']);
                }
                throw new Error('Failed to refresh captcha');
            }

            const data = await response.json();
            console.log('CaptchaValidator: Received captcha data:', data);
            
            if (!data.key || !data.image_url) {
                console.error('CaptchaValidator: Invalid captcha data received:', data);
                this.setFieldError(captchaTextInput, 'id_captcha_1', 'Invalid captcha response from server.');
                if (window.toastManager) {
                    window.toastManager.show('danger', 'Error', ['Invalid captcha response from server.']);
                }
                throw new Error('Invalid captcha data received');
            }

            // Update both the hidden key field and the image
            if (captchaHiddenInput) {
                captchaHiddenInput.value = data.key;
                console.log('CaptchaValidator: Updated hidden field with key:', data.key);
            }
            
            if (captchaImage) {
                captchaImage.src = data.image_url;
                captchaImage.style.opacity = '1';
                captchaImage.classList.add('captcha-refreshed');
                setTimeout(() => {
                    captchaImage.classList.remove('captcha-refreshed');
                }, 1000);
                console.log('CaptchaValidator: Updated image with URL:', data.image_url);
            }
            
            // Focus the text input after refresh
            if (captchaTextInput) {
                setTimeout(() => captchaTextInput.focus(), 100);
            }
            
        } catch (error) {
            console.error('Captcha refresh error:', error);
            if (window.toastManager) {
                window.toastManager.show('danger', `Captcha refresh failed. Please try again. ${error}`);
            }

            if (captchaImage && originalSrc) {
                captchaImage.src = originalSrc;
            }
            this.setFieldError(captchaTextInput, 'id_captcha_1', 'Failed to refresh captcha. Please try again.');
        } finally {
            if (captchaImage) {
                captchaImage.style.opacity = '1';
            }
            if (this.captchaRefreshButton) {
                setTimeout(() => {
                    this.captchaRefreshButton.classList.remove('rotating');
                    this.captchaRefreshButton.disabled = false;
                }, 1000);
            }
        }
    }

    /**
     * Auto-refresh captcha when form has validation errors
     * This method can be called with different strategies
     * @param {string} strategy - 'always', 'captcha-error-only', or 'any-error'
     * @param {Object} errors - Server response errors
     */
    autoRefreshOnErrors(strategy = 'always', errors = {}) {
        switch (strategy) {
            case 'always':
                // Always refresh captcha on any form submission error
                this.refreshCaptcha();
                break;

            case 'captcha-error-only':
                // Only refresh if captcha-specific error
                if (this.shouldRefreshCaptcha(errors) && this.hasCaptchaSpecificError(errors)) {
                    this.refreshCaptcha();
                }
                break;
                
            case 'any-error':
            default:
                // Refresh on any validation error (recommended)
                if (this.shouldRefreshCaptcha(errors)) {
                    this.refreshCaptcha();
                }
                break;
        }
    }

    /**
     * Check if there's a captcha-specific error
     * @param {Object} errors - Server response errors
     * @returns {boolean}
     */
    hasCaptchaSpecificError(errors) {
        return !!(errors && (
            errors.captcha ||
            errors.captcha_error ||
            errors.captcha_1 ||
            errors.id_captcha_1 ||
            (typeof errors === 'string' && errors.toLowerCase().includes('captcha'))
        ));
    }

    /**
     * Clear captcha input and refresh image
     * Useful when you want to force user to re-enter captcha
     */
    resetCaptcha() {
        const captchaTextInput = this.formManager.form.querySelector('input[name="captcha_1"], input[name*="captcha"]');
        if (captchaTextInput) {
            captchaTextInput.value = '';
            this.clearFieldValidation(captchaTextInput, captchaTextInput.id || 'id_captcha_1');
        }
        this.refreshCaptcha();
    }

    /**
     * Register this CaptchaValidator with the FormManager
     * This ensures the FormManager can call captcha-specific methods
     * @param {string} fieldId - The field ID this validator handles
     */
    registerWithFormManager(fieldId) {
        if (this.formManager && this.formManager.registerValidator) {
            // Register both the validation function and the instance
            this.formManager.registerValidator(
                fieldId, 
                this.validate.bind(this), 
                this // Pass the instance for special method access
            );
        }
    }
}
