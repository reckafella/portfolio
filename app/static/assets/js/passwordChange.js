import { updatePasswordChangeValidation, createPasswordStrengthIndicator, createPasswordToggle } from "./utils/validatePasswords.js";
import updateCharacterCount from "./utils/validateCharCount.js";
import { toastManager } from "./toast.js";

document.addEventListener('DOMContentLoaded', function () {
    const fieldConfigs = {
        'id_old_password': { min: 8, max: 64, counterId: 'id_old_password-count', validate: updatePasswordChangeValidation },
        'id_new_password1': { min: 8, max: 64, counterId: 'id_new_password1-count', validate: updatePasswordChangeValidation },
        'id_new_password2': { min: 8, max: 64, counterId: 'id_new_password2-count', validate: updatePasswordChangeValidation },
    };

    const submitButton = document.getElementById('submitButton');
    const validationErrors = {};

    // Make these globally accessible for password validation
    window.validationErrors = validationErrors;
    window.updateSubmitButton = updateSubmitButton;

    function updateSubmitButton() {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        submitButton.disabled = hasErrors || isEmpty;
        submitButton.title = hasErrors
            ? 'Please fix all errors before submitting'
            : isEmpty
                ? 'Please fill in all required fields'
                : '';
    }

    function isFormValid() {
        const requiredFields = ['id_old_password', 'id_new_password1', 'id_new_password2'];
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim().length > 0;
        });
    }
    
    function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) {
            toastManager.show('error', `Field with ID ${fieldId} not found.`);
            return;
        }

        const updateCharCount = () => updateCharacterCount(fieldId, config);
        updateCharCount();

        field.addEventListener('input', updateCharCount);
        field.addEventListener('keyup', updateCharCount);
        field.addEventListener('paste', () => setTimeout(updateCharCount, 10));

        if (config.validate && typeof config.validate === 'function') {
            const validator = () => config.validate(fieldId);
            validator();

            field.addEventListener('input', validator);
            field.addEventListener('paste', () => setTimeout(validator, 10));
            field.addEventListener('blur', validator);
        }
    }


    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        attachValidationHandlers(fieldId, config);
    });

    ['id_old_password', 'id_new_password1', 'id_new_password2'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        createPasswordToggle(fieldId);

        if (fieldId === 'id_new_password1') {
            createPasswordStrengthIndicator(fieldId);
        }

        const events = ['input', 'blur', 'change'];
        events.forEach(event => field.addEventListener(event, updatePasswordChangeValidation));
        field.addEventListener('paste', () => setTimeout(updatePasswordChangeValidation, 10));
    });

    //const allFields = ['id_old_password', 'id_new_password1', 'id_new_password2'];
    const allFields = Object.keys(fieldConfigs);

    allFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });

    updateSubmitButton();
    setTimeout(updatePasswordChangeValidation, 100);

    document.getElementById('password-change-form').addEventListener('submit', function (e) {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        if (hasErrors || isEmpty) {
            e.preventDefault();

            let alertMessage = 'Please fix all errors before submitting.';
            if (isEmpty) alertMessage += '\nPlease fill in all required fields.';
            if (hasErrors) {
                Object.values(validationErrors).forEach(error => {
                    alertMessage += '• ' + error + '\n';
                });
            }
            toastManager.show('error', alertMessage);
            return false;
        }
        const originalText = submitButton.innerHTML;
        const loadingText = submitButton.getAttribute('data-loading-text') || 'Saving...';
        submitButton.textContent = loadingText;
        submitButton.disabled = true;

        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 3000);
    });
});

/*
import { updatePasswordChangeValidation, createPasswordStrengthIndicator, createPasswordToggle } from "./utils/validatePasswords.js";
import updateCharacterCount from "./utils/validateCharCount.js";
import { toastManager } from "./toast.js";

document.addEventListener('DOMContentLoaded', function () {
    const fieldConfigs = {
        'id_old_password': { min: 8, max: 64, counterId: 'id_old_password-count', validate: updatePasswordChangeValidation },
        'id_new_password1': { min: 8, max: 64, counterId: 'id_new_password1-count', validate: updatePasswordChangeValidation },
        'id_new_password2': { min: 8, max: 64, counterId: 'id_new_password2-count', validate: updatePasswordChangeValidation },
    };

    const submitButton = document.getElementById('submitButton');
    const validationErrors = {};

    // Make these globally accessible for password validation
    window.validationErrors = validationErrors;
    window.updateSubmitButton = updateSubmitButton;

    function updateSubmitButton() {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        submitButton.disabled = hasErrors || isEmpty;
        submitButton.title = hasErrors
            ? 'Please fix all errors before submitting'
            : isEmpty
                ? 'Please fill in all required fields'
                : '';
    }

    function isFormValid() {
        const requiredFields = ['id_old_password', 'id_new_password1', 'id_new_password2'];
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim().length > 0;
        });
    }
    
    function attachValidationHandlers(fieldId, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const updateCharCount = () => {
            updateCharacterCount(field, config.counterId);
        };
        field.addEventListener('input', updateCharCount);
        field.addEventListener('paste', () => setTimeout(updateCharCount, 10));
        field.addEventListener('keyup', updateCharCount);

        if (typeof config.validate === 'function') {
            const validator = () => config.validate(fieldId);
            validator();
            field.addEventListener('input', validator);
            field.addEventListener('paste', () => setTimeout(validator, 10));
            field.addEventListener('keyup', validator);
            field.addEventListener('blur', validator);
        }
    }


    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        attachValidationHandlers(fieldId, config);
    });

    ['id_old_password', 'id_new_password1', 'id_new_password2'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        createPasswordToggle(fieldId);

        if (fieldId === 'id_new_password1') {
            createPasswordStrengthIndicator(fieldId);
        }
        const events = ['input', 'keyup', 'blur', 'focus', 'change'];
        events.forEach(event => {
            field.addEventListener(event, () => updatePasswordChangeValidation);
        });
        field.addEventListener('paste', () => setTimeout(() => updatePasswordChangeValidation, 10));
    });

    const allFields = ['id_old_password', 'id_new_password1', 'id_new_password2'];
    allFields.forEach(field => {
        field.addEventListener('input', () => {
            updateSubmitButton();
        });
        field.addEventListener('change', () => {
            updateSubmitButton();
        });
    });

    updateSubmitButton();
    setTimeout(() => updatePasswordChangeValidation, 100);

    document.getElementById('password-change-form').addEventListener('submit', function (event) {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();
        if (hasErrors || isEmpty) {
            event.preventDefault();

            let alertMessage = 'Please fix all errors before submitting.';
            if (isEmpty) alertMessage += '\nPlease fill in all required fields.';
            if (hasErrors) {
                Object.values(validationErrors).forEach(error => {
                    alertMessage += '• ' + error + '\n';
                });
            }
            toastManager.show('error', alertMessage);
            return false;
        } else {
            const originalText = submitButton.innerHTML;
            const loadingText = submitButton.getAttribute('data-loading-text') || 'Saving...';
            submitButton.textContent = loadingText;
            submitButton.disabled = true;

            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 3000);
            return true;
        }
    });
});

*/
