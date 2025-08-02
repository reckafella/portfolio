import { fieldValidator } from './updateFieldStatus.js';

/** a validation utility for usernames
 * @param {string} username - a username string
 * @returns {(boolean, string)} (isValid, message)
* This function checks if the username is valid based on the following criteria:
* - Must be 3 to 20 characters long
* - Can only contain letters (a-z, A-Z), numbers (0-9), and underscores (_)
* - Cannot contain special characters or spaces
* - Cannot start with an underscore
* - Cannot be a reserved word (e.g., "admin", "user")
* - Cannot be empty
* - Cannot contain leading or trailing spaces
*/
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (username.length < 3 || username > 30) {
        return {
            isValid: false,
            message: 'Username should be 3-30 chars long'
        };
    }
    // Check for leading underscores
    if (username.startsWith('_')) {
        return {
            isValid: false,
            message: 'Username should not start with an underscore.'
        };
    }
    // Check for reserved words
    const reservedWords = ['admin', 'user'];
    if (reservedWords.includes(username.toLowerCase())) {
        return {
            isValid: false,
            message: `Username: ${username} is a reserved word.`
        };
    }

    if (!usernameRegex.test(username)) {
        return {
            isValid: false,
            message: 'Invalid username. Use letters, numbers and underscores only.'
        };
    }

    return {
        isValid: true,
        message: 'Username is valid.'
    };
}

/** * Function to update username validation
 * @param {string} userNameFieldId - The ID of the username input field
 * @returns {void}
 */
export function updateUserNameValidation(userNameFieldId) {
    if (!userNameFieldId || typeof userNameFieldId !== 'string') return;

    const userNameField = document.getElementById(userNameFieldId);
    if (!userNameField) return;

    const username = userNameField.value.trim();

    // Clear previous validation
    fieldValidator.clearFieldValidation(userNameField, userNameFieldId);

    if (username.length === 0) {
        // Empty field - no validation needed yet
        return;
    } else if (!isValidUsername(username).isValid) {
        // Invalid username format
        fieldValidator.setFieldError(userNameField, userNameFieldId, isValidUsername(username).message);
    } else {
        // Valid username
        fieldValidator.setFieldSuccess(userNameField, userNameFieldId,  (isValidUsername(username).message || 'Username format is valid'));
    }

    fieldValidator.updateSubmitButtonState();
}
