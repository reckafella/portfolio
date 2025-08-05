import { FieldValidator } from "./FieldValidator.js";

/**
 * ImageValidator - Enhanced validator for single image field validation
 * Provides comprehensive validation for single image uploads with preview functionality
 */
export class ImageValidator extends FieldValidator {
    constructor(config = {}) {
        super(config);

        // Default configuration for single image validation
        this.config = {
            required: false,
            maxSizeBytes: 5 * 1024 * 1024, // 5MB default
            allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            minWidth: null,
            minHeight: null,
            maxWidth: null,
            maxHeight: null,
            exactWidth: null,
            exactHeight: null,
            aspectRatio: null, // e.g., 16/9 for 16:9 ratio
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            showPreview: true,
            previewMaxWidth: 200,
            previewMaxHeight: 200,
            previewContainerSelector: null, // If not provided, will create one
            clearButtonText: 'Remove Image',
            messages: {
                required: 'Please select an image.',
                invalidFormat: 'Please select a valid image format.',
                fileTooLarge: 'Image size must be less than {maxSize}.',
                dimensionsTooSmall: 'Image must be at least {minWidth}x{minHeight} pixels.',
                dimensionsTooLarge: 'Image must be no larger than {maxWidth}x{maxHeight} pixels.',
                exactDimensions: 'Image must be exactly {width}x{height} pixels.',
                invalidAspectRatio: 'Image must have an aspect ratio of {ratio}.',
                invalidMimeType: 'Invalid image type.',
                loadError: 'Error loading image. Please try another file.'
            },
            ...config
        };

        this.previewContainer = null;
        this.previewImage = null;
        this.clearButton = null;
        this.originalValue = null;
    }

    /**
     * Initialize the validator and set up preview functionality
     */
    init() {
        super.init();

        if (this.config.showPreview) {
            this.setupPreviewContainer();
            this.setupEventListeners();
        }

        // Store original value for reset functionality
        this.originalValue = this.field.value;

        return this;
    }

    /**
     * Set up the preview container and elements
     */
    setupPreviewContainer() {
        // Find or create preview container
        if (this.config.previewContainerSelector) {
            this.previewContainer = document.querySelector(this.config.previewContainerSelector);
        }

        if (!this.previewContainer) {
            this.previewContainer = document.createElement('div');
            this.previewContainer.className = 'image-preview-container mt-2';
            this.field.parentNode.appendChild(this.previewContainer);
        }

        // Create preview elements
        this.createPreviewElements();
    }

    /**
     * Create preview image and control elements
     */
    createPreviewElements() {
        this.previewContainer.innerHTML = '';

        // Preview wrapper
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'image-preview-wrapper position-relative d-none';

        // Preview image
        this.previewImage = document.createElement('img');
        this.previewImage.className = 'image-preview img-thumbnail';
        this.previewImage.style.maxWidth = `${this.config.previewMaxWidth}px`;
        this.previewImage.style.maxHeight = `${this.config.previewMaxHeight}px`;
        this.previewImage.style.objectFit = 'cover';

        // Clear button
        this.clearButton = document.createElement('button');
        this.clearButton.type = 'button';
        this.clearButton.className = 'btn btn-sm btn-outline-danger mt-2';
        this.clearButton.innerHTML = `<i class="bi bi-trash me-1"></i>${this.config.clearButtonText}`;

        // Image info
        const imageInfo = document.createElement('div');
        imageInfo.className = 'image-info small text-muted mt-1';

        previewWrapper.appendChild(this.previewImage);
        previewWrapper.appendChild(imageInfo);
        previewWrapper.appendChild(this.clearButton);
        this.previewContainer.appendChild(previewWrapper);

        // Clear button event
        this.clearButton.addEventListener('click', () => {
            this.clearImage();
        });
    }

    /**
     * Set up event listeners for file input
     */
    setupEventListeners() {
        this.field.addEventListener('change', (e) => {
            this.handleImageChange(e);
        });
    }

    /**
     * Handle image selection change
     */
    async handleImageChange(event) {
        const file = event.target.files[0];

        if (!file) {
            this.hidePreview();
            this.clearErrors();
            return;
        }

        try {
            // Validate the image
            const isValid = await this.validateImage(file);

            if (isValid) {
                this.showPreview(file);
                this.clearErrors();
            } else {
                this.hidePreview();
            }
        } catch (error) {
            console.error('Image validation error:', error);
            this.addError(this.config.messages.loadError);
            this.hidePreview();
        }
    }

