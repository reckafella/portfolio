document.addEventListener('DOMContentLoaded', function() {
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
});


/* contact.js
document.addEventListener('DOMContentLoaded', function () {
    // Field configurations with max lengths
    const fieldConfigs = {
        'id_name': { max: 100, counterId: 'name-count' },
        'id_subject': { max: 200, counterId: 'subject-count' },
        'id_message': { max: 1000, counterId: 'message-count' },
        'id_captcha_1': { max: 6, counterId: 'captcha-1-count' },
        'id_email': { max: 254, counterId: 'email-count' }
    };

    const submitButton = document.getElementById('submitButton');
    let validationErrors = {};

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
            // Over limit - error state
            field.classList.add('char-error');
            counterContainer.classList.add('error');
            validationErrors[fieldId] = `Character limit exceeded by ${currentLength - config.max} characters`;

            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors[fieldId];
            field.parentElement.appendChild(errorMessage);

        } else if (percentage >= 90) {
            // Near limit - warning state (doesn't disable submit)
            field.classList.add('char-warning');
            counterContainer.classList.add('warning');
            delete validationErrors[fieldId]; // Remove any existing error

            // Add warning message
            const warningMessage = document.createElement('div');
            warningMessage.className = 'validation-message warning';
            warningMessage.textContent = `${remaining} characters remaining`;
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

        if (hasErrors || isEmpty) {
            submitButton.disabled = true;
            submitButton.title = hasErrors ? 'Please fix validation errors' : 'Please fill in all required fields';
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

    // Add event listeners to all form fields for submit button validation
    const allFields = document.querySelectorAll('#other-form input, #other-form textarea, #other-form select');
    allFields.forEach(field => {
        field.addEventListener('input', updateSubmitButton);
        field.addEventListener('change', updateSubmitButton);
    });

    // Initial submit button state
    updateSubmitButton();

    // Form submission handler
    document.getElementById('other-form').addEventListener('submit', function (e) {
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

        // Reset button after 5 seconds in case of network issues
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 5000);
    });
});
*/
