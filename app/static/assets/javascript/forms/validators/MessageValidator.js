import { FieldValidator } from './FieldValidator.js';

/**
 * MessageValidator extends FieldValidator with message-specific validation methods
 */
export class MessageValidator extends FieldValidator {
    /**
     * Validate message length and content
     * @param {string} fieldId - Message field ID
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const message = field.value.trim();

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!message) {
            //this.setFieldError(field, fieldId, 'Message is required');
        } else if (message.length > 0 && message.length < 20) {
            this.setFieldError(field, fieldId, 'Message must be at least 20 characters');
        } else if (message.length < 50) {
            this.setFieldWarning(field, fieldId, 'Consider adding more details to your message');
        } else if (message.length > 1000) {
            this.setFieldError(field, fieldId, 'Message must be less than 1000 characters');
        } else {
            this.setFieldSuccess(field, fieldId, '');
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
