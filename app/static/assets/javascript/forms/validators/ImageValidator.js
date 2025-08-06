import { FieldValidator } from "./FieldValidator.js";

/**
 * ImageValidator - Enhanced validator for single image field validation
 * Provides comprehensive validation for single image uploads with preview functionality
 */
export class ImageValidator extends FieldValidator {
    constructor(formManager) {
        super(formManager);
        
        this.previewContainer = null;
        this.previewImage = null;
        this.clearButton = null;
        this.originalValue = null;
    }

    /**
     * Validate a single image field
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const config = this.getFieldConfig(fieldId);
        const required = this.isFieldRequired(fieldId);
        const files = field.files;

        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        // Handle empty field
        if (!files || files.length === 0) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            } else {
                this.hidePreview();
            }
            return;
        }

        const file = files[0];
        this.validateImage(file, field, fieldId, config);
    }

    /**
     * Validate a single image file
     * @param {File} file - The file to validate
     * @param {HTMLElement} field - The input field
     * @param {string} fieldId - The field ID
     * @param {Object} config - Field configuration
     */
    async validateImage(file, field, fieldId, config) {
        try {
            // Default configuration
            const defaultConfig = {
                maxSizeBytes: 5 * 1024 * 1024, // 5MB default
                allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                showPreview: true,
                messages: {
                    invalidFormat: 'Please select a valid image format.',
                    fileTooLarge: 'Image size must be less than {maxSize}.',
                    dimensionsTooSmall: 'Image must be at least {minWidth}x{minHeight} pixels.',
                    dimensionsTooLarge: 'Image must be no larger than {maxWidth}x{maxHeight} pixels.',
                    exactDimensions: 'Image must be exactly {width}x{height} pixels.',
                    invalidAspectRatio: 'Image must have an aspect ratio of {ratio}.',
                    invalidMimeType: 'Invalid image type.',
                    loadError: 'Error loading image. Please try another file.'
                }
            };

            const mergedConfig = { ...defaultConfig, ...config };

            // Check file size
            if (file.size > mergedConfig.maxSizeBytes) {
                const maxSizeMB = (mergedConfig.maxSizeBytes / (1024 * 1024)).toFixed(1);
                this.setFieldError(field, fieldId, 
                    mergedConfig.messages.fileTooLarge.replace('{maxSize}', `${maxSizeMB}MB`));
                return;
            }

            // Check MIME type
            if (!mergedConfig.allowedMimeTypes.includes(file.type)) {
                this.setFieldError(field, fieldId, mergedConfig.messages.invalidMimeType);
                return;
            }

            // Check file extension
            const extension = file.name.split('.').pop().toLowerCase();
            if (!mergedConfig.allowedFormats.includes(extension)) {
                this.setFieldError(field, fieldId, mergedConfig.messages.invalidFormat);
                return;
            }

            // Check if file is empty
            if (file.size === 0) {
                this.setFieldError(field, fieldId, 'File is empty');
                return;
            }

            // Check image dimensions if specified
            if (mergedConfig.minWidth || mergedConfig.minHeight || 
                mergedConfig.maxWidth || mergedConfig.maxHeight ||
                mergedConfig.exactWidth || mergedConfig.exactHeight ||
                mergedConfig.aspectRatio) {
                
                const dimensions = await this.getImageDimensions(file);
                if (!this.validateDimensions(dimensions, mergedConfig, field, fieldId)) {
                    return;
                }
            }

            // If we get here, validation passed
            this.setFieldSuccess(field, fieldId, 'Valid image');
            
            // Show preview if enabled
            if (mergedConfig.showPreview) {
                this.showPreview(file, mergedConfig);
            }

        } catch (error) {
            console.error('Image validation error:', error);
            this.setFieldError(field, fieldId, mergedConfig.messages?.loadError || 'Error loading image. Please try another file.');
            this.hidePreview();
        }
    }

