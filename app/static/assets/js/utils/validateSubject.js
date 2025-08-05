import { fieldValidator } from './updateFieldStatus.js';

/** * A validation utility for subjects (used in contact forms)
 * @param {string} subject - The subject string to validate
 * @returns {boolean} - Returns true if the subject is valid, false otherwise
 */
function isValidSubject(subject) {
    const subjectRegex = /^[a-zA-Z0-9\s]+$/;
    return subjectRegex.test(subject);
}

/**
 * Function to update the subject field's validation (used in contact forms)
 * @param {string} subjectFieldId - The ID of the subject input field
 * @returns {void}
 */
export function updateSubjectValidation(subjectFieldId) {
    const subjectField = document.getElementById(subjectFieldId);
    if (!subjectField) return;

    const subject = subjectField.value.trim();

    // Clear previous validation
    fieldValidator.clearFieldValidation(subjectField, subjectFieldId);

    if (subject.length === 0) {
        return;
    } else if (!isValidSubject(subject)) {
        // Invalid subject format
        fieldValidator.setFieldError(subjectField, subjectFieldId, 'Please enter a valid subject (letters, numbers, and spaces only)');
    } else {
        // Valid subject
        fieldValidator.setFieldSuccess(subjectField, subjectFieldId, 'Subject format is valid');
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
