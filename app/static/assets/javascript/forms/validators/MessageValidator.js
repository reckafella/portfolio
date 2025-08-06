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
    validate(fieldId, fieldName = null) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const message = field.value.trim();

        const config = this.getFieldConfig(fieldId);
        const minLength = config.min || 25;
        const maxLength = config.max || 1500;
        const required = this.isFieldRequired(fieldId);

        // Use field name from config or parameter, fallback to 'Message'
        const displayName = fieldName || this.getFieldDisplayName(fieldId) || 'Message';

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);
        
        if (!message) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            }
            // If not required and empty, no validation error
        } else if (message.length > 0 && message.length < minLength) {
            this.setFieldError(field, fieldId, `${displayName} must be at least ${minLength} characters`);
        } else if (message.length < (minLength + 30)) {
            this.setFieldWarning(field, fieldId, `Consider adding more details to your ${displayName.toLowerCase()}`);
        } else if (message.length > maxLength) {
            this.setFieldError(field, fieldId, `${displayName} must be less than ${maxLength} characters`);
        } else {
            this.setFieldSuccess(field, fieldId, `${displayName} looks good`);
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

    /**
     * Get Display name for field based on Field ID
     * @param {string} fieldId - the Field Id
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_message': 'Message',
            'id_comment': 'Comment',
            'id_review': 'Review',
            'id_content': 'Article Content',
            'id_description': 'Description',
            'id_feedback': 'Feedback'
        };
        return displayNames[fieldId] || 'Message';
    }
}
