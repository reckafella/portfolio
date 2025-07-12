// a validation utility for usernames
// a valid username can contain letters, numbers, underscores, and must be between 3 and 20 characters long
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// function to update the name validation
export default function updateUserNameValidation(userNameFieldId, validationErrors, updateSubmitButton) {
    const userNameField = document.getElementById(userNameFieldId);
    if (!userNameField) return;

    const userName = userNameField.value.trim();
    // Remove previous classes and messages
    userNameField.classList.remove('char-warning', 'char-error', 'char-valid');
    const existingMessage = userNameField.parentElement.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    if (userName.length === 0) {
        // Empty field
        if (typeof validationErrors === 'object') {
            delete validationErrors[userNameFieldId];
        }
    } else if (!isValidUsername(userName)) {
        // Invalid name format
        userNameField.classList.add('char-error');
        if (typeof validationErrors === 'object') {
            validationErrors[userNameFieldId] = 'Please enter a valid name (letters and spaces only)';
        }
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[userNameFieldId] || 'Invalid name format';
        userNameField.parentElement.appendChild(errorMessage);
    } else {
        // Valid name
        userNameField.classList.add('char-valid');
        if (typeof validationErrors === 'object') {
            delete validationErrors[userNameFieldId];
        }
    }
    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