    /**
     * Validate a single image file
     */
    async validateImage(file) {
        // Check if file is required
        if (this.config.required && !file) {
            this.addError(this.config.messages.required);
            return false;
        }

        if (!file) return true; // Not required and no file selected

        // Check file size
        if (file.size > this.config.maxSizeBytes) {
            const maxSizeMB = (this.config.maxSizeBytes / (1024 * 1024)).toFixed(1);
            this.addError(this.config.messages.fileTooLarge.replace('{maxSize}', `${maxSizeMB}MB`));
            return false;
        }

        // Check MIME type
        if (!this.config.allowedMimeTypes.includes(file.type)) {
            this.addError(this.config.messages.invalidMimeType);
            return false;
        }

        // Check file extension
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.config.allowedFormats.includes(extension)) {
            this.addError(this.config.messages.invalidFormat);
            return false;
        }

        // Check image dimensions if specified
        if (this.config.minWidth || this.config.minHeight ||
            this.config.maxWidth || this.config.maxHeight ||
            this.config.exactWidth || this.config.exactHeight ||
            this.config.aspectRatio) {

            const dimensions = await this.getImageDimensions(file);
            if (!this.validateDimensions(dimensions)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get image dimensions from file
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
     */
    validateDimensions(dimensions) {
        const { width, height } = dimensions;

        // Check exact dimensions
        if (this.config.exactWidth && width !== this.config.exactWidth) {
            this.addError(this.config.messages.exactDimensions
                .replace('{width}', this.config.exactWidth)
                .replace('{height}', this.config.exactHeight || height));
            return false;
        }

        if (this.config.exactHeight && height !== this.config.exactHeight) {
            this.addError(this.config.messages.exactDimensions
                .replace('{width}', this.config.exactWidth || width)
                .replace('{height}', this.config.exactHeight));
            return false;
        }

        // Check minimum dimensions
        if (this.config.minWidth && width < this.config.minWidth) {
            this.addError(this.config.messages.dimensionsTooSmall
                .replace('{minWidth}', this.config.minWidth)
                .replace('{minHeight}', this.config.minHeight || 0));
            return false;
        }

        if (this.config.minHeight && height < this.config.minHeight) {
            this.addError(this.config.messages.dimensionsTooSmall
                .replace('{minWidth}', this.config.minWidth || 0)
                .replace('{minHeight}', this.config.minHeight));
            return false;
        }

        // Check maximum dimensions
        if (this.config.maxWidth && width > this.config.maxWidth) {
            this.addError(this.config.messages.dimensionsTooLarge
                .replace('{maxWidth}', this.config.maxWidth)
                .replace('{maxHeight}', this.config.maxHeight || 'any'));
            return false;
        }

        if (this.config.maxHeight && height > this.config.maxHeight) {
            this.addError(this.config.messages.dimensionsTooLarge
                .replace('{maxWidth}', this.config.maxWidth || 'any')
                .replace('{maxHeight}', this.config.maxHeight));
            return false;
        }

        // Check aspect ratio
        if (this.config.aspectRatio) {
            const actualRatio = width / height;
            const tolerance = 0.01; // Allow small tolerance for floating point comparison

            if (Math.abs(actualRatio - this.config.aspectRatio) > tolerance) {
                this.addError(this.config.messages.invalidAspectRatio
                    .replace('{ratio}', this.config.aspectRatio.toFixed(2)));
                return false;
            }
        }

        return true;
    }

    /**
     * Show image preview
     */
    showPreview(file) {
        if (!this.previewImage || !this.config.showPreview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
            this.updateImageInfo(file);
            this.previewContainer.querySelector('.image-preview-wrapper').classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Hide image preview
     */
    hidePreview() {
        if (this.previewContainer) {
            this.previewContainer.querySelector('.image-preview-wrapper').classList.add('d-none');
        }
    }

    /**
     * Update image information display
     */
    updateImageInfo(file) {
        const infoElement = this.previewContainer.querySelector('.image-info');
        if (infoElement) {
            const sizeKB = (file.size / 1024).toFixed(1);
            infoElement.textContent = `${file.name} (${sizeKB} KB)`;
        }
    }

    /**
     * Clear the selected image
     */
    clearImage() {
        this.field.value = '';
        this.hidePreview();
        this.clearErrors();
        this.field.dispatchEvent(new Event('change'));
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
