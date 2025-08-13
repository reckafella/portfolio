/**
 * ImageCropManager - A comprehensive, reusable image cropping system
 * Provides a complete interface for image selection, cropping, and uploading
 * @class ImageCropManager
 */
export class ImageCropManager {
    /**
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = this.mergeOptions(options);
        this.cropper = null;
        this.selectedFile = null;
        this.previewUpdateTimeout = null;
        this.isMobile = this.detectMobile();
        this.isInitialized = false;
        
        // Initialize toast manager
        this.toastManager = window.toastManager || null;

        // Auto-initialize if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Merge user options with defaults
     * @param {Object} userOptions - User provided options
     * @returns {Object} Merged options
     */
    mergeOptions(userOptions) {
        const defaults = {
            // Modal configuration
            modalId: 'imageCropModal', cropImageId: 'cropImage', previewId: 'cropPreview',
            fileInputId: 'imageFileInput', cropButtonId: 'cropAndUpload', uploadSectionId: 'fileUploadSection',
            cropSectionId: 'cropSection', fileInfoId: 'fileInfo', fileNameId: 'fileName', fileSizeId: 'fileSize',

            // Cropping configuration
            // 1:1 for profile pictures
            aspectRatio: 1, circular: true, minSize: { width: 500, height: 500 },
            maxSize: 20 * 1024 * 1024, maxDimensions: { width: 2000, height: 2000 }, // Maximum pixel dimensions
            quality: 0.9, outputSize: { width: 1000, height: 1000 }, // Higher output resolution

            // Upload configuration
            uploadEndpoint: window.location.href, uploadFieldName: 'profile_pic', formType: 'profile', csrfTokenName: 'csrfmiddlewaretoken',

            // UI configuration
            enableRotation: true, enableZoom: true, enableMove: true, enableMobileControls: true, showPreview: false,
            // Event callbacks
            onInit: null, onFileSelect: null, onCropStart: null, onCropEnd: null,
            onUploadSuccess: null, onUploadError: null, onDestroy: null, onUploadStart: null
        };

        return Object.assign({}, defaults, userOptions);
    }

