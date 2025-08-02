/**
 * Class for managing modals related to image operations
 */
export class ModalManager {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.modalId - The ID of the modal element
     * @param {Function} options.clearSelectedFile - Function to clear selected file
     */
    constructor(options = {}) {
        this.options = Object.assign({
            modalId: 'imageCropModal',
            clearSelectedFile: null
        }, options);
        
        this.modal = null;
    }
    
    /**
     * Initialize the modal
     */
    init() {
        const modalElement = document.getElementById(this.options.modalId);
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement);
        }
    }
    
    /**
     * Reset modal to initial state
     */
    resetModal() {
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('cropSection').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('cropAndUpload').disabled = true;
        
        if (typeof this.options.clearSelectedFile === 'function') {
            this.options.clearSelectedFile();
        }
    }
    
    /**
     * Open image crop modal
     */
    openModal() {
        if (!this.modal) {
            this.init();
        }
        
        if (this.modal) {
            this.modal.show();
            this.resetModal();
        } else {
            console.error(`Modal with ID '${this.options.modalId}' not found`);
        }
    }
    
    /**
     * Close the modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.hide();
        }
    }
}
