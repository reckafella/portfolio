// form-validator.js
import { toastManager } from './toast.js';

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.submitButton = this.form.querySelector('#submitButton');
            this.originalButtonText = this.submitButton?.innerHTML || 'Submit';
            this.setupEventListeners();
            this.setupCaptcha();
        }
    }

    setupCaptcha() {
        const captchaImage = this.form.querySelector('.captcha');
        if (!captchaImage) return;

        const refreshButton = document.createElement('button');
        refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
        refreshButton.title = 'Refresh Captcha';
        refreshButton.className = 'btn refresh-btn ms-2';
        captchaImage.parentNode.appendChild(refreshButton);

        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.refreshCaptcha();
        });

        this.captchaRefreshButton = refreshButton;
    }

    setButtonState(state) {
        if (!this.submitButton) return;

        // Remove any existing states
        this.submitButton.classList.remove('btn-primary', 'btn-success', 'btn-danger');
        
        const states = {
            loading: {
                html: `
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span class="ms-2">${this.submitButton.getAttribute('data-loading-text') || 'Loading...'}</span>
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
                className: 'btn-primary'
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
        try {
            const response = await fetch('/captcha/refresh/');
            if (!response.ok) throw new Error('Failed to refresh captcha');
            
            const data = await response.json();
            if (!data.key || !data.image_url) throw new Error('Invalid captcha data');

            const captchaImage = this.form.querySelector('.captcha');
            const captchaInput = this.form.querySelector('[name="captcha_0"]');
            
            captchaImage.src = data.image_url;
            captchaInput.value = data.key;
        } catch (error) {
            toastManager.show('danger', error.message);
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
                if (this.captchaRefreshButton) {
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
    new FormValidator('other-form');
});

export default FormValidator;
