import { FieldValidator } from "./FieldValidator.js";

/**
 * CaptchaValidator class for validating captcha fields
 * Extends FieldValidator to provide captcha-specific validation logic
 * @class CaptchaValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the captcha input field
 */
export class CaptchaValidator extends FieldValidator { 
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const captchaValue = field.value.trim();
        const captchaRegex = /^[a-zA-Z]{6}$/;

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!captchaValue) {
            //this.setFieldError(field, fieldId, 'Captcha cannot be empty.');
        } else if (!captchaRegex.test(captchaValue)) {
            this.setFieldError(field, fieldId, 'Captcha must be 6 letters.');
        } else {
            this.setFieldSuccess(field, fieldId, '');
        }
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

        const originalSrc = captchaImage?.src;
        if (captchaImage) {
            captchaImage.style.opacity = '0.5';
        }
        if (captchaTextInput) {
            captchaTextInput.value = '';
            captchaTextInput.focus();
        }

        try {
            this.clearFieldValidation(captchaTextInput, 'id_captcha_1');

            // Fetch new captcha from the server
            const response = await fetch('/captcha/refresh/');

            if (!response.ok) {
                this.setFieldError(captchaTextInput, 'id_captcha_1', 'Failed to refresh captcha. Please try again.');
                if (window.toastManager) {
                    window.toastManager.show('danger', 'Error', ['Captcha refresh failed. Please try again.']);
                }
                throw new Error('Failed to refresh captcha');
            }

            const data = await response.json();
            if (!data.key || !data.image_url) {
                this.setFieldError(captchaTextInput, 'id_captcha_1', 'Invalid captcha response from server.');
                if (window.toastManager) {
                    window.toastManager.show('danger', 'Error', ['Invalid captcha response from server.']);
                }
                throw new Error('Invalid captcha data received');
            }

            if (captchaImage) {
                captchaImage.src = data.image_url;
                captchaImage.style.opacity = '1';
                captchaImage.classList.add('captcha-refreshed');
                setTimeout(() => {
                    captchaImage.classList.remove('captcha-refreshed');
                }, 1000);
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
}