    /**
     * Get image dimensions from file
     * @param {File} file - The image file
     * @returns {Promise<Object>} Promise resolving to {width, height}
     */
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    /**
     * Validate image dimensions
     * @param {Object} dimensions - {width, height}
     * @param {Object} config - Configuration object
     * @param {HTMLElement} field - The input field
     * @param {string} fieldId - The field ID
     * @returns {boolean} True if dimensions are valid
     */
    validateDimensions(dimensions, config, field, fieldId) {
        const { width, height } = dimensions;

        // Check exact dimensions
        if (config.exactWidth && width !== config.exactWidth) {
            this.setFieldError(field, fieldId, config.messages.exactDimensions
                .replace('{width}', config.exactWidth)
                .replace('{height}', config.exactHeight || height));
            return false;
        }

        if (config.exactHeight && height !== config.exactHeight) {
            this.setFieldError(field, fieldId, config.messages.exactDimensions
                .replace('{width}', config.exactWidth || width)
                .replace('{height}', config.exactHeight));
            return false;
        }

        // Check minimum dimensions
        if (config.minWidth && width < config.minWidth) {
            this.setFieldError(field, fieldId, config.messages.dimensionsTooSmall
                .replace('{minWidth}', config.minWidth)
                .replace('{minHeight}', config.minHeight || 0));
            return false;
        }

        if (config.minHeight && height < config.minHeight) {
            this.setFieldError(field, fieldId, config.messages.dimensionsTooSmall
                .replace('{minWidth}', config.minWidth || 0)
                .replace('{minHeight}', config.minHeight));
            return false;
        }

        // Check maximum dimensions
        if (config.maxWidth && width > config.maxWidth) {
            this.setFieldError(field, fieldId, config.messages.dimensionsTooLarge
                .replace('{maxWidth}', config.maxWidth)
                .replace('{maxHeight}', config.maxHeight || 'any'));
            return false;
        }

        if (config.maxHeight && height > config.maxHeight) {
            this.setFieldError(field, fieldId, config.messages.dimensionsTooLarge
                .replace('{maxWidth}', config.maxWidth || 'any')
                .replace('{maxHeight}', config.maxHeight));
            return false;
        }

        // Check aspect ratio
        if (config.aspectRatio) {
            const actualRatio = width / height;
            const tolerance = 0.01; // Allow small tolerance for floating point comparison
            
            if (Math.abs(actualRatio - config.aspectRatio) > tolerance) {
                this.setFieldError(field, fieldId, config.messages.invalidAspectRatio
                    .replace('{ratio}', config.aspectRatio.toFixed(2)));
                return false;
            }
        }

        return true;
    }

    /**
     * Initialize preview functionality for a field
     * @param {string} fieldId - The field ID
     * @param {Object} config - Field configuration
     */
    initializePreview(fieldId, config = {}) {
        const field = document.getElementById(fieldId);
        if (!field || config.showPreview === false) return;

        this.setupPreviewContainer(field, config);
        this.setupEventListeners(field, fieldId);
    }

    /**
     * Set up the preview container and elements
     * @param {HTMLElement} field - The input field
     * @param {Object} config - Configuration object
     */
    setupPreviewContainer(field, config) {
        // Find or create preview container
        let previewContainer = null;
        if (config.previewContainerSelector) {
            previewContainer = document.querySelector(config.previewContainerSelector);
        }

        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview-container mt-2';
            field.parentNode.appendChild(previewContainer);
        }

