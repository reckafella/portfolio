/**
 * Image processing and cropping module index
 * Provides easy access to all image-related functionality
 */

export { ImageCropManager } from './ImageCropManager.js';
export { ProfileImageCropper, profileImageCropper } from './ProfileImageCropper.js';
export { ImageUtils } from './ImageUtils.js';

// Re-export for backwards compatibility
export { profileImageCropper as default } from './ProfileImageCropper.js';
