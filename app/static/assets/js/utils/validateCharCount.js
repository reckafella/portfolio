// Function to update character count and validation
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
