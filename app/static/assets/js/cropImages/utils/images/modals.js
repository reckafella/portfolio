// Reset modal to initial state
function resetModal() {
    document.getElementById('fileUploadSection').style.display = 'block';
    document.getElementById('cropSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('cropAndUpload').disabled = true;
    clearSelectedFile();
}

// Open image crop modal
export default function openImageCropModal() {
    const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
    modal.show();
    resetModal();
}
