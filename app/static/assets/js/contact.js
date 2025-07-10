import { FormInputValidator } from './form-input.js';

document.addEventListener('DOMContentLoaded', function () {
    new FormInputValidator('other-form', {
        fields: {
            'id_name': { 
                type: 'text', 
                maxLength: 100, 
                required: true,
                counterId: 'name-count'
            },
            'id_email': { 
                type: 'email', 
                required: true 
            },
            'id_subject': { 
                type: 'alphanumeric', 
                maxLength: 200, 
                required: true,
                counterId: 'subject-count'
            },
            'id_message': { 
                maxLength: 1000, 
                required: true,
                counterId: 'message-count'
            },
            'id_captcha_1': { 
                type: 'captcha', 
                maxLength: 6, 
                required: true,
                counterId: 'captcha-1-count'
            }
        }
    });
});

/* document.addEventListener('DOMContentLoaded', function() {
    // Field configurations with max lengths
    const fieldConfigs = {
        'id_name': { max: 100, counterId: 'name-count' },
        'id_subject': { max: 200, counterId: 'subject-count' },
        'id_message': { max: 1000, counterId: 'message-count' },
        'id_captcha_1': { max: 6, counterId: 'captcha-1-count' }
    };

    const submitButton = document.getElementById('submitButton');
    let validationErrors = {};
    
    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to update email validation
    function updateEmailValidation() {
        const emailField = document.getElementById('id_email');
        if (!emailField) return;

        const email = emailField.value.trim();
        
        // Remove previous classes and messages
        emailField.classList.remove('char-warning', 'char-error', 'char-valid');
        const existingMessage = emailField.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (email.length === 0) {
            // Empty field
            delete validationErrors['id_email'];
        } else if (!isValidEmail(email)) {
            // Invalid email format
            emailField.classList.add('char-error');
            validationErrors['id_email'] = 'Please enter a valid email address';
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors['id_email'];
            emailField.parentElement.appendChild(errorMessage);
        } else {
            // Valid email
            emailField.classList.add('char-valid');
            delete validationErrors['id_email'];
        }
        
        // Update submit button state
        updateSubmitButton();
    }

    function isValidName(name) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        return nameRegex.test(name);
    }

    // function to update the name validation
    function updateNameValidation() {
        const nameField = document.getElementById('id_name');
        if (!nameField) return;

        const name = nameField.value.trim();
        // Remove previous classes and messages
        nameField.classList.remove('char-warning', 'char-error', 'char-valid');
        const existingMessage = nameField.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        if (name.length === 0) {
            // Empty field
            delete validationErrors['id_name'];
        } else if (!isValidName(name)) {
            // Invalid name format
            nameField.classList.add('char-error');
            validationErrors['id_name'] = 'Please enter a valid name (letters and spaces only)';
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors['id_name'];
            nameField.parentElement.appendChild(errorMessage);
        } else {
            // Valid name
            nameField.classList.add('char-valid');
            delete validationErrors['id_name'];
        }
        // Update submit button state
        updateSubmitButton();
    }

    function isValidSubject(subject) {
        const subjectRegex = /^[a-zA-Z0-9\s]+$/;
        return subjectRegex.test(subject);
    }

    // Function to update subject validation
    function updateSubjectValidation() {
        const subjectField = document.getElementById('id_subject');
        if (!subjectField) return;
        const subject = subjectField.value.trim();
        // Remove previous classes and messages
        subjectField.classList.remove('char-warning', 'char-error', 'char-valid');
        const existingMessage = subjectField.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        if (subject.length === 0) {
            // Empty field
            delete validationErrors['id_subject'];
        } else if (!isValidSubject(subject)) {
            // Invalid subject format
            subjectField.classList.add('char-error');
            validationErrors['id_subject'] = 'Please enter a valid subject (letters, numbers, and spaces only)';
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors['id_subject'];
            subjectField.parentElement.appendChild(errorMessage);
        } else {
            // Valid subject
            subjectField.classList.add('char-valid');
            delete validationErrors['id_subject'];
        }
        // Update submit button state
        updateSubmitButton();
    }

    // Function to validate captcha code format {digits and letters, no special characters}
    function isValidCaptcha(captcha) {
        const captchaRegex = /^[a-zA-Z0-9]+$/;
        return captchaRegex.test(captcha);
    }

    // Function to update captcha validation
    function updateCaptchaValidation() {
        const captchaField = document.getElementById('id_captcha_1');
        if (!captchaField) return;
        const captcha = captchaField.value.trim();
        // Remove previous classes and messages
        captchaField.classList.remove('char-warning', 'char-error', 'char-valid');
        const existingMessage = captchaField.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        if (captcha.length === 0) {
            // Empty field
            delete validationErrors['id_captcha_1'];
        } else if (!isValidCaptcha(captcha)) {
            // Invalid captcha format
            captchaField.classList.add('char-error');
            validationErrors['id_captcha_1'] = 'Please enter a valid captcha code (letters and numbers only)';
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors['id_captcha_1'];
            captchaField.parentElement.appendChild(errorMessage);
        } else {
            // Valid captcha
            captchaField.classList.add('char-valid');
            delete validationErrors['id_captcha_1'];
        }
        // Update submit button state
        updateSubmitButton();
    }

    // Function to update character count and validation
    function updateCharacterCount(fieldId, config) {
        const field = document.getElementById(fieldId);
        const counter = document.getElementById(config.counterId);
        const counterContainer = counter.parentElement.parentElement;
        
        if (!field || !counter) return;
        
        const currentLength = field.value.length;
        const remaining = config.max - currentLength;
        const percentage = (currentLength / config.max) * 100;
        
        // Update counter text
        counter.textContent = currentLength;
        
        // Remove previous classes
        field.classList.remove('char-warning', 'char-error', 'char-valid');
        counterContainer.classList.remove('warning', 'error');
        
        // Remove previous validation message
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Apply styling based on character count
        if (currentLength > config.max) {
            // Over limit - error state (DISABLES SUBMIT)
            field.classList.add('char-error');
            counterContainer.classList.add('error');
            validationErrors[fieldId] = `Character limit exceeded by ${currentLength - config.max} characters`;
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors[fieldId];
            field.parentElement.appendChild(errorMessage);
            
        } else if (percentage >= 90) {
            // Near limit - warning state (DOES NOT DISABLE SUBMIT)
            field.classList.add('char-warning');
            counterContainer.classList.add('warning');
            delete validationErrors[fieldId]; // Remove any previous error
            
            // Add warning message (non-blocking)
            const warningMessage = document.createElement('div');
            warningMessage.className = 'validation-message warning';
            warningMessage.textContent = `Only ${remaining} characters remaining`;
            field.parentElement.appendChild(warningMessage);
            
        } else if (currentLength > 0) {
            // Valid state
            field.classList.add('char-valid');
            delete validationErrors[fieldId];
        } else {
            // Empty field
            delete validationErrors[fieldId];
        }
        
        // Update submit button state
        updateSubmitButton();
    }
    
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
        const requiredFields = ['id_name', 'id_email', 'id_subject', 'id_message', 'id_captcha_1'];
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
            updateCharacterCount(fieldId, config);
            
            // Add event listeners
            field.addEventListener('input', () => updateCharacterCount(fieldId, config));
            field.addEventListener('paste', () => {
                // Delay to allow paste to complete
                setTimeout(() => updateCharacterCount(fieldId, config), 10);
            });
            field.addEventListener('keyup', () => updateCharacterCount(fieldId, config));
        }
    });
    
    // Initialize email validation
    const emailField = document.getElementById('id_email');
    if (emailField) {
        updateEmailValidation();
        emailField.addEventListener('input', updateEmailValidation);
        emailField.addEventListener('blur', updateEmailValidation);
        emailField.addEventListener('paste', () => {
            setTimeout(updateEmailValidation, 10);
        });
    }

    // Initialize name validation
    const nameField = document.getElementById('id_name');
    if (nameField) {
        updateNameValidation();
        nameField.addEventListener('input', updateNameValidation);
        nameField.addEventListener('blur', updateNameValidation);
        nameField.addEventListener('paste', () => {
            setTimeout(updateNameValidation, 10);
        });
    }
    
    // Initialize subject validation
    const subjectField = document.getElementById('id_subject');
    if (subjectField) {
        updateSubjectValidation();
        subjectField.addEventListener('input', updateSubjectValidation);
        subjectField.addEventListener('blur', updateSubjectValidation);
        subjectField.addEventListener('paste', () => {
            setTimeout(updateSubjectValidation, 10);
        });
    }
    // Initialize captcha validation
    const captchaField = document.getElementById('id_captcha_1');
    if (captchaField) {
        updateCaptchaValidation();
        captchaField.addEventListener('input', updateCaptchaValidation);
        captchaField.addEventListener('blur', updateCaptchaValidation);
        captchaField.addEventListener('paste', () => {
            setTimeout(updateCaptchaValidation, 10);
        });
    }

    // Add event listeners to all form fields for submit button validation
    const allFields = document.querySelectorAll('#other-form input, #other-form textarea, #other-form select');
    allFields.forEach(field => {
        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });
    
    // Initial submit button state
    updateSubmitButton();
    
    // Form submission handler
    document.getElementById('other-form').addEventListener('submit', function(e) {
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
        const loadingText = submitButton.getAttribute('data-loading-text');
        submitButton.disabled = true;
        submitButton.textContent = loadingText;
        
        // Reset button after 10 seconds in case of network issues
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 10000);
    });
}); */
