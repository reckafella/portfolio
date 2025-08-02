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
 * param {string} nameFieldId - The ID of the name input field
 * @returns {void}
 */
export function updateNameValidation() {
    const nameField = document.getElementById('id_name');
    if (!nameField) return;

    const name = nameField.value.trim();

    // Clear previous validation
    fieldValidator.clearFieldValidation(nameField, 'id_name');

    if (name.length === 0) {
        // Empty field - no validation needed yet
    } else if (!isValidName(name)) {
        // Invalid name format
        fieldValidator.setFieldError(nameField, 'id_name', 'Please enter a valid name (letters and spaces only)');
    } else {
        // Valid name
        fieldValidator.setFieldSuccess(nameField, 'id_name', 'Name format is valid');
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
