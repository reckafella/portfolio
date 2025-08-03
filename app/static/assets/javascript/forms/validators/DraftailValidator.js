import { FieldValidator } from "./FieldValidator.js";

/**
 * DraftailValidator class for validating Draftail rich text content
 * @class DraftailValidator
 * @extends FieldValidator
 */
export class DraftailValidator extends FieldValidator {
    /**
     * Validate Draftail content
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        const config = this.getFieldConfig(fieldId);
        const required = this.isFieldRequired(fieldId);
        const minLength = config.min || 25;
        const maxLength = config.max || 10000;

        // Get the hidden input value (Draftail JSON)
        const draftailData = field.value;

        if (!draftailData && required) {
            this.setFieldError(field, fieldId, 'Content is required');
            return;
        }

        if (draftailData) {
            try {
                // Parse Draftail JSON
                const data = JSON.parse(draftailData);
                const textContent = this.extractTextFromDraftail(data);
                
                if (textContent.length < minLength) {
                    this.setFieldError(field, fieldId, `Content must be at least ${minLength} characters`);
                    return;
                }

                if (textContent.length > maxLength) {
                    this.setFieldError(field, fieldId, `Content must be less than ${maxLength} characters`);
                    return;
                }

                this.setFieldSuccess(field, fieldId, `Content looks good (${textContent.length} characters)`);
                
            } catch (e) {
                this.setFieldError(field, fieldId, 'Invalid content format');
            }
        }
    }

    /**
     * Extract plain text from Draftail JSON structure
     * @param {Object} draftailData - Draftail JSON data
     * @returns {string} - Plain text content
     */
    extractTextFromDraftail(draftailData) {
        if (!draftailData || !draftailData.blocks) {
            return '';
        }

        return draftailData.blocks
            .map(block => block.text || '')
            .filter(text => text.trim().length > 0)
            .join(' ')
            .trim();
    }

    /**
     * Get character count for Draftail content
     * @param {string} fieldId - The field ID
     * @returns {number} - Character count
     */
    getCharacterCount(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return 0;

        try {
            const data = JSON.parse(field.value);
            return this.extractTextFromDraftail(data).length;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Set up real-time character counting for Draftail
     * @param {string} fieldId - The field ID
     */
    setupCharacterCounting(fieldId) {
        const field = document.getElementById(fieldId);
        const config = this.getFieldConfig(fieldId);
        
        if (!field || !config.counterId) return;

        const counter = document.getElementById(config.counterId);
        if (!counter) return;

        // Update counter function
        const updateCounter = () => {
            const count = this.getCharacterCount(fieldId);
            const maxLength = config.max || 10000;
            
            counter.textContent = `${count}/${maxLength} characters`;
            
            // Update counter styling based on character count
            counter.className = 'char-count';
            if (count > maxLength * 0.9) {
                counter.classList.add('char-warning');
            }
            if (count > maxLength) {
                counter.classList.add('char-error');
            }
        };

        // Listen for changes in the hidden input
        const observer = new MutationObserver(() => {
            updateCounter();
            this.validate(fieldId);
        });

        observer.observe(field, {
            attributes: true,
            attributeFilter: ['value']
        });

        // Also listen for input events
        field.addEventListener('input', updateCounter);
        
        // Initial update
        updateCounter();
    }
}
