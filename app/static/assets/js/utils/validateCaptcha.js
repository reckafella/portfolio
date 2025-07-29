import { fieldValidator } from "./updateFieldStatus.js";

// Function to validate captcha code format {digits and letters, no special characters}
function isValidCaptcha(captcha) {
    const captchaRegex = /^[a-zA-Z]{6}$/;
    return captchaRegex.test(captcha);
}

// Function to update captcha validation
export default function updateCaptchaValidation(captchaFieldId) {
    const captchaField = document.getElementById(captchaFieldId);
    if (!captchaField) return;

    const captcha = captchaField.value.trim() ? captchaField.value : '';
    fieldValidator.clearFieldValidation(captchaField, captchaFieldId);

    if (captcha.length === 0) {
        // Empty field
    } else if (!isValidCaptcha(captcha)) {
        // Invalid captcha format
        fieldValidator.setFieldError(captchaField, captchaFieldId, 'Captcha must be 6 letters (a-z, A-Z) long without special characters.');
    } else {
        // Valid captcha
        fieldValidator.setFieldSuccess(captchaField, captchaFieldId, 'Captcha is valid.');
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
