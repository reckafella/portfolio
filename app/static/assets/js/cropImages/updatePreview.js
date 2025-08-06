/**
 * Class that handles updating the image preview in the cropping interface
 */
export class PreviewUpdater {
    /**
     * @param {Cropper} cropper - The Cropper.js instance
     * @param {string} previewElementId - The ID of the preview container element
     * @param {Object} options - Configuration options
     */
    constructor(cropper, previewElementId = 'cropPreview', options = {}) {
        this.cropper = cropper;
        this.previewElementId = previewElementId;
        this.options = Object.assign({
            width: 150,
            height: 150,
            circular: true,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            fillColor: '#fff'
        }, options);
    }
    
    /**
     * Updates the preview with the current cropped image
     */
    update() {
        if (!this.cropper) {
            console.warn('Cropper not initialized');
            return;
        }
        
        try {
            // Get the cropped canvas
            const canvas = this.cropper.getCroppedCanvas({
                width: this.options.width,
                height: this.options.height,
                imageSmoothingEnabled: this.options.imageSmoothingEnabled,
                imageSmoothingQuality: this.options.imageSmoothingQuality,
                fillColor: this.options.fillColor
            });
            
            if (!canvas) {
                console.warn('Failed to get cropped canvas');
                return;
            }
            
            const preview = document.getElementById(this.previewElementId);
            if (preview) {
                // Clear existing preview
                preview.innerHTML = '';
                
                // Style the canvas based on options
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.maxWidth = `${this.options.width}px`;
                canvas.style.maxHeight = `${this.options.height}px`;
                
                if (this.options.circular) {
                    canvas.style.borderRadius = '50%';
                }
                
                canvas.style.border = '2px solid #dee2e6';
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto';
                
                // Add the canvas to preview
                preview.appendChild(canvas);
            }
        } catch (error) {
            console.error('Preview update failed:', error);
            // Fallback: show a placeholder or error message
            const preview = document.getElementById(this.previewElementId);
            if (preview) {
                preview.innerHTML = '<div class="text-muted text-center p-3">Preview unavailable</div>';
            }
        }
    }
}
