import { FieldValidator } from "./FieldValidator.js";


/**
 * URLValidator class for validating URL fields
 * Extends FieldValidator to provide URL-specific validation logic
 * @class URLValidator
 * @extends FieldValidator
 * @param {string} fieldId - The ID of the URL input field
 */
export class URLValidator extends FieldValidator {
    isValidUrl(value) {
        const httpUrlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
        return httpUrlPattern.test(value);
    }

    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const url = field.value.trim();

        // Get field configuration (merge with data attributes)
        const required = this.isFieldRequired(fieldId);

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        if (!url) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            }
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            this.setFieldError(field, fieldId, 'URL should start with http:// or https://');
        } else if (!this.isValidUrl(url)) {
            this.setFieldError(field, fieldId, 'Invalid URL format.');
        } else {
            this.setFieldSuccess(field, fieldId, 'URL is valid.');
        }
    }
}

/** * YouTubeURLValidator class for validating YouTube URL fields
 * Extends URLValidator to provide YouTube-specific validation logic
 * @class YouTubeURLValidator
 * @extends URLValidator
 * @param {string} fieldId - The ID of the YouTube URL input field
 */
export class YouTubeURLValidator extends URLValidator {
    /**
     * Validate YouTube URLs (supports single URL or multiple URLs separated by newlines)
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const urlsText = field.value.trim();

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        // If empty and not required, that's okay
        if (!urlsText) {
            return; // Don't show error for empty non-required field
        }

        // Split by newlines and filter out empty lines
        const urls = urlsText.split('\n').map(url => url.trim()).filter(url => url);
        
        if (urls.length === 0) {
            return; // No URLs to validate
        }

        const invalidUrls = [];
        const validUrls = [];

        urls.forEach((url, index) => {
            if (!this.isValidUrl(url)) {
                invalidUrls.push(`Line ${index + 1}: Invalid URL format`);
            } else if (!this.isYouTubeUrl(url)) {
                invalidUrls.push(`Line ${index + 1}: Not a valid YouTube URL`);
            } else {
                validUrls.push(url);
            }
        });

        if (invalidUrls.length > 0) {
            this.setFieldError(field, fieldId, invalidUrls.join('; '));
        } else if (validUrls.length > 0) {
            this.setFieldSuccess(field, fieldId, `${validUrls.length} valid YouTube URL(s)`);
        }
    }

    /**
     * Check if URL is a valid YouTube URL
     * @param {string} url - URL to check
     * @returns {boolean} - True if valid YouTube URL
     */
    isYouTubeUrl(url) {
        const youtubePatterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/
        ];
        
        return youtubePatterns.some(pattern => pattern.test(url));
    }
}
