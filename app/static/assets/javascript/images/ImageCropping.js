import { CropImageEssentials } from "./utils/CropImageEssentials.js";

/**
 * Main image cropper class that manages the cropping interface and functionality
 */
export class ImageCropper extends CropImageEssentials {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
        this.showAlert('Init called.', 'success');
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
        this.showAlert('Setup Events called', 'success');
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
    const deleteConfirmModalBtn = document.getElementById('deleteConfirmModalBtn')
    if (deleteConfirmModalBtn) {
        deleteConfirmModalBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            modal.show();
        })
    }
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
