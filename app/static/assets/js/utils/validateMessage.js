import { fieldValidator } from "./updateFieldStatus.js";

function isvalidMessage(message) {
    const messageRegex = /^[a-zA-Z0-9\s\`\~\!\@\#\$\%\^\&\*\(\)\-_\+\=\\{\[\]\|\;\:\'\"\<\,\.\>\?\/\+]+$/;

    if (message.length < 25) {
        return {
            isValid: false,
            message: 'Message should be at least 25 characters long.'
        }
    }

    if (message.length > 1000) {
        return {
            isValid: false,
            message: 'Message should not exceed 1,000 characters.'
        }
    }

    if (!messageRegex.test(message)) {
        return {
            isValid: false,
            message: 'Message contains an error. Delete any wierd characters/items.'
        }
    };
    return {
        isValid: true,
        message: 'Message is valid.'
    };
}

/**
 * Utility function for validating the messages in the contact forms
 * @param {string} updateMessageValidation - the ID of the message input field
 * @returns {void}
 */
export function updateMessageValidation(messageFieldId) {
    if (!messageFieldId || typeof messageFieldId !== 'string') return;

    const messageField = document.getElementById(messageFieldId)
    if (!messageField) return;

    const message = messageField.value.trim();

    fieldValidator.clearFieldValidation(messageField, messageFieldId);

    const isMessageValid = isvalidMessage(message);

    if (message.length === 0) {
        return;
    } else if (!isMessageValid.isValid) {
        fieldValidator.setFieldError(messageField, messageFieldId, isMessageValid.message);
    } else {
        fieldValidator.setFieldSuccess(messageField, messageFieldId, isMessageValid.message);
    }
    fieldValidator.updateSubmitButtonState();
}
