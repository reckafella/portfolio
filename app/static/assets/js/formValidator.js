// form-validator.js
import { toastManager } from './toast.js';

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.submitButton = window.updateSubmitButton || this.form.querySelector('#submitButton');
            this.originalButtonText = this.submitButton?.innerHTML || 'Submit';
            this.setupEventListeners();
            this.setupCaptcha();
        }
    }

    setupCaptcha() {
        const captchaImage = this.form.querySelector('.captcha');
        const captchaInput = this.form.querySelector('[name="captcha_1"]');
        if (!captchaImage || !captchaInput) return;

        // Remove any existing refresh button
        if (this.captchaRefreshButton) {
            this.captchaRefreshButton.remove();
        }

        captchaImage.classList.add('img-fluid', 'captcha');

        // Create a container for the input field if it doesn't exist
        if (!captchaInput.parentElement.classList.contains('captcha-input-container')) {
            const container = document.createElement('div');
            container.className = 'captcha-input-container position-relative';
            captchaInput.parentElement.insertBefore(container, captchaInput);
            container.appendChild(captchaInput);
        }

        // Add padding to the input to make room for the button
        captchaInput.classList.add('captcha-input-with-refresh');

        // Create the refresh button
        const refreshButton = document.createElement('button');
        refreshButton.type = 'button';
        refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
        refreshButton.title = 'Refresh Captcha';
        refreshButton.className = 'captcha-refresh-btn position-absolute';

        // Add event listener for refreshing captcha
        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.refreshCaptcha();
        });

        // Add button to the input container
        captchaInput.parentElement.appendChild(refreshButton);

        this.captchaRefreshButton = refreshButton;
    }

    setButtonState(state) {
        if (!this.submitButton) return;

        // Remove any existing states
        this.submitButton.classList.remove('btn-primary', 'btn-success', 'btn-danger');

        const states = {
            loading: {
                html: `
                    <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                    <span class="ms-2">${this.submitButton.getAttribute('data-loading-text') || 'Submitting...'}</span>
                `,
                disabled: true,
                className: 'btn-primary'
            },
            success: {
                html: '<i class="bi bi-check-circle me-2"></i>Success',
                disabled: true,
                className: 'btn-success'
            },
            error: {
                html: '<i class="bi bi-x-circle me-2"></i>Failed',
                disabled: false,
                className: 'btn-danger'
            },
            default: {
                html: this.originalButtonText,
                disabled: false,
                // className: 'btn-primary'
            }
        };

        const newState = states[state] || states.default;

        // Update button state
        this.submitButton.innerHTML = newState.html;
        this.submitButton.disabled = newState.disabled;
        this.submitButton.classList.add(newState.className);

        // Add Bootstrap 5 spinner button attributes
        if (state === 'loading') {
            this.submitButton.setAttribute('data-bs-busy', 'true');
        } else {
            this.submitButton.removeAttribute('data-bs-busy');
        }

        // Reset button state after delay if success or error
        if (state === 'success' || state === 'error') {
            setTimeout(() => this.setButtonState('default'), 3000);
        }
    }

    async refreshCaptcha() {
        // Apply rotation animation to refresh button
        if (this.captchaRefreshButton) {
            this.captchaRefreshButton.classList.add('rotating');
            this.captchaRefreshButton.disabled = true;
        }
        
        // Find captcha elements
        const captchaImage = this.form.querySelector('.captcha');
        const captchaHiddenInput = this.form.querySelector('[name="captcha_0"]');
        const captchaTextInput = this.form.querySelector('[name="captcha_1"]');
        
        // Add loading state to captcha image
        if (captchaImage) {
            captchaImage.style.opacity = '0.5';
            // Store original src to restore in case of failure
            const originalSrc = captchaImage.src;
        }
        
        // Clear text input
        if (captchaTextInput) {
            captchaTextInput.value = '';
            captchaTextInput.focus();
        }
        
        try {
            const response = await fetch('/captcha/refresh/');
            if (!response.ok) throw new Error('Failed to refresh captcha');
    
            const data = await response.json();
            if (!data.key || !data.image_url) throw new Error('Invalid captcha data');
    
            // Update captcha
            if (captchaImage) {
                captchaImage.src = data.image_url;
            }
            
            if (captchaHiddenInput) {
                captchaHiddenInput.value = data.key;
            }
            
            // Subtle success feedback (flash green border)
            if (captchaImage) {
                captchaImage.classList.add('captcha-refreshed');
                setTimeout(() => {
                    captchaImage.classList.remove('captcha-refreshed');
                }, 1000);
            }
            
        } catch (error) {
            toastManager.show('danger', error.message);
            // Restore original image if available
            if (captchaImage && originalSrc) {
                captchaImage.src = originalSrc;
            }
        } finally {
            // Remove loading state
            if (captchaImage) {
                captchaImage.style.opacity = '1';
            }
            
            // Remove rotation animation
            if (this.captchaRefreshButton) {
                setTimeout(() => {
                    this.captchaRefreshButton.classList.remove('rotating');
                    this.captchaRefreshButton.disabled = false;
                }, 1000);
            }
        }
    }

    clearFieldErrors() {
        this.form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) feedback.remove();
        });
    }

    displayFieldErrors(errors) {
        if (!errors) return;

        // Check if errors is an empty list or object
        if (Array.isArray(errors) && errors.length === 0) return;
        if (typeof errors === 'object' && Object.keys(errors).length === 0) return;

        if (typeof errors === 'string') {
            toastManager.show('danger', errors);
            return;
        }

        Object.entries(errors).forEach(([field, messages]) => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (!input) return;

            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = Array.isArray(messages) ? messages.join(', ') : messages;
            input.parentNode.appendChild(feedback);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.clearFieldErrors();

        // Set button to loading state before the request
        this.setButtonState('loading');

        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: new FormData(this.form),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                this.setButtonState('success');
                toastManager.show('success', data.message, data.messages);
                if (data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                this.setButtonState('error');

                // Only refresh captcha if there's a specific captcha error
                // Check if 'captcha' is in the error fields or if there's a captcha-related message
                const hasCaptchaError =
                    (data.errors &&
                    (data.errors.captcha ||
                     data.errors.captcha_0 ||
                     data.errors.captcha_1 ||
                     (typeof data.errors === 'string' && data.errors.toLowerCase().includes('captcha'))));

                if (hasCaptchaError && this.captchaRefreshButton) {
                    this.captchaRefreshButton.click();
                }

                this.displayFieldErrors(data.errors);
                toastManager.show(
                    'danger',
                    'Please correct the following errors:',
                    data.errors
                );
            }
        } catch (error) {
            this.setButtonState('error');
            toastManager.show('danger', 'An error occurred', error.message);
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.clearFieldErrors());
            toastManager.setupCloseButton();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const forms = ["auth-form", "contact-form", "project-form", "delete-project-form", "change-password-form", "profile-form", "settings-form"];

    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            new FormValidator(formId);
        }
    });
});

export default FormValidator;
