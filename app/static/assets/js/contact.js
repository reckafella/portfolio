// imports
import { updateNameValidation } from './utils/validateName.js';
import { updateSubjectValidation } from './utils/validateSubject.js';
import { updateCaptchaValidation } from './utils/validateCaptcha.js';
import { updateEmailValidation } from './utils/validateEmail.js';
import { updateCharacterCount } from './utils/validateCharCount.js';
import { updateMessageValidation } from './utils/validateMessage.js';
import { toastManager } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
    const fieldConfigs = {
        'id_name': { min:5, max: 50, counterId: 'id_name-count', validate: updateNameValidation },
        'id_subject': { min: 15, max: 150, counterId: 'id_subject-count', validate: updateSubjectValidation },
        'id_message': { min: 25, max: 1000, counterId: 'id_message-count', validate: updateMessageValidation },
        'id_captcha_1': { max: 6, counterId: 'id_captcha-count', validate: updateCaptchaValidation },
        'id_email': { max: 70, counterId: 'id_email-count', validate: updateEmailValidation }
    };

    const submitButton = document.getElementById('submitButton');
    const validationErrors = {};

    window.validationErrors = validationErrors;
    window.updateSubmitButton = updateSubmitButton;

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

    /* function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const updateCharCount = () => updateCharacterCount(fieldId, config);
        updateCharCount();

        ['input', 'change', 'paste'].forEach(event => {
            if (event === 'paste') {
                field.addEventListener(event, () => setTimeout(updateCharCount, 10));
            } else {
                field.addEventListener(event, updateCharCount);
            }
        });

        if (config.validate && typeof config.validate === 'function') {
            const validator = () => config.validate(fieldId);
            validator();

            ['input', 'change', 'paste'].forEach(event => {
                field.addEventListener(event, () => setTimeout(validator, 10));
            });
        }
    }
 */
    
    function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const updateCharCount = () => updateCharacterCount(fieldId, config);
        updateCharCount();

        ['input', 'keyup', 'blur', 'focus', 'change'].forEach(event => {
            field.addEventListener(event, updateCharCount);
        });
        field.addEventListener('paste', () => setTimeout(updateCharCount, 10));

        if (config.validate && typeof config.validate === 'function') {
            const validator = () => config.validate(fieldId);
            validator();

            ['input', 'keyup', 'blur', 'focus', 'change', 'paste'].forEach(event => {
                if (event === 'paste' || event === 'input') {
                    field.addEventListener(event, () => setTimeout(validator, 10));
                } else {
                    field.addEventListener(event, validator);
                }
            });
        }
    }
    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        attachValidationHandlers(fieldId, config);
    });

    // Update submit button on any change
    Object.keys(fieldConfigs).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        ['input', 'change'].forEach(event => {
            field.addEventListener(event, updateSubmitButton);
        });
    });

    updateSubmitButton();

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
