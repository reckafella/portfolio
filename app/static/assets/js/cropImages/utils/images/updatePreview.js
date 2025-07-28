// Enhanced preview update function
export function updatePreview() {
    if (!cropper) {
        console.warn('Cropper not initialized');
        return;
    }
    
    try {
        // Get the cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: 150,
            height: 150,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            fillColor: '#fff'
        });
        
        if (!canvas) {
            console.warn('Failed to get cropped canvas');
            return;
        }
        
        const preview = document.getElementById('cropPreview');
        if (preview) {
            // Clear existing preview
            preview.innerHTML = '';
            
            // Style the canvas for circular preview
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.maxWidth = '150px';
            canvas.style.maxHeight = '150px';
            canvas.style.borderRadius = '50%';
            canvas.style.border = '2px solid #dee2e6';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            
            // Add the canvas to preview
            preview.appendChild(canvas);
        }
    } catch (error) {
        console.error('Preview update failed:', error);
        // Fallback: show a placeholder or error message
        const preview = document.getElementById('cropPreview');
        if (preview) {
            preview.innerHTML = '<div class="text-muted text-center p-3">Preview unavailable</div>';
        }
    }
}
