function isValidSubject(subject) {
    const subjectRegex = /^[a-zA-Z0-9\s]+$/;
    return subjectRegex.test(subject);
}

    // Function to update subject validation
export default function updateSubjectValidation(subjectFieldId) {
    const subjectField = document.getElementById(subjectFieldId);
    if (!subjectField) return;

    const subject = subjectField.value.trim();
    const validationErrors = window.validationErrors || {};
    const updateSubmitButton = window.updateSubmitButton || function () { };

    // Remove previous classes and messages
    subjectField.classList.remove('char-warning', 'char-error', 'char-valid');
    const existingMessage = subjectField.parentElement.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    if (subject.length === 0) {
        // Empty field
        if (typeof validationErrors === 'object') {
            delete validationErrors[subjectFieldId];
        }
    } else if (!isValidSubject(subject)) {
        // Invalid subject format
        subjectField.classList.add('char-error');
        if (typeof validationErrors === 'object') {
            validationErrors[subjectFieldId] = 'Please enter a valid subject (letters, numbers, and spaces only)';
        }
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[subjectFieldId] || 'Invalid subject format';
        subjectField.parentElement.appendChild(errorMessage);
    } else {
        // Valid subject
        subjectField.classList.add('char-valid');

        if (typeof validationErrors === 'object') delete validationErrors[subjectFieldId];
    }
    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
