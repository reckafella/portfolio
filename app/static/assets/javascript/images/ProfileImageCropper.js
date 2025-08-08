import { ImageCropManager } from './ImageCropManager.js';

/**
 * ProfileImageCropper - Specialized image cropper for profile pictures
 * Extends ImageCropManager with profile-specific functionality
 * @class ProfileImageCropper
 * @extends ImageCropManager
 */
export class ProfileImageCropper extends ImageCropManager {
    constructor(options = {}) {
        // Profile-specific default options
        const profileDefaults = {
            aspectRatio: 1, // Square aspect ratio for profile pictures
            circular: true,
            minSize: { width: 500, height: 500 },
            outputSize: { width: 500, height: 500 },
            uploadFieldName: 'profile_pic',
            formType: 'profile',
            enableRotation: true,
            enableZoom: true,
            enableMove: true,
            showPreview: true,
            
            // Profile-specific callbacks
            onUploadSuccess: (data, instance) => {
                instance.showAlert('Profile image updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        };

        // Merge profile defaults with user options
        const mergedOptions = Object.assign({}, profileDefaults, options);
        
        super(mergedOptions);
        
        // Setup profile-specific functionality
        this.setupProfileDeletion();
    }

    /**
     * Setup profile picture deletion functionality
     */
    setupProfileDeletion() {
        // Wait for DOM to be ready
        const setupDeletion = () => {
            const deleteButton = document.getElementById('confirmDeleteProfilePicBtn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => this.confirmDeleteProfilePic());
            }

            const deleteModalButton = document.getElementById('deleteProfilePicBtn');
            if (deleteModalButton) {
                deleteModalButton.addEventListener('click', () => this.deleteProfilePic());
            }

            // Ensure cancel button works properly
            const cancelButton = document.querySelector('#deleteConfirmModal button[data-bs-dismiss="modal"]');
            if (cancelButton) {
                cancelButton.addEventListener('click', (e) => {
                    // Ensure the modal closes even if other handlers interfere
                    e.preventDefault();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                    if (modal) {
                        modal.hide();
                    }
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupDeletion);
        } else {
            setupDeletion();
        }
    }

    /**
     * Show confirmation modal for profile picture deletion
     */
    confirmDeleteProfilePic() {
        const deleteModal = document.getElementById('deleteConfirmModal');
        if (deleteModal) {
            const modal = new bootstrap.Modal(deleteModal);
            modal.show();
        } else {
            console.error('Delete confirmation modal not found');
        }
    }

    /**
     * Delete the current profile picture
     */
    async deleteProfilePic() {
        const deleteBtn = document.getElementById('deleteProfilePicBtn');
        if (!deleteBtn) return;

        // Show loading state
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Deleting...';
        deleteBtn.disabled = true;

        try {
            const csrfToken = this.getCSRFToken();
            
            const response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: 'delete_profile_pic=true'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showAlert('Profile picture deleted successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                throw new Error(data.error || 'Failed to delete profile picture');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert(error.message || 'An error occurred while deleting the profile picture.', 'danger');
        } finally {
            // Restore button state
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;

            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            if (modal) {
                setTimeout(() => modal.hide(), 1000);
            }
        }
    }

    /**
     * Open the crop modal
     */
    openModal() {
        const modal = document.getElementById(this.options.modalId);
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
            this.resetModal();
        } else {
            console.error('Image crop modal not found');
        }
    }
}

// Create and export global instance for profile image cropping
export const profileImageCropper = new ProfileImageCropper();

// Global functions for HTML onclick handlers
window.openImageCropModal = () => profileImageCropper.openModal();
window.clearSelectedFile = () => profileImageCropper.clearSelectedFile();
window.cropAndUpload = () => profileImageCropper.cropAndUpload();
window.rotateImage = (degrees) => profileImageCropper.rotate(degrees);
window.moveImage = (x, y) => profileImageCropper.move(x, y);
window.zoomImage = (ratio) => profileImageCropper.zoom(ratio);
window.resetCropper = () => profileImageCropper.reset();
window.confirmDeleteProfilePic = () => profileImageCropper.confirmDeleteProfilePic();
window.deleteProfilePic = () => profileImageCropper.deleteProfilePic();

// Export for module usage
export default profileImageCropper;
