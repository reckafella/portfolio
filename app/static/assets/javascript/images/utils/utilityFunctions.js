/**
 * Utility helper class for common image operations
 */
export class ImageUtils {
    /**
     * Format file size into human-readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} - Formatted size string
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show an alert message in the modal or page
     * @param {string} message - Message to display
     * @param {string} type - Alert type (success, danger, warning, etc.)
     * @param {Object} options - Additional options
     */
    static showAlert(message, type, options = {}) {
        // Use ToastManager if available, otherwise fallback to custom alert
        if (window.toastManager && typeof window.toastManager.show === 'function') {
            window.toastManager.show(type, message);
            return;
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

        // Auto-dismiss after 5 seconds or specified duration
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, options.duration || 5000);
    }
    
    /**
     * Validate that an image meets minimum dimensions
     * @param {HTMLImageElement} image - The image element to validate
     * @param {Object} minDimensions - Minimum width and height
     * @returns {boolean} - Whether image is valid
     */
    static validateImageDimensions(image, minDimensions = { width: 500, height: 500 }) {
        return image.naturalWidth >= minDimensions.width && 
               image.naturalHeight >= minDimensions.height;
    }
    
    /**
     * Create an object URL from a Blob/File
     * @param {Blob|File} blob - The blob or file
     * @returns {string} - Object URL
     */
    static createObjectURL(blob) {
        return URL.createObjectURL(blob);
    }
    
    /**
     * Revoke an object URL to free up memory
     * @param {string} url - The object URL to revoke
     */
    static revokeObjectURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
}
