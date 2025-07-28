// imports
import updateNameValidation from './utils/validateName.js';
import updateSubjectValidation from './utils/validateSubject.js';
import updateCaptchaValidation from './utils/validateCaptcha.js';
import updateEmailValidation from './utils/validateEmail.js';
import updateCharacterCount from './utils/validateCharCount.js';
import { toastManager } from './toast.js';
// import attachValidationHandlers from './utils/attachValidationHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
    const fieldConfigs = {
        'id_name': { max: 50, counterId: 'id_name-count', validate: updateNameValidation },
        'id_subject': { max: 150, counterId: 'id_subject-count', validate: updateSubjectValidation },
        'id_message': { max: 1000, counterId: 'id_message-count' },
        'id_captcha_1': { max: 6, counterId: 'id_captcha-count', validate: updateCaptchaValidation },
        'id_email': { max: 70, counterId: 'id_email-count', validate: updateEmailValidation }
    };

    const submitButton = document.getElementById('submitButton');
    const validationErrors = {};

    function updateSubmitButton() {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        submitButton.disabled = hasErrors || isEmpty;
        submitButton.title = hasErrors
            ? 'Please fix validation errors before submitting'
            : isEmpty
                ? 'Please fill in all required fields'
                : '';
    }

    function isFormValid() {
        return Object.keys(fieldConfigs).every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim().length > 0;
        });
    }

    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        attachValidationHandlers(fieldId, config);
    });

    function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Character count
        const updateCharCount = () => updateCharacterCount(fieldId, config);
        updateCharCount();
        field.addEventListener('input', updateCharCount);
        field.addEventListener('paste', () => setTimeout(updateCharCount, 10));
        field.addEventListener('keyup', updateCharCount);
        
        // Field-specific validation
        if (typeof config.validate === 'function') {
            // Create the validator function
            const validator = () => config.validate(fieldId);
        
            // For input events (typing), use a timeout and only show errors, not success
            field.addEventListener('input', function() {
                field.classList.remove('char-valid');

                // Check for errors immediately
                const tempErrors = {...validationErrors};
                config.validate(fieldId, tempErrors, () => {});
            
                // If there are errors, show them immediately
                if (tempErrors[fieldId]) {
                    field.classList.add('char-error');
                    validationErrors[fieldId] = tempErrors[fieldId];
                    updateSubmitButton();
                } else {
                    field.classList.remove('char-error');
                    delete validationErrors[fieldId];
                    updateSubmitButton();
                }
            });
        
            // On blur, do full validation with valid state
            field.addEventListener('blur', validator);
        
            // For paste events, use timeout for full validation
            field.addEventListener('paste', () => setTimeout(validator, 10));
        
            // Run initial validation
            validator();
        }
    }

    // Update submit button on any change
    const allFields = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
    allFields.forEach(field => {
        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });

    updateSubmitButton(); // initial button state

    // Handle form submission
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        if (hasErrors || isEmpty) {
            e.preventDefault();

            let alertMessage = 'Please fix the following issues:\n\n';
            if (isEmpty) alertMessage += '• All fields are required\n';
            if (hasErrors) {
                Object.values(validationErrors).forEach(error => {
                    alertMessage += '• ' + error + '\n';
                });
            }

            toastManager.show('error', alertMessage);
            return false;
        }

        // Loading state
        const originalText = submitButton.textContent;
        const loadingText = submitButton.getAttribute('data-loading-text') || 'Sending...';
        submitButton.disabled = true;
        submitButton.textContent = loadingText;

        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 3000);
    });
});
