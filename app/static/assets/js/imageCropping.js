/**
 * Entry point for image cropping functionality
 * Re-exports all classes for easy imports
 */

import { ImageCropper } from './cropImages.js';
import { PreviewUpdater } from './cropImages/updatePreview.js';
import { ImageUtils } from './cropImages/utilityFunctions.js';
import { ModalManager } from './cropImages/modals.js';

// Export all classes
export {
    ImageCropper,
    PreviewUpdater,
    ImageUtils,
    ModalManager
};

// Create and export a default instance
export const defaultCropper = new ImageCropper();

// Export for legacy global function support
window.imageCropper = defaultCropper;
