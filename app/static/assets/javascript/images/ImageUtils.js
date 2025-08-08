/**
 * ImageUtils - Utility functions for image processing and validation
 */
export class ImageUtils {
    /**
     * Validate image file
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateImageFile(file, options = {}) {
        const defaults = {
            maxSize: 20 * 1024 * 1024, // 20MB
            minWidth: 500,
            minHeight: 500,
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        };
        
        const config = Object.assign({}, defaults, options);
        const errors = [];

        // Check if file exists
        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }

        // Check file type
        if (!config.allowedTypes.includes(file.type)) {
            errors.push(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`);
        }

        // Check file size
        if (file.size > config.maxSize) {
            const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
            errors.push(`File size too large. Maximum size: ${maxSizeMB}MB`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate image dimensions
     * @param {HTMLImageElement} img - Image element
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateImageDimensions(img, options = {}) {
        const defaults = {
            minWidth: 500,
            minHeight: 500,
            maxWidth: 10000,
            maxHeight: 10000
        };
        
        const config = Object.assign({}, defaults, options);
        const errors = [];

        if (img.width < config.minWidth || img.height < config.minHeight) {
            errors.push(`Image too small. Minimum size: ${config.minWidth}x${config.minHeight}px. Current: ${img.width}x${img.height}px`);
        }

        if (img.width > config.maxWidth || img.height > config.maxHeight) {
            errors.push(`Image too large. Maximum size: ${config.maxWidth}x${config.maxHeight}px. Current: ${img.width}x${img.height}px`);
        }

        return {
            valid: errors.length === 0,
            errors,
            dimensions: {
                width: img.width,
                height: img.height
            }
        };
    }

    /**
     * Format file size to human readable string
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get image data URL from file
     * @param {File} file - Image file
     * @returns {Promise<string>} Data URL
     */
    static getImageDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Load image from data URL
     * @param {string} dataURL - Image data URL
     * @returns {Promise<HTMLImageElement>} Loaded image element
     */
    static loadImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = dataURL;
        });
    }

    /**
     * Convert canvas to blob
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} quality - Image quality (0-1)
     * @param {string} type - Image type
     * @returns {Promise<Blob>} Image blob
     */
    static canvasToBlob(canvas, quality = 0.9, type = 'image/jpeg') {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, type, quality);
        });
    }

    /**
     * Resize image while maintaining aspect ratio
     * @param {HTMLImageElement} img - Source image
     * @param {Object} targetSize - Target dimensions
     * @returns {HTMLCanvasElement} Resized image canvas
     */
    static resizeImage(img, targetSize) {
        const { width: targetWidth, height: targetHeight } = targetSize;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth = targetWidth;
        let newHeight = targetHeight;

        if (aspectRatio > 1) {
            // Landscape
            newHeight = targetWidth / aspectRatio;
        } else {
            // Portrait or square
            newWidth = targetHeight * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        return canvas;
    }

    /**
     * Compress image
     * @param {HTMLImageElement} img - Source image
     * @param {number} quality - Compression quality (0-1)
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {Promise<Blob>} Compressed image blob
     */
    static async compressImage(img, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
        // Resize if needed
        let canvas;
        if (img.width > maxWidth || img.height > maxHeight) {
            canvas = this.resizeImage(img, { width: maxWidth, height: maxHeight });
        } else {
            canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }

        // Convert to blob with compression
        return this.canvasToBlob(canvas, quality, 'image/jpeg');
    }

    /**
     * Get CSRF token from various sources
     * @param {string} tokenName - CSRF token field name
     * @returns {string|null} CSRF token
     */
    static getCSRFToken(tokenName = 'csrfmiddlewaretoken') {
        return document.querySelector(`[name=${tokenName}]`)?.value ||
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
               document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
               null;
    }

    /**
     * Detect if device is mobile/touch enabled
     * @returns {boolean}
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    /**
     * Create a preview element from canvas
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {Object} options - Preview options
     * @returns {HTMLImageElement} Preview image element
     */
    static createPreview(canvas, options = {}) {
        const defaults = {
            className: 'img-fluid rounded-circle',
            maxWidth: '200px',
            maxHeight: '200px'
        };

        const config = Object.assign({}, defaults, options);
        
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = config.className;
        img.style.maxWidth = config.maxWidth;
        img.style.maxHeight = config.maxHeight;

        return img;
    }

    /**
     * Handle drag and drop events
     * @param {HTMLElement} element - Drop zone element
     * @param {Function} onFileDrop - Callback for file drop
     * @returns {Function} Cleanup function
     */
    static setupDragAndDrop(element, onFileDrop) {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const highlight = () => element.classList.add('dragover');
        const unhighlight = () => element.classList.remove('dragover');

        const handleDrop = (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && typeof onFileDrop === 'function') {
                onFileDrop(files[0]);
            }
        };

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        element.addEventListener('drop', handleDrop, false);

        // Return cleanup function
        return () => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                element.removeEventListener(eventName, preventDefaults, false);
                element.removeEventListener(eventName, highlight, false);
                element.removeEventListener(eventName, unhighlight, false);
                element.removeEventListener(eventName, handleDrop, false);
            });
        };
    }
}

export default ImageUtils;
