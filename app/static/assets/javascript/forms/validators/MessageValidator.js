import { FieldValidator } from './FieldValidator.js';

/**
 * MessageValidator extends FieldValidator with message-specific validation methods
 */
export class MessageValidator extends FieldValidator {
    /**
     * Validate message length and content
     * @param {string} fieldId - Message field ID
     * @param {string} fieldName - Human-readable field name for error messages
     * @param {boolean} required - Whether the field is required
     */
    validate(fieldId, fieldName = 'Message', required = true) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const message = field.value.trim();

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!message) {
            if (required) {
                this.setFieldError(field, fieldId, `${fieldName} is required`);
            }
            // If not required and empty, no validation error
        } else if (message.length > 0 && message.length < 25) {
            this.setFieldError(field, fieldId, `${fieldName} must be at least 25 characters`);
        } else if (message.length < 50) {
            this.setFieldWarning(field, fieldId, `Consider adding more details to your ${fieldName.toLowerCase()}`);
        } else if (message.length > 1500) {
            this.setFieldError(field, fieldId, `${fieldName} must be less than 1500 characters`);
        } else {
            this.setFieldSuccess(field, fieldId, `${fieldName} looks good`);
        }
    }

    /**
     * Count words in the message
     * @param {string} fieldId - Message field ID
     * @returns {number} - Word count
     */
    countWords(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return 0;
        
        const message = field.value.trim();
        return message ? message.split(/\s+/).length : 0;
    }

    /**
     * Setup word counter for a message field
     * @param {string} fieldId - Message field ID
     * @param {string} counterId - Counter element ID
     */
    setupWordCounter(fieldId, counterId) {
        const field = document.getElementById(fieldId);
        const counter = document.getElementById(counterId);
        
        if (!field || !counter) return;
        
        const updateCounter = () => {
            const wordCount = this.countWords(fieldId);
            counter.textContent = `${wordCount} words`;
            
            if (wordCount < 20) {
                counter.className = 'text-danger';
            } else if (wordCount > 200) {
                counter.className = 'text-warning';
            } else {
                counter.className = 'text-success';
            }
        };
        
        field.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
}
