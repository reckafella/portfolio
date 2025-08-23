import { FieldValidator } from "./FieldValidator.js";

/**
 * ImageValidator class for validating single image fields
 * Extends FieldValidator to provide single image validation logic
 * @class ImageValidator
 * @extends FieldValidator
 */
export class ImageValidator extends FieldValidator {
    /**
     * Validate single uploaded image
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        // Get field configuration
        const config = this.getFieldConfig(fieldId);
        const displayName = this.getFieldDisplayName(fieldId) || 'Image';
        
        // Configuration with data attribute override
        const maxSize = field?.dataset.maxSize ? parseInt(field.dataset.maxSize) : (config.maxSize || (5 * 1024 * 1024));
        const allowedTypes = config.allowedTypes || [
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp',
            'image/bmp',
            'image/svg+xml'
        ];
        const required = this.isFieldRequired(fieldId);

        // For file inputs, check the files property
        const files = field.files;
        
        if (!files || files.length === 0) {
            if (required) {
                this.setFieldError(field, fieldId, '');
            }
            return;
        }

        // Single file validation
        const file = files[0];

        if (!allowedTypes.includes(file.type.toLowerCase())) {
            this.setFieldError(field, fieldId, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
            return;
        }

        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            this.setFieldError(field, fieldId, `File too large. Maximum size: ${maxSizeMB}MB`);
            return;
        }

        if (file.size === 0) {
            this.setFieldError(field, fieldId, 'File is empty');
            return;
        }

        // Success
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.setFieldSuccess(field, fieldId, `Valid image selected (${fileSizeMB}MB)`);
    }

    /**
     * Create single image preview with drag-and-drop support
     * @param {string} fieldId - The field ID
     */
    createImagePreview(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const existingPreview = field.parentElement.querySelector('.image-preview-container');
        if (existingPreview) {
            existingPreview.remove(); // Remove any existing preview
        }

        // Add drag and drop functionality
        this.setupDragAndDrop(fieldId);

        // Handle file selection
        field.addEventListener('change', (event) => {
            this.updateImagePreview(fieldId, event.target.files);
        });
    }

    /**
     * Set up drag and drop functionality for single image
     * @param {string} fieldId - The field ID
     */
    setupDragAndDrop(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const container = field.parentElement;

        // Create drag overlay
        const dragOverlay = document.createElement('div');
        dragOverlay.className = 'drag-overlay';
        dragOverlay.innerHTML = `
            <div class="drag-content">
                <i class="bi bi-image-fill"></i>
                <p>Drop image here or click to browse</p>
            </div>
        `;
        dragOverlay.style.display = 'none';
        container.appendChild(dragOverlay);

        // Drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        container.addEventListener('dragenter', () => {
            dragOverlay.style.display = 'flex';
            container.classList.add('drag-hover');
        });

        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                dragOverlay.style.display = 'none';
                container.classList.remove('drag-hover');
            }
        });

        container.addEventListener('drop', (e) => {
            dragOverlay.style.display = 'none';
            container.classList.remove('drag-hover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Only take the first file for single image
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                field.files = dt.files;
                
                // Trigger validation and preview
                this.validate(fieldId);
                this.updateImagePreview(fieldId, field.files);
            }
        });
    }

    /**
     * Update single image preview
     * @param {string} fieldId - The field ID
     * @param {FileList} files - Selected files
     */
    updateImagePreview(fieldId, files) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing preview
        let previewContainer = field.parentElement.querySelector('.image-preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }

        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) return;

        // Create preview container
        previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview-container mt-2';

        if (file.type.startsWith('image/')) {
            this.createImagePreviewCard(file, previewContainer, fieldId);
        }
        field.parentElement.appendChild(previewContainer);
    }

    /**
     * Create single image preview card
     * @param {File} file - The image file
     * @param {HTMLElement} container - Container to append to
     * @param {string} fieldId - The field ID
     */
    createImagePreviewCard(file, container, fieldId) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const field = document.getElementById(fieldId);
            const config = this.getFieldConfig(fieldId);
            const maxSize = field?.dataset.maxSize ? parseInt(field.dataset.maxSize) : (config.maxSize || (5 * 1024 * 1024));
            
            const fileSizeKB = (file.size / 1024).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const displaySize = file.size < 1024 * 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`;
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            const maxSizeExceeded = file.size > maxSize;

            container.innerHTML = `
                <div class="card position-relative">
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 remove-image-btn" 
                            style="border-radius: 50%; width: 24px; height: 24px; padding: 0; z-index: 10;">
                        <i class="bi bi-x-lg text-white" style="font-size: 10px;"></i>
                    </button>
                    <img src="${e.target.result}" class="card-img-top" 
                         style="height: 120px; object-fit: cover; cursor: pointer;" 
                         alt="${file.name}" title="Click to view full size">
                    <div class="card-body p-2">
                        <small class="card-text text-truncate d-block" title="${file.name}">${file.name}</small>
                        <small class="text-muted">${displaySize}</small>
                        <div class="mt-1">
                            <div class="progress" style="height: 4px;">
                                ${maxSizeExceeded ? `<div class="progress-bar bg-danger" role="progressbar" style="width: 100%"></div>` : `<div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>`};
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Handle image removal
            const removeBtn = container.querySelector('.remove-image-btn');
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearImage(fieldId);
            });

            // Handle image click for full-size view
            const img = container.querySelector('img');
            img.addEventListener('click', () => {
                this.showImageModal(e.target.result, file.name);
            });
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear selected image
     * @param {string} fieldId - The field ID
     */
    clearImage(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Clear the file input
        field.value = '';

        // Remove preview
        const previewContainer = field.parentElement.querySelector('.image-preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }

        // Revalidate
        this.validate(fieldId);
    }

    /**
     * Show image in modal for full-size viewing
     * @param {string} imageSrc - Image source URL
     * @param {string} fileName - File name
     */
    showImageModal(imageSrc, fileName) {
        // Check if modal already exists
        let modal = document.getElementById('image-preview-modal');
        if (!modal) {
            // Create modal
            modal = document.createElement('div');
            modal.id = 'image-preview-modal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Image Preview</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <img src="" class="img-fluid" style="max-height: 70vh;">
                            <p class="mt-2 text-muted" id="modal-filename"></p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Update modal content
        const modalImg = modal.querySelector('img');
        const modalFilename = modal.querySelector('#modal-filename');
        modalImg.src = imageSrc;
        modalFilename.textContent = fileName;

        // Show modal (Bootstrap 5)
        if (window.bootstrap) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            // Fallback if Bootstrap is not available
            modal.style.display = 'block';
            modal.classList.add('show');
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            const closeModal = () => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                backdrop.remove();
            };
            
            modal.querySelector('.btn-close').addEventListener('click', closeModal);
            backdrop.addEventListener('click', closeModal);
        }
    }
    /**
     * Get display name for field based on field ID
     * @param {string} fieldId - The field ID
     * @returns {string} - Human-readable field name
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_cover_image': 'Cover Image',
            'id_profile_pic': 'Profile Picture',
            'id_featured_image': 'Featured Image',
            // Add more field IDs and their display names as needed
        };
        return displayNames[fieldId] || 'Image';
    }
}
