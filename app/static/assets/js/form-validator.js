// form-validator.js
import { toastManager } from './toast.js';

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        // if form id found, setup event listeners
        if (this.form) {
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
        refreshButton.className = 'btn btn-sm btn-outline-secondary ms-2';
        captchaImage.parentNode.appendChild(refreshButton);

        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.refreshCaptcha();
        });

        // Store for later use
        this.captchaRefreshButton = refreshButton;
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
              toastManager.show('success', data.message);
              if (data.redirect_url) {
                  window.location.href = data.redirect_url;
              } else {
                  window.location.reload();
              }
          } else {
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
          toastManager.show('danger', 'An error occurred', error.message);
      }
    }

    setupEventListeners() {
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Clear errors on input
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.clearFieldErrors());
        });
    }
}

// Initialize the form validator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator('other-form');
});


export default FormValidator;
