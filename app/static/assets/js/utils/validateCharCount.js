import { fieldValidator } from './updateFieldStatus.js';

export default function updateCharacterCount(fieldId, config) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(config.counterId);
    const counterContainer = counter?.parentElement?.parentElement;

    if (!field || !counter) return;

    const currentLength = field.value.length;
    const isCaptchaField = fieldId === 'id_captcha_1';
    
    // For captcha, we need exactly 6 characters
    const requiredLength = isCaptchaField ? 6 : null;
    const remaining = config.max - currentLength;
    const percentage = (currentLength / config.max) * 100;

    // Update counter text
    counter.textContent = currentLength;

    // Remove previous counter container classes
    counterContainer?.classList.remove('warning', 'error');

    // Clear field validation
    fieldValidator.clearFieldValidation(field, fieldId);

    // Special handling for captcha field
    if (isCaptchaField) {
        if (currentLength === 0) {
            // Empty captcha field - no validation needed yet
        } else if (currentLength === requiredLength) {
            // Exactly 6 characters - valid state
            fieldValidator.setFieldSuccess(field, fieldId, 'Captcha format is correct');
        } else if (currentLength < requiredLength) {
            // Less than 6 characters - error state
            counterContainer?.classList.add('error');
            fieldValidator.setFieldError(field, fieldId, `Captcha must be exactly ${requiredLength} characters (${requiredLength - currentLength} more needed)`);
        } else {
            // More than 6 characters - error state
            counterContainer?.classList.add('error');
            fieldValidator.setFieldError(field, fieldId, `Captcha must be exactly ${requiredLength} characters (${currentLength - requiredLength} too many)`);
        }
    } else {
        // Original logic for non-captcha fields
        if (currentLength > config.max) {
            // Over limit - error state
            counterContainer?.classList.add('error');
            fieldValidator.setFieldError(field, fieldId, `Character limit exceeded by ${currentLength - config.max} characters`);
        } else if (percentage >= 90) {
            // Near limit - warning state (non-blocking)
            counterContainer?.classList.add('warning');
            fieldValidator.setFieldWarning(field, fieldId, `Only ${remaining} characters remaining`);
        } else if (currentLength > 0) {
            // Valid state if there are no other validation errors
            if (!fieldValidator.validationErrors[fieldId]) {
                field.classList.add('char-valid');
            }
        }
        // Empty field case is handled by clearFieldValidation above
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
