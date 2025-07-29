import { fieldValidator } from './updateFieldStatus.js';

/** a validation utility for usernames
* This function checks if the username is valid based on the following criteria:
* - Must be 3 to 20 characters long
* - Can only contain letters (a-z, A-Z), numbers (0-9), and underscores (_)
* - Cannot contain special characters or spaces
* - Cannot start with an underscore
* - Cannot be a reserved word (e.g., "admin", "user", "tester")
* - Cannot be empty
* - Cannot contain leading or trailing spaces
*/
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return false;
    }
    // Check for leading or trailing underscores
    if (username.startsWith('_')) {
        return false;
    }
    // Check for reserved words
    const reservedWords = ['admin', 'user', 'tester'];
    if (reservedWords.includes(username.toLowerCase())) {
        return false;
    }
    return true;
}

/** * Function to update username validation
 * @param {string} userNameFieldId - The ID of the username input field
 * @returns {void}
 */
export default function updateUsernameValidation(userNameFieldId) {
    if (!userNameFieldId || typeof userNameFieldId !== 'string') return;

    const userNameField = document.getElementById(userNameFieldId);
    if (!userNameField) return;

    const username = userNameField.value.trim();

    // Clear previous validation
    fieldValidator.clearFieldValidation(userNameField, userNameFieldId);

    if (username.length === 0) {
        // Empty field - no validation needed yet
        return;
    } else if (username.length < 3) {
        // Invalid username length
        fieldValidator.setFieldError(userNameField, userNameFieldId, 'Username must be at least 3 characters long');
    } else if (username.length > 20) {
        // Invalid username length
        fieldValidator.setFieldError(userNameField, userNameFieldId, 'Username must not exceed 20 characters');
    } else if (!isValidUsername(username)) {
        // Invalid username format
        fieldValidator.setFieldError(userNameField, userNameFieldId, 'Enter letters, numbers, and underscores only');
    } else {
        // Valid username
        fieldValidator.setFieldSuccess(userNameField, userNameFieldId, 'Username format is valid');
    }

    fieldValidator.updateSubmitButtonState();
}
