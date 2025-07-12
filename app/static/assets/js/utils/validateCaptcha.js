// Function to validate captcha code format {digits and letters, no special characters}
function isValidCaptcha(captcha) {
    const captchaRegex = /^[a-zA-Z0-9]+$/;
    return captchaRegex.test(captcha);
}

// Function to update captcha validation
export default function updateCaptchaValidation(nameFieldId, validationErrors, updateSubmitButton) {
    const captchaField = document.getElementById(nameFieldId);
    if (!captchaField) return;

    const captcha = captchaField.value.trim() ? captchaField.value : '';

    // Remove previous classes and messages
    captchaField.classList.remove('char-warning', 'char-error', 'char-valid');
    const existingMessage = captchaField.parentElement.querySelector('.validation-message');

    if (existingMessage) existingMessage.remove();

    if (captcha.length === 0) {
        // Empty field
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
        return;
    } else if (!isValidCaptcha(captcha)) {
        // Invalid captcha format
        captchaField.classList.add('char-error');
        if (typeof validationErrors === 'object') {
            validationErrors[nameFieldId] = 'Please enter a valid captcha code (letters and numbers only)';
        }
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[nameFieldId] || 'Invalid captcha format';
        captchaField.parentElement.appendChild(errorMessage);
    } else {
        // Valid captcha
        captchaField.classList.add('char-valid');
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
    }

    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
