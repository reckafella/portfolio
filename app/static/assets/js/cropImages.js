import { ToastManager } from './toast.js';

/**
 * Main image cropper class that manages the cropping interface and functionality
 */
export class ImageCropper {
    /**
     * @param {Object} options - Configuration options
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

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        // File input change handler
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileSelect(file);
                }
            });
        }

        // Drag and drop handlers
        const dropZone = document.querySelector('.file-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }
    }

    openModal() {
        const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
        modal.show();
        this.resetModal();
    }

    resetModal() {
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('cropSection').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('cropAndUpload').disabled = true;
        this.clearSelectedFile();
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

    zoom(ratio) {
        if (this.cropper) {
            this.cropper.zoom(ratio);
        }
    }

    reset() {
        if (this.cropper) {
            this.cropper.reset();
            setTimeout(() => this.updatePreview(), 100);
        }
    }

    rotate(degrees) {
        if (this.cropper) {
            this.cropper.rotate(degrees);
            setTimeout(() => this.updatePreview(), 100);
        }
    }

    move(x, y) {
        if (this.cropper) {
            this.cropper.move(x, y);
            setTimeout(() => this.updatePreview(), 100);
        }
    }



    cropAndUpload() {
        if (!this.cropper || !this.selectedFile) {
            this.showAlert('No image selected or cropper not initialized.', 'danger');
            return;
        }

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) {
                this.showAlert('Failed to process the image. Please try again.', 'danger');
                return;
            }

            canvas.toBlob((blob) => {
                if (!blob) {
                    this.showAlert('Failed to create image blob. Please try again.', 'danger');
                    return;
                }

                this.uploadImage(blob);
            }, 'image/jpeg', 0.9);
        } catch (error) {
            //toastManager.show('error', 'Crop error: ' + error);
            this.showAlert('Failed to process the image. Please try again.', 'danger');
        }
    }

    uploadImage(blob) {
        const formData = new FormData();
        formData.append('profile_pic', blob, 'profile_image.jpg');
        formData.append('form_type', 'profile');

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                         document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        if (csrfToken) {
            formData.append('csrfmiddlewaretoken', csrfToken);
        }

        const uploadBtn = document.getElementById('cropAndUpload');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Uploading...';
        uploadBtn.disabled = true;

        fetch(window.location.href, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert('Profile image updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                this.showAlert(data.error || 'An error occurred while uploading the image.', 'danger');
            }
        })
        .catch(error => {
            //toastManager.show('error', 'Upload error: ' + error);
            this.showAlert('An error occurred while uploading the image. ' + error, 'danger');
        })
        .finally(() => {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
            const modal = bootstrap.Modal.getInstance(document.getElementById('imageCropModal'));
            if (modal) {
                setTimeout(() => {
                    modal.hide();
                }, 1000);
            }
        });
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
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showAlert(message, type) {
        // Simple alert for demonstration. For production, use a more robust notification system.
        //toastManager.show(type, message);
        const alertContainer = document.getElementById('alert-container');
        if(alertContainer) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alertContainer.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 5000);
        }
    }
}

// Initialize the cropper
export const imageCropper = new ImageCropper();

// Global functions for HTML onclick handlers to call class methods
export function openImageCropModal() {
    imageCropper.openModal();
}

export function clearSelectedFile() {
    imageCropper.clearSelectedFile();
}

export function cropAndUpload() {
    imageCropper.cropAndUpload();
}

export function rotateImage(degrees) {
    imageCropper.rotate(degrees);
}

export function moveImage(x, y) {
    imageCropper.move(x, y);
}

export function zoomImage(ratio) {
    imageCropper.zoom(ratio);
}

export function resetCropper() {
    imageCropper.reset();
}


// Delete profile picture functions
export function confirmDeleteProfilePic() {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

export function deleteProfilePic() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                     document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const uploadBtn = document.getElementById('deleteProfilePicBtn');
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Deleting...';
    uploadBtn.disabled = true;



    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'delete_profile_pic=true'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert(data.error || 'An error occurred.');
        }
    })
        .catch(error => {
        errorMessages = error || 'An error occurred while deleting the profile picture.';
        //toastManager.show('error', errorMessages);
    })
        .finally(() => {
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
        // Hide the modal after deletion
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            setTimeout(() => {
                modal.hide();
            }, 1000);
        }
    });
}
