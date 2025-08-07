import { ToastManager } from "../../../js/toast.js";
/**
 * CropImageEssentials provides essential methods that are inherited by child class ImageCropper
 * @class CropImageEssentials
 */
export class CropImageEssentials {
    /**
     * @param {Object} options - config options
    */
    constructor(options = {}) {
        this.options = Object.assign({
            modalId: 'imageCropModal',
            cropImageId: 'cropImage',
            previewId: 'cropPreview',
            fileInputId: 'imageFileInput',
            cropButtonId: 'cropAndUpload',
            uploadEndpoint: window.location.href,
            aspectRatio: 1, // 1:1 for profile pictures
            circular: true,
            minSize: { width: 500, height: 500 },
            maxSize: 20 * 1024 * 1024 // 20MB
        }, options);
        
        this.cropper = null;
        this.selectedFile = null;
        this.previewUpdateTimeout = null;
        this.isMobile = this.detectMobile();
        
        // Try to use the global ToastManager if available, otherwise create one
        try {
            this.toastManager = window.toastManager || new ToastManager();
        } catch (error) {
            console.warn('ToastManager initialization failed, using fallback alerts', error);
            this.toastManager = null;
        }

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0);
    }

    openModal() {
        const openModalBtn = document.getElementById('openImageCropModalBtn')
        openModalBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
            modal.show();
            this.resetModal();
        })
        
    }

    resetModal() {
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('cropSection').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('cropAndUpload').disabled = true;
        this.clearSelectedFile();
    }

    addMobileControls() {
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

        const previewContainer = document.querySelector('#cropSection .col-md-4');
        if (previewContainer) {
            previewContainer.appendChild(controls);
        }
    }

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

    showAlert(message, type, options = {}) {
        if (window.toastManager && typeof window.toastManager.show === 'function') {
            window.toastManager.show(type, message);
            return;
        }

        if (type === 'success') {
            console.log(`Success: ${message}`);
        } else {
            console.log(`Failed: ${message}`);
        }

        // Create alert element as fallback
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at the top of the modal body or main content
        const modalBody = document.querySelector('#imageCropModal .modal-body, #deleteConfirmModal .modal-body');
        if (modalBody) {
            modalBody.insertBefore(alertDiv, modalBody.firstChild);
        } else {
            // Fallback: insert at top of main content
            const mainContent = document.querySelector('.section.profile');
            if (mainContent) {
                mainContent.insertBefore(alertDiv, mainContent.firstChild);
            }
        }

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, options.duration || 5000);
    }

    throttledPreviewUpdate() {
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }

        this.previewUpdateTimeout = setTimeout(() => {
            this.updatePreview();
        }, 50);
    }

    updatePreview() {
        if (!this.cropper) return;

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: 200,
                height: 200,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) {
                //toastManager.show('warning', 'Failed to get cropped canvas');
                return;
            }

            const preview = document.getElementById('cropPreview');
            if (preview) {
                preview.innerHTML = '';

                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.maxWidth = '200px';
                canvas.style.maxHeight = '200px';
                canvas.style.borderRadius = '50%';
                canvas.style.border = '2px solid #dee2e6';
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto';

                preview.appendChild(canvas);

            }
        } catch (error) {
            //toastManager.show('error', 'Preview update failed: ' + error);
            const preview = document.getElementById('cropPreview');
            if (preview) {
                preview.innerHTML = '<div class="text-muted text-center p-3">Preview error</div>';
            }
        }
        this.showAlert('update preview called', 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        this.showAlert('formatfilesize called', 'success');
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    destroyCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
            this.previewUpdateTimeout = null;
        }
        this.showAlert('destroycropper called', 'success');
    }

    clearSelectedFile() {
        this.selectedFile = null;
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        document.getElementById('fileInfo').style.display = 'none';

        this.destroyCropper();

        const cropImage = document.getElementById('cropImage');
        if (cropImage) {
            cropImage.src = '';
            cropImage.onload = null;
            // Ensure image is visible again for the next upload.
            cropImage.style.display = 'block';
        }

        const preview = document.getElementById('cropPreview');
        if (preview) {
            preview.innerHTML = '';
        }

        const controlsContainer = document.querySelector('.mobile-crop-controls');
        if (controlsContainer) {
            controlsContainer.remove();
        }
        this.showAlert('ClearSelectedFile Called', 'success');
    }

    handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showAlert('Please select a valid image file.', 'danger');
            return;
        }

        // Validate file size (20MB)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showAlert('File size must be less than 20MB.', 'danger');
            return;
        }

        this.selectedFile = file;

        // Show file info
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('fileInfo').style.display = 'block';

        // Load and validate image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Check minimum dimensions
                if (img.width < 500 || img.height < 500) {
                    this.showAlert(`Image must be at least 500x500 pixels. This image is ${img.width}x${img.height} pixels.`, 'danger');
                    this.clearSelectedFile();
                    return;
                }

                this.initializeCropper(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        this.showAlert('HandleFileSelect Called', 'success');
    }

    initializeCropper(imageSrc) {
        document.getElementById('fileUploadSection').style.display = 'none';
        document.getElementById('cropSection').style.display = 'block';

        const cropImage = document.getElementById('cropImage');

        // Make sure the image is visible for cropper initialization
        cropImage.style.display = 'block';

        // Destroy existing cropper
        this.destroyCropper();

        // Set image and initialize cropper when loaded
        cropImage.onload = () => {
            this.cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                guides: true,
                center: true,
                highlight: true,
                background: true,
                autoCrop: true,
                autoCropArea: 0.8,
                dragMode: 'move',
                responsive: true,
                zoomable: true,
                zoomOnTouch: this.isMobile,
                zoomOnWheel: !this.isMobile,
                wheelZoomRatio: 0.1,
                container: document.getElementById('image-crop-container'),
                movable: true,
                rotatable: true,

                ready: () => {
                    // cropImage.style.display = 'none';

                    document.querySelector('.cropper-crop-box').style.visibility = 'hidden';
                    document.querySelector('.cropper-wrap-box').style.visibility = 'hidden';
                    document.getElementById('cropAndUpload').disabled = false;

                    this.updatePreview();

                    if (this.isMobile) {
                        this.addMobileControls();
                    }
                    this.addTouchSupport();
                },

                crop: () => {
                    this.throttledPreviewUpdate();
                },

                zoom: () => {
                    this.throttledPreviewUpdate();
                }
            });
        };

        cropImage.src = imageSrc;
        this.showAlert('initialize cropper called', 'success');
    }
}
