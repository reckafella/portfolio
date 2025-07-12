function isValidName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
}

// function to update the name validation
export default function updateNameValidation(nameFieldId, validationErrors, updateSubmitButton) {
    const nameField = document.getElementById(nameFieldId);
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
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
    } else if (!isValidName(name)) {
        // Invalid name format
        nameField.classList.add('char-error');
        if (typeof validationErrors === 'object') {
            validationErrors[nameFieldId] = 'Please enter a valid name (letters and spaces only)';
        }
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[nameFieldId] || 'Invalid name format';
        nameField.parentElement.appendChild(errorMessage);
    } else {
        // Valid name
        nameField.classList.add('char-valid');
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
    }
    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
