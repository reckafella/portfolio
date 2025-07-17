// imports
import updateNameValidation from './utils/validateName.js';
import updateSubjectValidation from './utils/validateSubject.js';
import updateCaptchaValidation from './utils/validateCaptcha.js';
import updateEmailValidation from './utils/validateEmail.js';
import updateCharacterCount from './utils/validateCharCount.js';
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

            alert(alertMessage);
            return false;
        }

        // Loading state
        const originalText = submitButton.textContent;
        const loadingText = submitButton.getAttribute('data-loading-text') || 'Submitting...';
        submitButton.disabled = true;
        submitButton.textContent = loadingText;

        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 10000);
    });
});


/* // import { isValidEmailSecure } from './utils/validateEmail.js';
import updateNameValidation from './utils/validateName.js';
import updateSubjectValidation from './utils/validateSubject.js';
import updateCaptchaValidation from './utils/validateCaptcha.js';
import updateEmailValidation from './utils/validateEmail.js';
import updateCharacterCount from './utils/validateCharCount.js';

document.addEventListener('DOMContentLoaded', function() {
    const fieldConfigs = {
        'id_name': { max: 50, counterId: 'id_name-count' },
        'id_subject': { max: 150, counterId: 'id_subject-count' },
        'id_message': { max: 1000, counterId: 'id_message-count' },
        'id_captcha_1': { max: 6, counterId: 'id_captcha-count' },
        'id_email': { max: 70, counterId: 'id_email-count' }
    };

    const submitButton = document.getElementById('submitButton');
    let validationErrors = {};

    // validate and update name
    updateNameValidation('id_name', updateSubmitButton);

    updateSubjectValidation('id_subject', updateSubmitButton);
    // Function to update captcha validation
    updateCaptchaValidation('id_captcha_1', updateSubmitButton);

    // Function to update character count
    updateCharacterCount(fieldId, config, updateSubmitButton);

    // Function to update submit button state
    function updateSubmitButton() {
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        if (hasErrors) {
            submitButton.disabled = true;
            submitButton.title = 'Please fix validation errors before submitting';
        } else if (isEmpty) {
            submitButton.disabled = true;
            submitButton.title = 'Please fill in all required fields';
        } else {
            submitButton.disabled = false;
            submitButton.title = '';
        }
    }

    // Function to check if form is valid (all required fields filled)
    function isFormValid() {
        // const requiredFields = ['id_name', 'id_email', 'id_subject', 'id_message', 'id_captcha_1'];
        const requiredFields = Object.keys(fieldConfigs);
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim().length > 0;
        });
    }

    // Initialize character counters and event listeners
    Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Initial count
            const updateCharacterCountValidator = () => updateCharacterCount(fieldId, config, validationErrors, updateSubmitButton);
            updateCharacterCountValidator();

            // Add event listeners
            field.addEventListener('input', () => updateCharacterCountValidator);
            field.addEventListener('paste', () => {
                // Delay to allow paste to complete
                setTimeout(() => updateCharacterCountValidator, 10);
            });
            field.addEventListener('keyup', () => updateCharacterCountValidator);
        }
    });

    // Initialize email validation
    const emailField = document.getElementById('id_email');
    if (emailField) {
        // Initial validation
        const updateEmailValidator = () => updateEmailValidation(emailField.id, validationErrors, updateSubmitButton);
        updateEmailValidator();
        emailField.addEventListener('input', updateEmailValidator);
        emailField.addEventListener('blur', updateEmailValidator);
        emailField.addEventListener('paste', () => {
            setTimeout(updateEmailValidator, 10);
        });
    }

    // Initialize name validation
    const nameField = document.getElementById('id_name');
    if (nameField) {
        // Initial validation
        const updateNameValidator = () => updateNameValidation(nameField.id, validationErrors, updateSubmitButton);
        updateNameValidator();
        nameField.addEventListener('input', updateNameValidator);
        nameField.addEventListener('blur', updateNameValidator);
        nameField.addEventListener('paste', () => {
            setTimeout(updateNameValidator, 10);
        });
    }

    // Initialize subject validation
    const subjectField = document.getElementById('id_subject');
    if (subjectField) {
        // Initial validation
        const updateSubjectValidator = () => updateSubjectValidation(subjectField.id, validationErrors, updateSubmitButton);
        updateSubjectValidator();
        subjectField.addEventListener('input', updateSubjectValidator);
        subjectField.addEventListener('blur', updateSubjectValidator);
        subjectField.addEventListener('paste', () => {
            setTimeout(updateSubjectValidator, 10);
        });
    }
    // Initialize captcha validation
    const captchaField = document.getElementById('id_captcha_1');
    if (captchaField) {
        const updateCaptchaValidator = () => updateCaptchaValidation(captchaField.id, validationErrors, updateSubmitButton);
        updateCaptchaValidator();

        captchaField.addEventListener('input', updateCaptchaValidator);
        captchaField.addEventListener('blur', updateCaptchaValidator);
        captchaField.addEventListener('paste', () => {
            setTimeout(updateCaptchaValidator, 10);
        });
    }

    // Add event listeners to all form fields for submit button validation
    const allFields = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
    allFields.forEach(field => {
        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });

    // Initial submit button state
    updateSubmitButton();

    // Form submission handler
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        // Final validation before submission
        const hasErrors = Object.keys(validationErrors).length > 0;
        const isEmpty = !isFormValid();

        if (hasErrors || isEmpty) {
            e.preventDefault();

            // Show alert with specific issues
            let alertMessage = 'Please fix the following issues:\n\n';
            if (isEmpty) {
                alertMessage += '• All fields are required\n';
            }
            if (hasErrors) {
                Object.values(validationErrors).forEach(error => {
                    alertMessage += '• ' + error + '\n';
                });
            }

            alert(alertMessage);
            return false;
        }

        // Show loading state
        const originalText = submitButton.textContent;
        const loadingText = submitButton.getAttribute('data-loading-text') || 'Submitting...';
        submitButton.disabled = true;
        submitButton.textContent = loadingText;

        // Reset button after 10 seconds in case of network issues
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 10000);
    });
});
 */
