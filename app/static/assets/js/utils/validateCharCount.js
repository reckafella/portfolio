export default function updateCharacterCount(fieldId, config) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(config.counterId);
    const counterContainer = counter.parentElement.parentElement;

    if (!field || !counter) return;

    const validationErrors = window.validationErrors || {};
    const updateSubmitButton = window.updateSubmitButton || function () { };

    const currentLength = field.value.length;
    const isCaptchaField = fieldId === 'id_captcha_1';
    
    // For captcha, we need exactly 6 characters
    const requiredLength = isCaptchaField ? 6 : null;
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

    // Special handling for captcha field
    if (isCaptchaField) {
        if (currentLength === 0) {
            // Empty captcha field
            if (typeof validationErrors === 'object') delete validationErrors[fieldId];
        } else if (currentLength === requiredLength) {
            // Exactly 6 characters - valid state
            field.classList.add('char-valid');
            if (typeof validationErrors === 'object') delete validationErrors[fieldId];
        } else if (currentLength < requiredLength) {
            // Less than 6 characters - error state (DISABLES SUBMIT)
            field.classList.add('char-error');
            counterContainer.classList.add('error');
            if (typeof validationErrors === 'object') {
                validationErrors[fieldId] = `Captcha must be exactly ${requiredLength} characters (${requiredLength - currentLength} more needed)`;
            }

            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors[fieldId];
            field.parentElement.appendChild(errorMessage);
        } else {
            // More than 6 characters - error state (DISABLES SUBMIT)
            field.classList.add('char-error');
            counterContainer.classList.add('error');
            if (typeof validationErrors === 'object') {
                validationErrors[fieldId] = `Captcha must be exactly ${requiredLength} characters (${currentLength - requiredLength} too many)`;
            }

            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors[fieldId];
            field.parentElement.appendChild(errorMessage);
        }
    } else {
        // Original logic for non-captcha fields
        if (currentLength > config.max) {
            // Over limit - error state (DISABLES SUBMIT)
            field.classList.add('char-error');
            counterContainer.classList.add('error');
            if (typeof validationErrors === 'object') {
                validationErrors[fieldId] = `Character limit exceeded by ${currentLength - config.max} characters`;
            }

            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = validationErrors[fieldId];
            field.parentElement.appendChild(errorMessage);

        } else if (percentage >= 90) {
            // Near limit - warning state (DOES NOT DISABLE SUBMIT)
            field.classList.add('char-warning');
            counterContainer.classList.add('warning');
            if (typeof validationErrors === 'object') {
                delete validationErrors[fieldId];
            }

            // Add warning message (non-blocking)
            const warningMessage = document.createElement('div');
            warningMessage.className = 'validation-message warning';
            warningMessage.textContent = `Only ${remaining} characters remaining`;
            field.parentElement.appendChild(warningMessage);

        } else if (currentLength > 0) {
            // Only set valid state if there are no other validation errors
            if (typeof validationErrors === 'object' && !validationErrors[fieldId]) {
                field.classList.add('char-valid');
            } else {
                field.classList.remove('char-valid');
            }
        } else {
            // Empty field
            field.classList.remove('char-warning', 'char-error', 'char-valid');
            counterContainer.classList.remove('warning', 'error');
            if (typeof validationErrors === 'object') delete validationErrors[fieldId];
        }
    }
    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}

/* // Function to update character count and validation
export default function updateCharacterCount(fieldId, config, validationErrors, updateSubmitButton) {
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
        if (typeof validationErrors === 'object') {
            validationErrors[fieldId] = `Character limit exceeded by ${currentLength - config.max} characters`;
        }

        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[fieldId];
        field.parentElement.appendChild(errorMessage);

    } else if (percentage >= 90) {
        // Near limit - warning state (DOES NOT DISABLE SUBMIT)
        field.classList.add('char-warning');
        counterContainer.classList.add('warning');
        if (typeof validationErrors === 'object') {
            delete validationErrors[fieldId];
        }

        // Add warning message (non-blocking)
        const warningMessage = document.createElement('div');
        warningMessage.className = 'validation-message warning';
        warningMessage.textContent = `Only ${remaining} characters remaining`;
        field.parentElement.appendChild(warningMessage);

    } else if (currentLength > 0) {
        // Valid state
        field.classList.add('char-valid');

        if (typeof validationErrors === 'object') delete validationErrors[fieldId];
    } else {
        // Empty field
        field.classList.remove('char-warning', 'char-error', 'char-valid');
        counterContainer.classList.remove('warning', 'error');
        if (typeof validationErrors === 'object') delete validationErrors[fieldId];
    }

    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
 */