        this.createPreviewElements(previewContainer, config);
    }

    /**
     * Create preview image and control elements
     * @param {HTMLElement} previewContainer - Container for preview elements
     * @param {Object} config - Configuration object
     */
    createPreviewElements(previewContainer, config) {
        previewContainer.innerHTML = '';

        // Preview wrapper
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'image-preview-wrapper position-relative d-none';

        // Preview image
        const previewImage = document.createElement('img');
        previewImage.className = 'image-preview img-thumbnail';
        previewImage.style.maxWidth = `${config.previewMaxWidth || 200}px`;
        previewImage.style.maxHeight = `${config.previewMaxHeight || 200}px`;
        previewImage.style.objectFit = 'cover';

        // Clear button
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'btn btn-sm btn-outline-danger mt-2';
        clearButton.innerHTML = `<i class="bi bi-trash me-1"></i>${config.clearButtonText || 'Remove Image'}`;

        // Image info
        const imageInfo = document.createElement('div');
        imageInfo.className = 'image-info small text-muted mt-1';

        previewWrapper.appendChild(previewImage);
        previewWrapper.appendChild(imageInfo);
        previewWrapper.appendChild(clearButton);
        previewContainer.appendChild(previewWrapper);

        // Store references
        previewContainer._previewImage = previewImage;
        previewContainer._previewWrapper = previewWrapper;
        previewContainer._imageInfo = imageInfo;

        // Clear button event
        clearButton.addEventListener('click', () => {
            this.clearImage(previewContainer.parentNode.querySelector('input[type="file"]'), previewContainer);
        });
    }

    /**
     * Set up event listeners for file input
     * @param {HTMLElement} field - The input field
     * @param {string} fieldId - The field ID
     */
    setupEventListeners(field, fieldId) {
        field.addEventListener('change', (e) => {
            this.handleImageChange(e, fieldId);
        });
    }

    /**
     * Handle image selection change
     * @param {Event} event - The change event
     * @param {string} fieldId - The field ID
     */
    async handleImageChange(event, fieldId) {
        const file = event.target.files[0];
        const field = event.target;
        const config = this.getFieldConfig(fieldId);
        
        if (!file) {
            this.hidePreview(field);
            return;
        }

        // Validate the image
        await this.validateImage(file, field, fieldId, config);
        
        // Show preview if validation passed and preview is enabled
        if (config.showPreview !== false && !this.formManager.validationErrors[fieldId]) {
            this.showPreview(file, field, config);
        }
    }

    /**
     * Show image preview
     * @param {File} file - The image file
     * @param {HTMLElement} field - The input field
     * @param {Object} config - Configuration object
     */
    showPreview(file, field, config = {}) {
        const previewContainer = field.parentNode.querySelector('.image-preview-container');
        if (!previewContainer || !previewContainer._previewImage) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewContainer._previewImage.src = e.target.result;
            this.updateImageInfo(file, previewContainer);
            previewContainer._previewWrapper.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Hide image preview
     * @param {HTMLElement} field - The input field
     */
    hidePreview(field) {
        if (!field) return;
        const previewContainer = field.parentNode.querySelector('.image-preview-container');
        if (previewContainer && previewContainer._previewWrapper) {
            previewContainer._previewWrapper.classList.add('d-none');
        }
    }

    /**
     * Update image information display
     * @param {File} file - The image file
     * @param {HTMLElement} previewContainer - Preview container element
     */
    updateImageInfo(file, previewContainer) {
        if (previewContainer._imageInfo) {
            const sizeKB = (file.size / 1024).toFixed(1);
            previewContainer._imageInfo.textContent = `${file.name} (${sizeKB} KB)`;
        }
    }

    /**
     * Clear the selected image
     * @param {HTMLElement} field - The input field
     * @param {HTMLElement} previewContainer - Preview container element
     */
    clearImage(field, previewContainer) {
        if (field) {
            field.value = '';
            this.hidePreview(field);
            field.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Reset the field to its original value
     */
    reset() {
        super.reset();
        this.field.value = this.originalValue;
        this.hidePreview();
    }

    /**
     * Check if the field has a valid image
     */
    hasValidImage() {
        return this.field.files && this.field.files.length > 0 && this.isValid();
    }

    /**
     * Get the selected image file
     */
    getImageFile() {
        return this.field.files && this.field.files.length > 0 ? this.field.files[0] : null;
    }

    /**
     * Set validation configuration
     */
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this;
    }

    /**
     * Static method to create and initialize an ImageValidator
     */
    static create(fieldSelector, config = {}) {
        const validator = new ImageValidator(config);
        validator.setField(fieldSelector);
        return validator.init();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageValidator;
}
