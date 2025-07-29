import { fieldValidator } from './updateFieldStatus.js';
/** A validation utility for names
 * @param {string} name - The name string to validate
 * @returns {boolean} - Returns true if the name is valid, false otherwise
 */
function isValidName(name) {
    const nameRegex = /^[a-zA-Z]+((-[a-zA-Z]+)|(\s[a-zA-Z]+))*$/;
    return nameRegex.test(name);
}

/** Function to update the name field's validation
 * @param {string} nameFieldId - The ID of the name input field
 * @returns {void}
 */
export default function updateNameValidation(nameFieldId) {
    if (!nameFieldId || typeof nameFieldId !== 'string') return;

    const nameField = document.getElementById(nameFieldId);
    if (!nameField) return;

    const name = nameField.value.trim();

    // Clear previous validation
    fieldValidator.clearFieldValidation(nameField, nameFieldId);

    if (name.length === 0) {
        // Empty field - no validation needed yet
    } else if (!isValidName(name)) {
        // Invalid name format
        fieldValidator.setFieldError(nameField, nameFieldId, 'Please enter a valid name (letters and spaces only)');
    } else {
        // Valid name
        fieldValidator.setFieldSuccess(nameField, nameFieldId, 'Name format is valid');
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