    /**
     * Initialize the cropping system
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.setupDragAndDrop();
            this.isInitialized = true;
            
            // Call init callback
            if (typeof this.options.onInit === 'function') {
                this.options.onInit(this);
            }
            
        } catch (error) {
            console.error('Failed to initialize ImageCropManager:', error);
            this.showAlert('Failed to initialize image cropping system.', 'danger');
        }
    }

    /**
     * Detect if device is mobile/touch enabled
     * @returns {boolean}
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    /**
     * Setup event listeners for file input and buttons
     */
    setupEventListeners() {
        // File input change handler
        const fileInput = document.getElementById(this.options.fileInputId);
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileSelect(file);
                }
            });
        }

        // Setup modal trigger if not already handled
        this.setupModalTrigger();
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const dropZone = document.querySelector('.file-drop-zone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    /**
     * Setup modal trigger functionality
     */
    setupModalTrigger() {
        const modal = document.getElementById(this.options.modalId);
        if (!modal) return;

        modal.addEventListener('show.bs.modal', () => {
            this.resetModal();
        });

        modal.addEventListener('hidden.bs.modal', () => {
            this.clearSelectedFile();
            this.showHiddenImages();
        });
    }

    /**
     * Reset modal to initial state
     */
    resetModal() {
        const uploadSection = document.getElementById(this.options.uploadSectionId);
        const cropSection = document.getElementById(this.options.cropSectionId);
        const fileInfo = document.getElementById(this.options.fileInfoId);
        const cropButton = document.getElementById(this.options.cropButtonId);

        if (uploadSection) uploadSection.style.display = 'block';
        if (cropSection) cropSection.style.display = 'none';
        if (fileInfo) fileInfo.style.display = 'none';
        if (cropButton) cropButton.disabled = true;

        this.clearSelectedFile();
    }

    /**
     * Handle file selection and validation
     * @param {File} file - Selected file
     */
    handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showAlert('Please select a valid image file.', 'danger');
            return;
        }

        // Validate file size
        if (file.size > this.options.maxSize) {
            const maxSizeMB = (this.options.maxSize / (1024 * 1024)).toFixed(1);
            this.showAlert(`File size must be less than ${maxSizeMB}MB.`, 'danger');
            return;
        }

        this.selectedFile = file;

        // Show file info
        this.displayFileInfo(file);

        // Load and validate image dimensions
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Check minimum dimensions
                if (img.width < this.options.minSize.width || img.height < this.options.minSize.height) {
                    this.showAlert(
                        `Image must be at least ${this.options.minSize.width}x${this.options.minSize.height} pixels. ` +
                        `This image is ${img.width}x${img.height} pixels.`,
                        'danger'
                    );
                    this.clearSelectedFile();
                    return;
                }

                // Check maximum dimensions
                if (img.width > this.options.maxDimensions.width || img.height > this.options.maxDimensions.height) {
                    this.showAlert(
                        `Image must not exceed ${this.options.maxDimensions.width}x${this.options.maxDimensions.height} pixels. ` +
                        `This image is ${img.width}x${img.height} pixels.`,
                        'danger'
                    );
                    this.clearSelectedFile();
                    return;
                }

                // Initialize cropper
                this.initializeCropper(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Call file select callback
        if (typeof this.options.onFileSelect === 'function') {
            this.options.onFileSelect(file, this);
        }
    }

    /**
     * Display file information
     * @param {File} file - Selected file
     */
    displayFileInfo(file) {
        const fileNameElement = document.getElementById(this.options.fileNameId);
        const fileSizeElement = document.getElementById(this.options.fileSizeId);
        const fileInfoElement = document.getElementById(this.options.fileInfoId);

        if (fileNameElement) fileNameElement.textContent = file.name;
        if (fileSizeElement) fileSizeElement.textContent = this.formatFileSize(file.size);
        if (fileInfoElement) fileInfoElement.style.display = 'block';
    }

    /**
     * Initialize the cropper with enhanced configuration
     * @param {string} imageSrc - Image data URL
     */
    initializeCropper(imageSrc) {
        const uploadSection = document.getElementById(this.options.uploadSectionId);
        const cropSection = document.getElementById(this.options.cropSectionId);
        const cropImage = document.getElementById(this.options.cropImageId);
        const cropButton = document.getElementById(this.options.cropButtonId);

        if (uploadSection) uploadSection.style.display = 'none';
        if (cropSection) cropSection.style.display = 'block';

        if (!cropImage) {
            this.showAlert('Crop image element not found.', 'danger');
            return;
        }

        // Destroy existing cropper
        this.destroyCropper();

        // Ensure image is properly reset
        cropImage.style.display = 'block';
        cropImage.style.maxWidth = '100%';
        cropImage.style.height = 'auto';

        // Set image source and initialize cropper when loaded
        cropImage.onload = () => {
            this.cropper = new Cropper(cropImage, {
                aspectRatio: this.options.aspectRatio,
                viewMode: 1,
                guides: true,
                center: true,
                highlight: true,
                background: true,
                autoCrop: true,
                autoCropArea: 0.8,
                dragMode: 'move',
                responsive: true,
                zoomable: this.options.enableZoom,
                zoomOnTouch: this.isMobile && this.options.enableZoom,
                zoomOnWheel: !this.isMobile && this.options.enableZoom,
                wheelZoomRatio: 0.1,
                movable: this.options.enableMove,
                rotatable: this.options.enableRotation,
                
                // Cropper container configuration
                container: '.image-crop-container',
                /* modal: true,
                preview: this.options.showPreview ? `#${this.options.previewId}` : '', */

                ready: () => {
                    if (cropButton) cropButton.disabled = false;

                    // Hide any duplicate images that may appear outside the cropper
                    this.hideDuplicateImages();

                    // Initial preview update
                    if (this.options.showPreview) {
                        this.updatePreview();
                    }

                    // Add mobile controls if enabled and needed
                    if (this.isMobile && this.options.enableMobileControls) {
                        this.addMobileControls();
                    }

                    // Add touch support
                    this.addTouchSupport();

                    // Call crop start callback
                    if (typeof this.options.onCropStart === 'function') {
                        this.options.onCropStart(this);
                    }
                },

                crop: () => {
                    if (this.options.showPreview) {
                        this.throttledPreviewUpdate();
                    }
                },

                zoom: () => {
                    if (this.options.showPreview) {
                        this.throttledPreviewUpdate();
                    }
                }
            });
        };

        cropImage.src = imageSrc;
    }

    /**
     * Hide duplicate images that may appear outside the cropper modal
     */
    hideDuplicateImages() {
        // Hide any images outside the modal that might be getting rotated
        const modalElement = document.getElementById(this.options.modalId);
        if (!modalElement) return;

        // Find all images outside the modal that match the crop image source
        const cropImage = document.getElementById(this.options.cropImageId);
        if (!cropImage) return;

        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            // Skip if image is inside the modal
            if (modalElement.contains(img)) return;

            // If image has the same source as the crop image, hide it temporarily
            if (img.src === cropImage.src && img !== cropImage) {
                img.style.visibility = 'hidden';
                img.dataset.hiddenByCropper = 'true';
            }
        });
    }

    /**
     * Show images that were hidden during cropping
     */
    showHiddenImages() {
        const hiddenImages = document.querySelectorAll('[data-hidden-by-cropper="true"]');
        hiddenImages.forEach(img => {
            img.style.visibility = 'visible';
            delete img.dataset.hiddenByCropper;
        });
    }

    /**
     * Add mobile-specific controls
     */
    addMobileControls() {
        // Remove existing controls
        const existingControls = document.querySelector('.mobile-crop-controls');
        if (existingControls) {
            existingControls.remove();
        }

        const controls = document.createElement('div');
        controls.className = 'mobile-crop-controls mt-3 text-center';
        controls.innerHTML = `
            <div class="btn-group mb-2" role="group">
                <button type="button" class="btn btn-sm btn-outline-secondary zoom-out-btn">
                    <i class="bi bi-zoom-out"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary reset-btn">
                    <i class="bi bi-arrows-move"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary zoom-in-btn">
                    <i class="bi bi-zoom-in"></i>
                </button>
            </div>
        `;

        // Add event listeners
        controls.querySelector('.zoom-out-btn').addEventListener('click', () => this.zoom(-0.1));
        controls.querySelector('.zoom-in-btn').addEventListener('click', () => this.zoom(0.1));
        controls.querySelector('.reset-btn').addEventListener('click', () => this.reset());

        const previewContainer = document.querySelector(`#${this.options.cropSectionId} .col-md-5, #${this.options.cropSectionId} .col-md-4`);
        if (previewContainer) {
            previewContainer.appendChild(controls);
        }
    }

    /**
     * Add enhanced touch support for mobile devices
     */
    addTouchSupport() {
        const cropContainer = document.querySelector('.cropper-container');
        if (!cropContainer || !this.cropper) return;

        let startDistance = 0;
        let isZooming = false;

        cropContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                isZooming = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                startDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            }
        }, { passive: false });

        cropContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && isZooming && this.cropper) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );

                if (startDistance > 0) {
                    const ratio = currentDistance / startDistance;
                    const zoomRatio = (ratio - 1) * 0.3;
                    this.cropper.zoom(zoomRatio);
                    startDistance = currentDistance;
                }
            }
        }, { passive: false });

        cropContainer.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                isZooming = false;
                startDistance = 0;
            }
        });
    }

    /**
     * Throttled preview update for better performance
     */
    throttledPreviewUpdate() {
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }

        this.previewUpdateTimeout = setTimeout(() => {
            this.updatePreview();
        }, 50);
    }

    /**
     * Update the crop preview
     */
    updatePreview() {
        if (!this.cropper || !this.options.showPreview) return;

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: 200,
                height: 200,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) return;

            const preview = document.getElementById(this.options.previewId);
            if (preview) {
                preview.innerHTML = '';
                const previewImage = document.createElement('img');
                previewImage.src = canvas.toDataURL();
                previewImage.className = 'img-fluid rounded-circle';
                previewImage.style.maxWidth = '200px';
                previewImage.style.maxHeight = '200px';
                preview.appendChild(previewImage);
            }
        } catch (error) {
            console.warn('Preview update failed:', error);
        }
    }

    /**
     * Crop and upload the image
     */
    async cropAndUpload() {
        if (!this.cropper || !this.selectedFile) {
            this.showAlert('No image selected or cropper not initialized.', 'danger');
            return;
        }

        // Call upload start callback
        if (typeof this.options.onUploadStart === 'function') {
            this.options.onUploadStart(this);
        }

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: this.options.outputSize.width,
                height: this.options.outputSize.height,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) {
                this.showAlert('Failed to process the image. Please try again.', 'danger');
                return;
            }

            // Convert canvas to blob
            const blob = await this.canvasToBlob(canvas);
            if (!blob) {
                this.showAlert('Failed to create image blob. Please try again.', 'danger');
                return;
            }

            await this.uploadImage(blob);
        } catch (error) {
            console.error('Crop and upload error:', error);
            this.showAlert('Failed to process the image. Please try again.', 'danger');
            
            // Call upload error callback
            if (typeof this.options.onUploadError === 'function') {
                this.options.onUploadError(error, this);
            }
        }
    }

    /**
     * Convert canvas to blob using Promise
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Promise<Blob>}
     */
    canvasToBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', this.options.quality);
        });
    }

    /**
     * Upload the cropped image
     * @param {Blob} blob - Image blob to upload
     */
    async uploadImage(blob) {
        const formData = new FormData();
        formData.append(this.options.uploadFieldName, blob, 'cropped_image.jpg');
        formData.append('form_type', this.options.formType);

        // Add CSRF token
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            formData.append(this.options.csrfTokenName, csrfToken);
        }

        // Show loading state
        const uploadBtn = document.getElementById(this.options.cropButtonId);
        const originalText = uploadBtn ? uploadBtn.innerHTML : '';
        if (uploadBtn) {
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Uploading...';
            uploadBtn.disabled = true;
        }

        try {
            const response = await fetch(this.options.uploadEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showAlert('Image uploaded successfully!', 'success');
                
                // Call success callback
                if (typeof this.options.onUploadSuccess === 'function') {
                    this.options.onUploadSuccess(data, this);
                } else {
                    // Default behavior: reload page
                    setTimeout(() => location.reload(), 1500);
                }
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showAlert(error.message || 'An error occurred while uploading the image.', 'danger');
            
            // Call upload error callback
            if (typeof this.options.onUploadError === 'function') {
                this.options.onUploadError(error, this);
            }
        } finally {
            // Restore button state
            if (uploadBtn) {
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
            }

            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById(this.options.modalId));
            if (modal) {
                setTimeout(() => modal.hide(), 1000);
            }
        }
    }

    /**
     * Get CSRF token from various sources
     * @returns {string|null}
     */
    getCSRFToken() {
        return document.querySelector(`[name=${this.options.csrfTokenName}]`)?.value ||
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
               null;
    }

    /**
     * Clear selected file and reset state
     */
    clearSelectedFile() {
        this.selectedFile = null;
        
        const fileInput = document.getElementById(this.options.fileInputId);
        const fileInfo = document.getElementById(this.options.fileInfoId);
        
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';

        this.destroyCropper();

        const cropImage = document.getElementById(this.options.cropImageId);
        if (cropImage) {
            cropImage.src = '';
            cropImage.onload = null;
        }

        const preview = document.getElementById(this.options.previewId);
        if (preview) {
            preview.innerHTML = '';
        }

        // Remove mobile controls
        const controlsContainer = document.querySelector('.mobile-crop-controls');
        if (controlsContainer) {
            controlsContainer.remove();
        }
    }

    /**
     * Destroy the cropper instance
     */
    destroyCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
            this.previewUpdateTimeout = null;
        }
    }

    /**
     * Rotate the image
     * @param {number} degrees - Rotation degrees
     */
    rotate(degrees) {
        if (this.cropper && this.options.enableRotation) {
            this.cropper.rotate(degrees);
            if (this.options.showPreview) {
                setTimeout(() => this.updatePreview(), 100);
            }
        }
    }

    /**
     * Move the image
     * @param {number} offsetX - Horizontal offset
     * @param {number} offsetY - Vertical offset
     */
    move(offsetX, offsetY) {
        if (this.cropper && this.options.enableMove) {
            this.cropper.move(offsetX, offsetY);
        }
    }

    /**
     * Zoom the image
     * @param {number} ratio - Zoom ratio
     */
    zoom(ratio) {
        if (this.cropper && this.options.enableZoom) {
            this.cropper.zoom(ratio);
        }
    }

    /**
     * Reset the cropper
     */
    reset() {
        if (this.cropper) {
            this.cropper.reset();
            if (this.options.showPreview) {
                setTimeout(() => this.updatePreview(), 100);
            }
        }
    }

    /**
     * Format file size to human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, danger, warning, info)
     */
    showAlert(message, type = 'info') {
        if (this.toastManager && typeof this.toastManager.show === 'function') {
            this.toastManager.show(type, message);
            return;
        }

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert alert
        const modalBody = document.querySelector(`#${this.options.modalId} .modal-body`);
        const alertContainer = document.getElementById('alert-container') || modalBody;
        
        if (alertContainer) {
            alertContainer.insertBefore(alertDiv, alertContainer.firstChild);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * Destroy the cropping system
     */
    destroy() {
        this.destroyCropper();
        this.clearSelectedFile();
        this.isInitialized = false;
        
        // Call destroy callback
        if (typeof this.options.onDestroy === 'function') {
            this.options.onDestroy(this);
        }
    }
}
