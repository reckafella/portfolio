import { FieldValidator } from "./FieldValidator.js";

/**
 * ImagesValidator class for validating image fields
 * Extends FieldValidator to provide image-specific validation logic
 * @class ImagesValidator
 * @extends FieldValidator
 */
export class ImagesValidator extends FieldValidator {
    /**
     * Validate uploaded images (multiple files)
     * @param {string} fieldId - The field ID to validate
     */
    validate(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Clear previous validation
        this.clearFieldValidation(field, fieldId);

        // Get field configuration (merge with data attributes)
        const config = this.getFieldConfig(fieldId);
        
        // Override config with data attributes if present
        const maxFiles = field?.dataset.maxFiles ? parseInt(field.dataset.maxFiles) : (config.maxFiles || 10);
        const maxSize = field?.dataset.maxSize ? parseInt(field.dataset.maxSize) : (config.maxSize || (5 * 1024 * 1024));
        const maxTotalSize = field?.dataset.maxTotalSize ? parseInt(field.dataset.maxTotalSize) : (config.maxTotalSize || (50 * 1024 * 1024));
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
        this.maxSizeMB = maxSize / (1024 * 1024); // Update max size in MB

        // Check file count limit
        if (files.length > maxFiles) {
            this.setFieldError(field, fieldId, `Too many files selected. Maximum ${maxFiles} files allowed`);
            return;
        }

        const invalidFiles = [];
        const validFiles = [];
        let totalSize = 0;

        Array.from(files).forEach((file, index) => {
            totalSize += file.size;

            if (!allowedTypes.includes(file.type.toLowerCase())) {
                invalidFiles.push(`${file.name}: Invalid file type (${file.type})`);
            } else if (file.size > maxSize) {
                const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
                invalidFiles.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
            } else if (file.size === 0) {
                invalidFiles.push(`${file.name}: File is empty`);
            } else {
                validFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }
        });

        // Check total size limit
        if (totalSize > maxTotalSize) {
            const maxTotalSizeMB = (maxTotalSize / (1024 * 1024)).toFixed(1);
            invalidFiles.push(`Total file size too large (max ${maxTotalSizeMB}MB total)`);
        }

        if (invalidFiles.length > 0) {
            this.setFieldError(field, fieldId, invalidFiles.join('; '));
        } else if (validFiles.length > 0) {
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
            this.setFieldSuccess(field, fieldId, 
                `${validFiles.length} valid image(s) selected (${totalSizeMB}MB total)`);
        }
    }

    /**
     * Create image preview for uploaded files with drag-and-drop support
     * @param {string} fieldId - The field ID
     */
    createImagePreview(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing preview
        const existingPreview = field.parentElement.querySelector('.image-preview-container');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Add drag and drop functionality
        this.setupDragAndDrop(fieldId);

        // Handle file selection
        field.addEventListener('change', (event) => {
            this.updateImagePreview(fieldId, event.target.files);
        });
    }

    /**
     * Set up drag and drop functionality for the file input
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
                <i class="bi bi-cloud-arrow-up-fill"></i>
                <p>Drop images here or click to browse</p>
            </div>
        `;
        dragOverlay.style.display = 'none';
        container.appendChild(dragOverlay);

        // Drag events for the container
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
            // Only hide if leaving the container completely
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
                // Update the file input with dropped files
                field.files = files;
                
                // Trigger validation and preview
                this.validate(fieldId);
                this.updateImagePreview(fieldId, files);
            }
        });
    }

    /**
     * Update image preview when files are selected
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

        // Create preview container
        previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview-container mt-2';
        previewContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <small class="text-muted">Image Previews:</small>
                <button type="button" class="btn btn-sm btn-outline-danger clear-all-btn">
                    <i class="bi bi-trash"></i> Clear All
                </button>
            </div>
        `;

        const previewGrid = document.createElement('div');
        previewGrid.className = 'row g-2';

        // Store files array for manipulation
        this.currentFiles = Array.from(files);

        this.currentFiles.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                this.createImagePreviewCard(file, index, previewGrid, fieldId);
            }
        });

        previewContainer.appendChild(previewGrid);
        field.parentElement.appendChild(previewContainer);

        // Handle clear all button
        const clearAllBtn = previewContainer.querySelector('.clear-all-btn');
        clearAllBtn.addEventListener('click', () => {
            this.clearAllImages(fieldId);
        });
    }

    /**
     * Create individual image preview card
     * @param {File} file - The image file
     * @param {number} index - File index
     * @param {HTMLElement} container - Container to append to
     * @param {string} fieldId - The field ID
     */
    createImagePreviewCard(file, index, container, fieldId) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewCol = document.createElement('div');
            previewCol.className = 'col-6 col-md-4 col-lg-3';
            previewCol.dataset.fileIndex = index;
            const field = document.getElementById(fieldId);
            
            const fileSizeKB = (file.size / 1024).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const displaySize = file.size < 1024 * 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`;
            const maxSize = field?.dataset.maxSize ? parseInt(field.dataset.maxSize) : (config.maxSize || (5 * 1024 * 1024));
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            const maxSizeExceeded = file.size > maxSize;
            previewCol.innerHTML = `
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

            container.appendChild(previewCol);

            // Handle individual image removal
            const removeBtn = previewCol.querySelector('.remove-image-btn');
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeImage(fieldId, index);
            });

            // Handle image click for full-size view
            const img = previewCol.querySelector('img');
            img.addEventListener('click', () => {
                this.showImageModal(e.target.result, file.name);
            });
        };
        reader.readAsDataURL(file);
    }

    /**
     * Remove individual image from selection
     * @param {string} fieldId - The field ID
     * @param {number} index - Index of file to remove
     */
    removeImage(fieldId, index) {
        const field = document.getElementById(fieldId);
        if (!field || !this.currentFiles) return;

        // Remove file from array
        this.currentFiles.splice(index, 1);

        // Create new FileList (DataTransfer is needed for this)
        const dt = new DataTransfer();
        this.currentFiles.forEach(file => dt.items.add(file));
        field.files = dt.files;

        // Update preview and revalidate
        this.updateImagePreview(fieldId, field.files);
        this.validate(fieldId);
    }

    /**
     * Clear all selected images
     * @param {string} fieldId - The field ID
     */
    clearAllImages(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Clear the file input
        field.value = '';
        this.currentFiles = [];

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
}
