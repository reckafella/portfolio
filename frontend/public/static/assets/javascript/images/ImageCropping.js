/**
 * @deprecated Use ProfileImageCropper instead
 * This file is kept for backwards compatibility
 */

import { profileImageCropper } from './ProfileImageCropper.js';

// Re-export the new cropper for backwards compatibility
export const imageCropper = profileImageCropper;
export default profileImageCropper;

// Legacy global functions - delegate to new system
export function openImageCropModal() {
    return profileImageCropper.openModal();
}

export function clearSelectedFile() {
    return profileImageCropper.clearSelectedFile();
}

export function cropAndUpload() {
    return profileImageCropper.cropAndUpload();
}

export function rotateImage(degrees) {
    return profileImageCropper.rotate(degrees);
}

export function moveImage(x, y) {
    return profileImageCropper.move(x, y);
}

export function zoomImage(ratio) {
    return profileImageCropper.zoom(ratio);
}

export function resetCropper() {
    return profileImageCropper.reset();
}

export function confirmDeleteProfilePic() {
    return profileImageCropper.confirmDeleteProfilePic();
}

export function deleteProfilePic() {
    return profileImageCropper.deleteProfilePic();
}
