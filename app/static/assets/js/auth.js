// imports
import updateEmailValidation from './utils/validateEmail.js';
import updateCharacterCount from './utils/validateCharCount.js';
import updateCaptchaValidation from './utils/validateCaptcha.js';
import updateNameValidation from './utils/validateName.js';
import updateUserNameValidation from './utils/validateUsername.js';
import { updatePasswordValidation, createPasswordToggle, createPasswordStrengthIndicator } from './utils/validatePasswords.js';
// import attachValidationHandlers from './utils/attachValidationHandlers.js';

document.addEventListener('DOMContentLoaded', function () {
    const baseFieldConfigs = {
        'id_username': { max: 50, counterId: 'id_username-count', validate: updateUserNameValidation },
        'password1': { min: 8, max: 64, counterId: 'id_password1-count' },
        'id_captcha_1': { max: 6, counterId: 'id_captcha-count', validate: updateCaptchaValidation }
    };

    const extendedFields = {
        'id_first_name': { max: 50, counterId: 'id_first_name-count', validate: updateNameValidation },
        'id_last_name': { max: 50, counterId: 'id_last_name-count', validate: updateNameValidation },
        'id_email': { max: 70, counterId: 'id_email-count', validate: updateEmailValidation },
        'password2': { min: 8, max: 64, counterId: 'id_password2-count' }
    };

    const fieldConfigs = { ...baseFieldConfigs, ...extendedFields };

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

    function detectFormType() {
        if (document.getElementById('password2')) return 'signup';
        if (document.getElementById('password1')) return 'login';
        return 'unknown';
    }

    function isFormValid() {
        const formType = detectFormType();

        if (formType === 'login') {
            const requiredFields = ['id_username', 'password1', 'id_captcha_1'];
            return requiredFields.every(fieldId => {
                const field = document.getElementById(fieldId);
                return field && field.value.trim().length > 0;
            });
        } else if (formType === 'signup') {
            const requiredFields = ['id_first_name', 'id_email', 'id_last_name', 'id_username', 'id_captcha_1', 'password1', 'password2'];
            return requiredFields.every(fieldId => {
                const field = document.getElementById(fieldId);
                return field && field.value.trim().length > 0;
            });
        }
        return false;
    }


    function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const updateCharCount = () => updateCharacterCount(fieldId, config, validationErrors, updateSubmitButton);
        updateCharCount();

        field.addEventListener('input', updateCharCount);
        field.addEventListener('paste', () => setTimeout(updateCharCount, 10));
        field.addEventListener('keyup', updateCharCount);

        if (typeof config.validate === 'function') {
            const validator = () => config.validate(fieldId, validationErrors, updateSubmitButton);
            validator();

            field.addEventListener('input', validator);
            field.addEventListener('blur', validator);
            field.addEventListener('paste', () => setTimeout(validator, 10));
        }
    }

    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        attachValidationHandlers(fieldId, config);
    });

    ['password1', 'password2'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        createPasswordToggle(fieldId);

        if (fieldId === 'password1') {
            createPasswordStrengthIndicator(fieldId);
        }

        const update = () => setTimeout(updatePasswordValidation, 0);

        field.addEventListener('input', update);
        field.addEventListener('blur', updatePasswordValidation);
        field.addEventListener('change', updatePasswordValidation);
        field.addEventListener('paste', () => setTimeout(updatePasswordValidation, 10));
    });

    const allFields = document.querySelectorAll('#auth-form input, #auth-form textarea, #auth-form select');
    allFields.forEach(field => {
        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });

    updateSubmitButton();
    setTimeout(updatePasswordValidation, 100);

    document.getElementById('auth-form').addEventListener('submit', function (e) {
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

            alert(alertMessage);
            return false;
        }

        const originalText = submitButton.textContent;
        const loadingText = submitButton.getAttribute('data-loading-text');
        submitButton.disabled = true;
        submitButton.textContent = loadingText;

        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 10000);
    });
});
