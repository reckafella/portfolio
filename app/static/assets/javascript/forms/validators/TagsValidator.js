import { FieldValidator } from "./FieldValidator.js";

/**
 * TagsValidator class for validating comma-separated tags
 * Extends FieldValidator to provide tag-specific validation logic
 * @class TagsValidator
 * @extends FieldValidator
 */
export class TagsValidator extends FieldValidator {
    /**
     * Validate comma-separated tags
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const tagsText = field.value.trim();
        const config = this.getFieldConfig(fieldId);
        const required = this.isFieldRequired(fieldId);

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        // Handle empty field
        if (!tagsText) {
            if (required) {
                this.setFieldError(field, fieldId, 'Tags are required.');
            }
            return;
        }

        // Parse tags (split by comma and trim whitespace)
        const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (tags.length === 0) {
            if (required) {
                this.setFieldError(field, fieldId, 'At least one tag is required.');
            }
            return;
        }

        // Validation configuration with defaults
        const minTags = config.minTags || 1;
        const maxTags = config.maxTags || 10;
        const minTagLength = config.minTagLength || 2;
        const maxTagLength = config.maxTagLength || 30;
        const allowDuplicates = config.allowDuplicates !== false; // Default to true
        const invalidCharsPattern = config.invalidCharsPattern || /[<>\"'&]/; // HTML-unsafe chars

        const errors = [];
        const warnings = [];

        // Check tag count
        if (tags.length < minTags) {
            errors.push(`At least ${minTags} tag${minTags > 1 ? 's' : ''} required.`);
        }
        if (tags.length > maxTags) {
            errors.push(`Maximum ${maxTags} tags allowed.`);
        }

        // Check for duplicates
        if (!allowDuplicates) {
            const uniqueTags = [...new Set(tags.map(tag => tag.toLowerCase()))];
            if (uniqueTags.length !== tags.length) {
                warnings.push('Duplicate tags detected.');
            }
        }

        // Validate individual tags
        const invalidTags = [];
        const emptyTags = [];
        const longTags = [];
        const shortTags = [];
        const unsafeTags = [];

        tags.forEach((tag, index) => {
            if (!tag) {
                emptyTags.push(index + 1);
                return;
            }

            if (tag.length < minTagLength) {
                shortTags.push(`"${tag}"`);
            }
            if (tag.length > maxTagLength) {
                longTags.push(`"${tag}"`);
            }
            if (invalidCharsPattern.test(tag)) {
                unsafeTags.push(`"${tag}"`);
            }
        });

        // Compile error messages
        if (emptyTags.length > 0) {
            errors.push(`Empty tags at position${emptyTags.length > 1 ? 's' : ''}: ${emptyTags.join(', ')}`);
        }
        if (shortTags.length > 0) {
            errors.push(`Tags too short (min ${minTagLength} chars): ${shortTags.join(', ')}`);
        }
        if (longTags.length > 0) {
            errors.push(`Tags too long (max ${maxTagLength} chars): ${longTags.join(', ')}`);
        }
        if (unsafeTags.length > 0) {
            errors.push(`Tags contain invalid characters: ${unsafeTags.join(', ')}`);
        }

        // Display validation result
        if (errors.length > 0) {
            this.setFieldError(field, fieldId, errors.join(' '));
        } else if (warnings.length > 0) {
            this.setFieldWarning(field, fieldId, warnings.join(' '));
        } else {
            this.setFieldSuccess(field, fieldId, `${tags.length} valid tag${tags.length > 1 ? 's' : ''}`);
        }
    }

    /**
     * Get cleaned tags array from field value
     * @param {string} fieldId - The field ID
     * @returns {string[]} - Array of cleaned tags
     */
    getTags(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) return [];
        
        return field.value.trim()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
    }

    /**
     * Set tags in the field
     * @param {string} fieldId - The field ID
     * @param {string[]} tags - Array of tags to set
     */
    setTags(fieldId, tags) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.value = tags.join(', ');
        this.validate(fieldId);
    }

    /**
     * Add a tag to the field
     * @param {string} fieldId - The field ID
     * @param {string} tag - Tag to add
     */
    addTag(fieldId, tag) {
        const currentTags = this.getTags(fieldId);
        const trimmedTag = tag.trim();
        
        if (trimmedTag && !currentTags.includes(trimmedTag)) {
            currentTags.push(trimmedTag);
            this.setTags(fieldId, currentTags);
        }
    }

    /**
     * Remove a tag from the field
     * @param {string} fieldId - The field ID
     * @param {string} tag - Tag to remove
     */
    removeTag(fieldId, tag) {
        const currentTags = this.getTags(fieldId);
        const filteredTags = currentTags.filter(t => t !== tag.trim());
        this.setTags(fieldId, filteredTags);
    }

    /**
     * Format tags display (removes extra spaces, ensures consistent formatting)
     * @param {string} fieldId - The field ID
     */
    formatTags(fieldId) {
        const tags = this.getTags(fieldId);
        this.setTags(fieldId, tags);
    }
}
